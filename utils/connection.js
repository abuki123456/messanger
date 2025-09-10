// eslint-disable-next-line import/no-extraneous-dependencies
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = require('../app');
const Chat = require('../model/chatModel');
const User = require('../model/userModel');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

const userSocketMap = {};

function getRecipientSocket(friendId) {
  return userSocketMap[friendId];
}

io.on('connection', async socket => {
  const { userId } = socket.handshake.query;

  await User.findByIdAndUpdate(userId, { userStatus: 'online' });
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User with id ${userId} connected successfully`);
  }

  socket.on('sendMessage', async ({ toUserId, message: content }) => {
    let message = await Chat.create(content);
    if (content.referenceType) {
      message = await Chat.findById(message._id);
    }
    const recipientSocket = getRecipientSocket(toUserId);

    socket.emit('recieveMessage', {
      message,
      friendRowId: message.friendRowId
    });

    io.to(recipientSocket).emit('recieveMessage', {
      message,
      friendRowId: message.friendRowId
    });
  });

  socket.on(
    'updateMessage',
    async ({ recieverId, messageId, message: content }) => {
      if (!content.message.trim())
        throw new Error('The message can not be empty');
      const recipientSocket = getRecipientSocket(recieverId);
      const { friendRowId } = await Chat.findByIdAndUpdate(messageId, {
        message: content.message
      });
      socket.emit('recieveUpdatedMessage', {
        ...content,
        _id: messageId,
        friendRowId
      });

      io.to(recipientSocket).emit('recieveUpdatedMessage', {
        ...content,
        _id: messageId,
        friendRowId
      });
    }
  );
  socket.on('deleteMessages', async ({ toUserId, messages }) => {
    const recipientSocket = getRecipientSocket(toUserId);
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
    socket.emit('removeDeletedMessages', {
      messageIds,
      friendRowId: messages[0].friendRowId
    });

    io.to(recipientSocket).emit('removeDeletedMessages', {
      messageIds,
      friendRowId: messages[0].friendRowId
    });
  });
  socket.on('add-friend', ({ friend, fid }) => {
    const reciepentSocket = getRecipientSocket(friend._id);
    // socket.emit('add-friend', { friend, fid });
    io.to(reciepentSocket).emit('add-friend', { friend, fid });
  });

  // Video Calling

  socket.on('call-user', data => {
    const friendSocket = getRecipientSocket(data.to);
    io.to(friendSocket).emit('incoming-call', {
      from: userId,
      offer: data.offer
    });
  });

  socket.on('answer-call', data => {
    const friendSocket = getRecipientSocket(data.to);
    io.to(friendSocket).emit('call-answered', {
      from: userId,
      answer: data.answer
    });
  });

  socket.on('ice-candidate', data => {
    const friendSocket = getRecipientSocket(data.to);
    io.to(friendSocket).emit('ice-candidate', { candidate: data.candidate });
  });

  socket.on('end-call', ({ to }) => {
    const friendSocket = getRecipientSocket(to);
    io.to(friendSocket).emit('close');
  });
  socket.on('decline-call', ({ from }) => {
    const friendSocket = getRecipientSocket(from);
    io.to(friendSocket).emit('call-declined');
  });
  socket.on('ignore-call', ({ to }) => {
    const friendSocket = getRecipientSocket(to);
    io.to(friendSocket).emit('ignored-call');
  });

  socket.on('disconnect', async () => {
    await User.findByIdAndUpdate(userId, {
      userStatus: 'offline'
    });
    // Object.keys(userSocketMap).forEach(uid => {
    //   if (userSocketMap[uid] === socket.id) {
    delete userSocketMap[userId];
    //   }
    console.log(`User ${userId} disconnected`);
    // });
  });
});

module.exports.server = server;
module.exports.userSocketMap = userSocketMap;
module.exports.io = io;
