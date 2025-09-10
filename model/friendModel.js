const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const friendsSchema = new mongoose.Schema({
  requestSenderId: {
    type: ObjectId,
    required: [true, 'The request sender id can not be empty']
  },
  requestRecieverId: {
    type: ObjectId,
    required: [true, 'The request reciever id can not be empty']
  },
  createdat: {
    type: Date,
    default: Date.now()
  }
});

friendsSchema.index(
  { requestSenderId: 1, requestRecieverId: 1 },
  { unique: true }
);

const Friend = mongoose.model('Friends', friendsSchema);

module.exports = Friend;
