
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;
const user = require('./user');

const plateSchema = new Schema({
    plate: {
        type: String,
        unique: true,
        required: true
    },
    plateSearch: {
        type: String,
        unique: true,
        required: true
    },
    description: String,
    allowAnnonMsg: {
        type: Boolean,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});

// Cretes createdAt and updatedAt
plateSchema.set('timestamps', true);

plateSchema.plugin(uniqueValidator, { message: 'Rekisterinumero jo käytössä.' });
mongoose.model('plates', plateSchema);