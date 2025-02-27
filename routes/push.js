const { check, validationResult } = require("express-validator");
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Subscription = mongoose.model('subscription');
const auth = require("../middleware/auth");

module.exports = (app) => {

    //Get all subscriptions for the user
    app.get(`/api/push`,auth, async (req, res) => {
      // fetch the subscriptions for user  
        const user = req.user.id;
        let subscriptions = await Subscription.find({user}).sort({createdAt:-1}).select("-__v").select("-subscription").select("-user"); //.populate({path: 'from', select: 'name'}).select("-__v");
        return res.status(200).send( { subscriptions } );
    });

    //Check if user has this subscription
    app.post(`/api/push/subscription`, auth, async (req, res) => {
        
        // fetch the subscriptions for user  
        const subscription = req.body
        try {
            let userSub = await Subscription.findOne({ user: req.user.id, subscription }).sort({createdAt:-1}).select("-__v").select("-subscription").select("-user"); //.populate({path: 'from', select: 'name'}).select("-__v");
            return res.status(200).send( { subscription: userSub } );
        } catch (e) {
            return res.status(404).json({message: "Subscription not found"});
        }
      });

    app.post("/api/push/register", auth, async (req, res) => {

        try {

            const user = req.user.id;
            const { subscription, platform, userAgent } = req.body
            //create subscription to db (.create does not support .select)
            let sub = await Subscription.create({ user, subscription, userAgent, platform });

            const userSub = {
                _id: sub._id,
                userAgent: sub.userAgent,
                platform: sub.platform,
                createdAt: sub.createdAt
            };

            return res.status(201).json( { subscription: userSub } );
        
        } catch (e) {

            console.log('Could not add subscription, already there');
            return res.status(409).json({message: "subscription already stored"});
        }

      })

      //logged in user reply to message
    app.post(`/api/push/send`, async (req, res) => {
        // get the recipients userid, fetch the tokens for that user and send the message
        const { message, to } = req.body;
        const payload = JSON.stringify({
            title: 'Hello!',
            body: 'It works from here.',
        });

        webpush.sendNotification(subscription, payload)
        .then(result => console.log(result))
        .catch(e => console.log(e.stack));

        res.status(200).json({'success': true});
    });
    
    app.delete(`/api/push/:id`, auth, async (req, res) => {

        try {
            //makes sure deletes subscription only for the same user
            const user = req.user.id;
            const { id } = req.params;
            let subscription = await Subscription.deleteOne({_id: id, user});
      
            return res.status(200).send();
      
          } catch (err) {
              console.log(err);
              res.status(500).json({ message: `subscriptionia ei voitu poistaa`});
          }
    });

};