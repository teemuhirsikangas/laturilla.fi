const { check, validationResult } = require("express-validator");
const mongoose = require('mongoose');
const Msg = mongoose.model('messages');
const Plates = mongoose.model('plates');
const User = mongoose.model('user');
const Subscription = mongoose.model('subscription');
const sendPush = require('../services/sendPushNotification');
const sendEmail = require('../services/sendEmailReplyMessage');
const axios = require('axios');

const auth = require("../middleware/auth");

const sendPushToUser = async (user, senderName, message) => {

  let subscriptions = await Subscription.find({user}).sort({createdAt:-1});
  let title = 'Sinulle on uusi viesti';
  if(senderName) {
    title = `${senderName} lähetti sinulle viestin`
  }
  
  const payload = JSON.stringify({
    title, //laturilla.fi
    body: message
  });

  for (let i = 0; i < subscriptions.length; i++) {    
  
    //todo: maybe use promice chain? using await inside for is nasty?
    await sendPush(user, subscriptions[i], payload );
  
  }

};

module.exports = (app) => {

  //Sends test push notification from the user to himself
  app.post(`/api/messages/test`, auth, async (req, res) => {

    let fromUser = await User.findById(req.user.id);
    sendPushToUser(fromUser, fromUser.name, 'Hei!, Tämä on testiviesti, laturilla.fi');
    return res.status(201).send({ message: 'Push viesti lähetetty kaikille laitteillesi'} );

  });

  app.get(`/api/messages`, auth, async (req, res) => {
    // fetch messages intended for the user, get also name from the sender
    let Messages = await Msg.find({to: req.user.id}).sort({createdAt:-1}).populate({path: 'from', select: 'name'}).select("-__v");
    return res.status(200).send(Messages);
  });

  //send messages with logged in user
  app.post(`/api/messages`,
  [
    check('message', 'viesti puuttuu').not().isEmpty(),
    check('plate', 'Rekisterinumero puuttuu').not().isEmpty()
  ],
  auth, async (req, res) => {

    try {
      const { message, plate } = req.body;
      let Plate = await Plates.findOne({plate: plate}).populate('user');

      const envelope = {
        from: req.user.id,
        anonymous: false,
        to: Plate.user,
        plate: plate,
        message: message
      }


      let Messages = await Msg.create(envelope);

      // no await as this can be async, no need to wait sending status, it fails or works
      let fromUser = await User.findById(req.user.id);

      //send email message to recipient if it is enabled
      if(Plate.user.emailMessagesEnabled && process.env.DISABLE_EMAIL_SENDING === 'false') {

        const emailMessage = {
          anonymous: false,
          to: Plate.user.email,
          plate: '',
          message: message,
          fromUser: fromUser.name
        }

        try {
          let res = await axios.post(`${process.env.BASE_API_URL}/api/email/sendreply`, emailMessage);

        } catch (e) {
          console.log('could not send email reply message:');
          console.log(e);
        }

      }

      sendPushToUser(Plate.user, fromUser.name, message);

      return res.status(201).send({ message: 'Viesti lähetetty käyttäjälle OK'} );

    } catch (err) {
      console.log('could not add new Messages');
      console.log(err);
      return res.status(403).send({
        message: 'could not send message'
      })
    }
  });

  //logged in user reply to message
  app.post(`/api/messages/reply`,
  [
    check('message', 'viesti puuttuu').not().isEmpty(),
    check('to', 'vastaan ottajan puuttuu').not().isEmpty()
  ],
  auth, async (req, res) => {

    try {
      const { message, to } = req.body;
      
      //check the user exists
      let user = await User.findById({_id: to});

      const envelope = {
        from: req.user.id,
        anonymous: false,
        to: user._id,
        plate: '',
        message: message
      }

      let Messages = await Msg.create(envelope);

      let fromUser = await User.findById(req.user.id);
      let name;
      let anom = false; //not used yet
      if(fromUser && fromUser.name) {
        name = fromUser.name
      } else {
        name = 'Kirjautumaton käyttäjä'
        anom = true;
      }

      //send email message to recipient if it is enabled
      if(user.emailMessagesEnabled && process.env.DISABLE_EMAIL_SENDING === 'false') {

        const emailMessage = {
          anonymous: anom,
          to: user.email,
          plate: '',
          message: message,
          fromUser: name
        }

        try {
          let res = await axios.post(`${process.env.BASE_API_URL}/api/email/sendreply`, emailMessage);

        } catch (e) {
          console.log('could not send email reply message:');
          console.log(e);
        }
      }

      //no need for await, as this can fail
      sendPushToUser(envelope.to, fromUser.name, message);

      return res.status(201).send({ message: 'Viesti lähetetty käyttäjälle OK'} );

    } catch (err) {
      console.log('could not add new Messages');
      console.log(err);
      return res.status(403).send({
        message: 'could not send message'
      })
    }
  });

  //send ANON messages if allowed for the vehicle
  app.post(`/api/messages/anon`,
  [
    check('message', 'viesti puuttuu').not().isEmpty(),
    check('plate', 'Rekisterinumero puuttuu').not().isEmpty()
  ],
  async (req, res) => {
   
    const { message, plate } = req.body;
    try {
      //double check first that user allows to send anon messages to him/her
      let Plate = await Plates.findOne({plate: plate}).populate('user');

      const envelope = {
        from: Plate.user, //as anom, set the recipient as the from field also
        anonymous: true,
        to: Plate.user,
        plate: plate,
        message: message
      }

      if(Plate.allowAnnonMsg) {
        let Messages = await Msg.create(envelope);

        //check if emails message are allowed and send email
        if(Plate.user.emailMessagesEnabled && process.env.DISABLE_EMAIL_SENDING === 'false') {

          const emailMessage = {
            anonymous: true,
            to: Plate.user.email,
            plate: '',
            message: message,
            fromUser: 'Kirjautumaton käyttäjä'
          }
  
          try {
            let res = await axios.post(`${process.env.BASE_API_URL}/api/email/sendreply`, emailMessage);
  
          } catch (e) {
            console.log('could not send email reply message:');
            console.log(e);
          }
        }

        sendPushToUser(envelope.to, null, message);

        return res.status(201).send({ message: 'Viesti lähetetty käyttäjälle nimettömästi, OK'} );
      }
      return res.status(403).send({ message: 'Vastaan ottaja ei salli nimettömiä viestejä'} );

    } catch (err) {
      console.log('could not add new Messages');
      console.log(err);
      return res.status(403).send({
        message: 'could not send new Message'
      })
    }
});

  app.delete(`/api/messages/:id`, auth, async (req, res) => {
    
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({message: 'invalid message id'});
    }

    // remove message by id, if it's only owned by the recipient user
    try {
      const user = mongoose.Types.ObjectId(req.user.id);
      let Messages = await Msg.deleteOne({_id: id, to: user});
      return res.status(200).send({ message: 'viesti poistettu onnistuneesti' });

    } catch (e) {

      console.log(e);
      return res.status(400).send({message: 'Viestiä ei voitu poistaa'});
    }

   });

}
