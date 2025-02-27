
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;

const messageSchema = new Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    plate: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now 
    },
    type: {
        type: String,
        enum : ['email','push', 'both'],
        required: false
    },
    anonymous: {
        type: Boolean,
        required: true
    }
});

messageSchema.index({'to': 1, 'createdAt': 1}, { unique: true });

messageSchema.plugin(uniqueValidator, { message: 'viestistä puuttuu jotain? todo' });
mongoose.model('messages', messageSchema);