/* eslint-disable import/no-extraneous-dependencies */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell your First name'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Pleqase provide your email'],
      unique: true,
      lowerCase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(el) {
          return this.password === el;
        },
        message: 'Password are not the same'
      }
    },
    lastName: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    userStatus: {
      type: String,
      default: 'online'
    },
    friends: {
      type: [
        {
          friend: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          fid: String
        }
      ],
      default: []
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    createAt: {
      type: Date,
      default: Date.now(),
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'friends.friend',
    select: '-email -password -friends'
  });
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async (userPassword, correctPassword) => {
  return await bcrypt.compare(userPassword, correctPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
