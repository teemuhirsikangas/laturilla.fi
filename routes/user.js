const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Plates = mongoose.model('plates');
const Email = mongoose.model('emails');
const Msg = mongoose.model('messages');
const Subscription = mongoose.model('subscription');
const axios = require('axios');

const auth = require("../middleware/auth");

const isEmpty = inputObject => {
  return Object.keys(inputObject).length === 0;
};

module.exports = (app) => {

    app.post('/api/user/signup',
        [
            check('user.name', 'Nimi puuttuu').not().isEmpty(),
            check('user.email', 'sähköposti ei oikeassa muodossa').isEmail(),
            check('user.password', 'Salasanan tarvitsee olla vähintään 8 merkkiä pitkä').isLength({ min: 8 })
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // return only the first error
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            // Check if plate is in correct format
            if(!isEmpty(req.body.vehicle)) {
              if(!req.body.vehicle.plate.includes('-')) {
                return res.status(400).json({ message: 'Rekisterinumero on virheellinen ' });
              }
            }

            const { name, email, password } = req.body.user;
            let plateSavedFailed = true;
            let token;
            try {
                let user = await User.findOne({ email });
                if (user) {
                    return res.status(401).json({ message: "Käyttäjätunnus on jo käytössä" });
                }
                //new user
                user = new User({ name, email, password });
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);

                await user.save();

                const payload = { id: user.id, email: user.email, sub: user.name };

                console.log(`New user signup: ${user.email}, ${user.id} at ${new Date().toISOString()}`);
                const expiresIn = process.env.JWT_TTL | 0 || '365d';
                token = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

                //new vehicle
                if(!isEmpty(req.body.vehicle)) {

                  let vehicle = req.body.vehicle;
                  //add userid to vehicle
                  vehicle.user = user.id;
                  //store the plate number without "-"" for faster search
                  vehicle.plateSearch = vehicle.plate.replace('-', '');

                  const car = await Plates.create(req.body.vehicle);
                  plateSavedFailed = false;
                
                }
                //send activation email link:
                try {
                  await axios.post(`${process.env.BASE_API_URL}/api/email/onboard`, { email });
                } catch (e) {
                  
                  console.log(`could not send onboard email to user ${email}`);
                  console.log(e);
                }

                return res.status(200).json({ token });

            } catch (err) {
                if (plateSavedFailed) {
                  try {
                    console.log('remove user as plate saving failed');
                    let user = await User.findOneAndRemove({ email });
                  } catch (e) {
                    console.log('could not remove user as plate already stored, should not happen, let sigup complete without the vehicle');
                    return res.status(200).json({ token });
                  }
                  return res.status(409).json({ message:`Error in Saving user on signup, plate already registered to another user`});  
                }
                console.log(err.message);
                res.status(500).json({ message:`Error in Saving user on signup ${req.body.user.email} ${err.message}`});
            }
        }
    );

    app.post('/api/user/login',
        [
          check('email', 'Please enter a valid email').isEmail(),
        ],
        async (req, res) => {
          const errors = validationResult(req);
      
          if (!errors.isEmpty()) {
            return res.status(400).json({
              errors: errors.array()
            });
          }
      
          const { email, password } = req.body;
          try {
            let user = await User.findOne({ email });
            if (!user)
              return res.status(401).json({
                message: "User Not Exist"
              });
      
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              return res.status(401).json({
                message: "Incorrect Password"
              });
            }
            const payload = { id: user.id, email: user.email, sub: user.name };
            const expiresIn = process.env.JWT_TTL | 0 || '365d';
            const token = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
            return res.status(200).json({ token });
            
          } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Server Error" });
          }
        }
      );

      app.delete("/api/user/me", auth, async (req, res) => {
      
        try {

          // request.user is getting fetched from Middleware after token authentication
          const user = await User.findById(req.user.id);
          if(user) {
            console.log(`Käyttäjä tilinpoisto: ${req.user.id} ${user.email}`);
          } else {
            console.log(`Käyttäjä tilin on jo poistettu ${req.user.id} `);
            return res.status(200).json({message: 'user removed'});
          }
          // trunkate and use directly findById and .select fields
          const vehicles = await Plates.deleteMany({user: req.user.id});
          let Messages = await Msg.deleteMany({to: req.user.id});
          let subscriptions = await Subscription.deleteMany({user: req.user.id}); //.populate({path: 'from', select: 'name'}).select("-__v");
          const removedUser = await User.findOneAndRemove(req.user.id);

          return res.status(200).json({message: 'user removed'});
        } catch (e) {
          console.log('Could not remove user, error:');
          console.log(e);
          res.status(500).json({ message: "Server Error" });
        }
      });

      app.get("/api/user/download", auth, async (req, res) => {
      
        try {
          // request.user is getting fetched from Middleware after token authentication
          const user = await User.findById(req.user.id).select("-__v").select("-password").select("-_id");
          if(user) {
            console.log(`Käyttäjä tilin lataus: ${req.user.id} ${user.email}`);
          } else {
            console.log(`Käyttäjä tilin on jo poistettu ${req.user.id} `);
            return res.status(200).json({message: 'user removed'});
          }
          // trunkate and use directly findById and .select fields
          const vehicles = await Plates.find({user: req.user.id}).select("-_id").select("-user").select("-__v").select("-plateSearch");

          let messages = await Msg.find({to: req.user.id}).sort({createdAt:-1}).populate({path: 'from', select: 'name -_id'}).select("-__v").select("-_id").select("-to");

          const myData = {
            user,
            vehicles,
            messages
          }

          return res.status(200).json(myData);
        } catch (e) {
          console.log('Could not download userdata:');
          console.log(e);
          res.status(500).json({ message: "Server Error" });
        }
      });

      app.get("/api/user/me", auth, async (req, res) => {
      
        try {

          // request.user is getting fetched from Middleware after token authentication
          const userResult = await User.findById(req.user.id);
          // trunkate and use directly findById and .select fields
          const user = {
              id: userResult.id,
              name: userResult.name,
              email: userResult.email,
              description: userResult.description,
              emailVerified: userResult.emailVerified,
              emailMessagesEnabled: userResult.emailMessagesEnabled
          }
          const vehicles = await Plates.find({user: req.user.id}).select("-__v").select("-user");
        
          const me = {
            user,
            vehicles
          }

          return res.json(me);
        } catch (e) {
          res.send({ message: "Error in Fetching user" });
        }
      });

      app.post("/api/user/me", 
        [
            check('name', 'Nimi puuttuu').not().isEmpty(),
            check('email', 'sähköposti ei oikeassa muodossa').isEmail()
        ],
        auth, async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // return only the first error
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { name, email, password, description , emailVerified, emailMessagesEnabled } = req.body;
            
            try {

                const user = await User.findById(req.user.id);
                if (!user) {
                    return res.status(400).json({ message: "Käyttäjätunnusta ei löydy" });
                }

                //if user changes his email address, reset the verified and message enabled status
                let emailVerifiedStatus = emailVerified;
                let emailMessageStatus = emailMessagesEnabled;
                if(user.email !== email) {

                  emailVerifiedStatus = false;
                  emailMessageStatus = false;
                }

                user.name = name;
                user.email = email;
                user.description = description;
                user.emailVerified = emailVerifiedStatus;
                user.emailMessagesEnabled = emailMessageStatus;

                const update = await user.save();

                const payload = { id: user.id, email: user.email, sub: user.name, description: user.description };
                // store token into db, for logout also?
                const expiresIn = process.env.JWT_TTL | 0 || '365d';
                const token = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
                return res.status(200).json({ token });

            } catch (err) {
                console.log(err.message);
                //send 409, if the email is already in use
                if (err.name == 'ValidationError') {
                  return res.status(409).json({ message:`Error updating user`});  
                }
                return res.status(500).json({ message:`Error in updating user`});
            }
        }
    );

    app.post("/api/user/vehicle", 
    [
        check('plate', 'Rekisterinumero puuttuu').not().isEmpty(),
        check('description', 'kuvaus puuttuu').isEmail(),
        check('allowAnnonMsg', 'allowAnnonMsg puuttuu').not().isBoolean()
    ],
    auth, async (req, res) => {

        try {
          const vehicle = req.body;

          if( !vehicle.plate.includes('-')) {
          return res.status(400).json({message: 'Plate must contains dash "-"'});
          }

          vehicle.user = req.user.id;          
          let plate = await Plates.findOne({plate: req.body.plate});

            if (plate) {
              //check the plate is for this user, can be updated
              //mongoose objetId, convert to string before comparing
              if(plate.user.toString() === vehicle.user.toString())   {
                plate.description = vehicle.description;
                plate.allowAnnonMsg = vehicle.allowAnnonMsg;

                let saved = await plate.save();
                delete saved.user;
                return res.status(200).json(saved);
              }
                return res.status(409).json({ message: "Rekisterunumeroa on rekisteröity tosielle käyttäjälle" });
                //voidaan tallentaa uusi
            } 

            //store the plate number without "-"" for faster search
            vehicle.plateSearch = vehicle.plate.replace('-', '');
            let car = await Plates.create(vehicle);
            delete car.user;
            //const stored = newVehicle.save();
            return res.status(200).json(car);

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message:`Error in Saving user on vehicle ${req.body.email} `});
        }
    }
);

app.delete("/api/user/vehicle/:id", auth, async (req, res) => {

    try {
      //makes sure deletes only plate for the same user
      const user = req.user.id;
      const { id } = req.params;
      let Plate = await Plates.deleteOne({_id: id, user});

      return res.status(200).send();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: `Ajoneuvoa ei voitu poistaa`});
    }
  }
);


//change password from resetpassword email link
app.post('/api/user/emailconfirm',
[
  check('uuid', 'request uuid is missing').not().isEmpty()
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  
  const { uuid } = req.body;

  try {
    
    //find the password request by uuid
    const emailInfo = await Email.findOne({uuid});
    //find the user with the email
    const user = await User.findOne({email: emailInfo.email});
    
    if (!user) {
      return res.status(404).json({ message: "User Not Exist" });
    }
    if (emailInfo.type !== 'ONBOARD') {
      return res.status(409).json({ message: "onboard validation request not valid anymore" });
    }

      user.emailVerified = true;
      await user.save();

      //remove the password reset email id from db, so cannot reset again
      await emailInfo.deleteOne();
      return res.status(200).json({ message: 'email validated' });
    
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Could validate email" });
  }
});

//change password from resetpassword email link
app.post('/api/user/changeforgotpw',
[
  check('password', 'Salasanan tarvitsee olla vähintään 8 merkkiä pitkä').isLength({ min: 8 }),
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  
  const { password, uuid } = req.body;

  try {
    
    //find the password request by uuid
    const emailInfo = await Email.findOne({uuid});
    //find the user with the email
    const user = await User.findOne({email: emailInfo.email});
    
    if (!user) {
      return res.status(404).json({ message: "User Not Exist" });
    }
    if (emailInfo.type !== 'RESET') {
      return res.status(409).json({ message: "password change request not valid anymore" });
    }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //remove the password reset email id from db, so cannot reset again
      await emailInfo.deleteOne();
      return res.status(200).json({ message: 'Password changed OK' });
    
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Could not change password" });
  }
}
);

app.post('/api/user/changepw',
[
  check('password', 'Please enter a valid password, ').isLength({ min: 6 }),
  check('passwordNew', 'Please enter a valid password').isLength({ min: 6 }),
],
auth, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const id = req.user.id;
  const { password, passwordNew } = req.body;

  try {
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({
        message: "User Not Exist"
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect Password"
      });
    }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(passwordNew, salt);
      await user.save();

    return res.status(200).json({ status: 'Password changed OK' });
    
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Could not change password" });
  }
}
);

}
