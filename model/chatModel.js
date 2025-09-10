/* eslint-disable no-unused-vars */
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const chatsSchema = new mongoose.Schema({
  friendRowId: {
    type: ObjectId,
    required: [true, 'The friend row id is required']
  },
  senderId: {
    type: ObjectId,
    required: [true, 'The friend id is required']
  },
  message: {
    type: String,
    default: ''
  },
  messageType: {
    type: String,
    default: 'text'
  },
  caption: {
    type: String,
    default: ''
  },
  files: {
    type: [Object],
    default: []
  },
  reference: {
    type: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Chats'
          // required: false,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
          // required: false
        }
      }
    ]
  },
  referenceType: String,
  status: {
    type: String,
    default: 'not-viewed',
    validator: {
      validate: value => value === 'viewed',
      message: 'The message should be viewed or not viewed'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createAt: {
    type: Date,
    default: Date.now
  }
});

chatsSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'reference.user',
    select: 'firstName lastName'
    // strictPopulate: false
  }).populate({
    path: 'reference.message'
    // strictPopulate: false
  });
  next();
});

chatsSchema.pre('save', function() {
  if (this.files.length === 0 && !this.referenceType && !this.message.trim()) {
    throw Error('The message content can not be empty');
  }
});

const Chat = mongoose.model('Chats', chatsSchema);

module.exports = Chat;
