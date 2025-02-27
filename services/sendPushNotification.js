const webpush = require('web-push');
const mongoose = require('mongoose');
const Subscription = mongoose.model('subscription');

webpush.setGCMAPIKey(process.env.GCMAPIKEY);

const vapidKeys = {
    publicKey: process.env.PUBLIC_VAPID_KEY,
    privateKey: process.env.PRIVATE_VAPID_KEY
  };
  
webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
   vapidKeys.publicKey,
   vapidKeys.privateKey
);
  
// timeout is a value in milliseconds that specifies how long the library must wait for a response from the push service before timing out (by default undefined).
const TIMEOUT = process.env.WEB_TIMEOUT
// TTL is a value in seconds that describes how long a push message is retained by the push service (by default, four weeks).
const options = {
    TTL: process.env.WEB_PUSH_TTL | 0 || 1209600 //two weeks
};

const sendPush = async (user, subscription, payload) => {

    const id = subscription._id;
    try {
        const res = await webpush.sendNotification(subscription.subscription, payload);
    }
    catch (err) {
        console.log('Push notification sending failed');
        console.log(err.stack);

        if (err.statusCode === 404 || err.statusCode === 410) {
            console.log(`Subscription for user ${user.email} and for id ${id} has expired or is no longer valid, removing subscription: `);
            
            try {
                let subscription = await Subscription.deleteOne({_id: id});
                console.log(user);
            } catch (e) {
                console.log('cannot delete push subscription');
                console.log(e);
            }
        }
    }

};

module.exports = sendPush;