const fs = require('fs');
const path = require('path');
const Friend = require('../model/friendModel');
const Chat = require('../model/chatModel');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const { io, userSocketMap } = require('../utils/connection');

exports.getFriendMessages = catchAsync(async (req, res) => {
  // io.on('connection', socket => {
  //   const { userId } = socket.handshake.query;
  //   if (userId) {
  //     userSocketMap[userId] = socket.id;
  //     console.log(`User with id ${userId} connected successfully`);
  //   }
  //     socket.on('Message', async ({toUserId, content }) => {

  // })
  // });
  const { friendRowId } = req.params;
  const messages = await Chat.find({ friendRowId: friendRowId }).sort({
    _id: -1
  });

  res.status(200).json({ messages });
});
exports.getFriendMessagesByUsername = catchAsync(async (req, res) => {
  const { userId, friendUsername } = req.params;
  const friend = await User.findOne({ username: friendUsername });

  const friendRow = await Friend.findOne({
    $or: [
      {
        requestSenderId: { $eq: friend._id },
        requestRecieverId: { $eq: userId }
      },
      {
        requestSenderId: { $eq: userId },
        requestRecieverId: { $eq: friend._id }
      }
    ]
  });

  if (!friendRow._id) {
    res.status(200).json({ messages: [], id: null });
  } else {
    const messages = await Chat.find({ friendRowId: friendRow._id }).sort({
      _id: -1
    });

    res.status(200).json({ messages, id: friendRow._id });
  }
});

exports.getLatestMessage = catchAsync(async (req, res, next) => {
  const { friendRowId } = req.params;
  const latestMessage = await Chat.findOne({ friendRowId }).sort({ _id: -1 });

  res.status(200).json(latestMessage);
});
exports.saveMessage = catchAsync(async (req, res, next) => {
  Chat.create(req.body);

  res.status(200).json({
    status: 'success'
  });
});
exports.sendMessage = async content => {
  let message = await Chat.create(content);
  if (content.referenceType) {
    message = await Chat.findById(message._id);
  }
  return message;
};
exports.updateMessageById = catchAsync(async (req, res, next) => {
  io.on('connection', socket => {
    const { userId } = socket.handshake.query;
    if (userId) {
      userSocketMap[userId] = socket.id;

      console.log(`User with id ${userId} connected successfully`);
    }
  });

  // const { messageId } = req.params;
  // const updatedMessage = req.body;
  // if (!updatedMessage.message.trim())
  //   throw new Error('The message can not be empty');

  // Chat.findByIdAndUpdate(messageId, updatedMessage);

  // res.status(200).json({
  //   status: 'success'
  // });
});
exports.deleteMessageByIds = catchAsync(async (req, res, next) => {
  const messages = req.body;
  const messageIds = messages.map(message => message._id);

  await Chat.deleteMany({
    _id: {
      $in: messageIds
    }
  });

  messages.forEach(message => {
    if (message.messageType === 'file') {
      message.files.forEach(file => {
        fs.unlink(`./uploads/${file.filename}`, e => console.log(e));
      });
    }
  });

  res.status(200).json({
    status: 'success'
  });
});

exports.uploadFiles = catchAsync(async (req, res, next) => {
  const files = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  }));

  if (!req.files) throw new Error('Files not uploaded');
  const message = JSON.parse(req.body.message);

  await Chat.create({ ...message, messageType: 'file', files });

  res.status(200).json({
    status: 'Sucess'
  });
});
exports.downloadFile = (req, res) => {
  const { filename } = req.params;

  const filePath = path.join(
    __dirname
      .split('\\')
      .slice(0, -1)
      .join('\\'),
    'uploads',
    filename
  );
  res.download(filePath);
};
exports.upload = catchAsync(async (req, res, next) => {
  const files = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  }));

  if (!req.files) throw new Error('Files not uploaded');
  const message = JSON.parse(req.body.message);

  return await Chat.create({ ...message, messageType: 'file', files });
});
