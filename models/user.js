
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;

const refreshTokens = new Schema({
  token: {
    type: String,
    required: true
  }
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    //same as username
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: false
    },
    emailMessagesEnabled: {
      type: Boolean,
      default: false,
      required: false,
      
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    isAdmin: {
      type: Boolean,
      required: false
    },
    description: {
      type: String
    },
  }
);

userSchema.plugin(uniqueValidator, { message: 'Email already in use.' });
mongoose.model('user', userSchema);

