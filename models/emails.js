const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;

const emailSchema = new Schema({
    uuid: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,  //remember to delete previous reset request first
        trim: true,
        dropDups: true
      },
    type: {
        type: String, //RESET, ONBOARD
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '1d',
        default: Date.now 
    },
});

mongoose.model('emails', emailSchema);