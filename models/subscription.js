
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;

//push notification subscriptions

const subscriptionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    subscription: {
        type: Object,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now 
    },
    userAgent: {
        type: String
    },
    platform: {
        type: String
    }
});

subscriptionSchema.index({'user': 1, 'createdAt': 1}, { unique: true });

subscriptionSchema.plugin(uniqueValidator, { message: 'Subscription jo olemassa tälle browserille, ei lisätä' });
mongoose.model('subscription', subscriptionSchema);