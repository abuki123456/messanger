const fs = require('fs');
const Friend = require('../model/friendModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    results: users.length,
    status: 'sucess',
    data: users
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.status(200).json({
    status: 'Sucess',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profilePhoto: user.profilePhoto
    }
  });
});
exports.getAllFriends = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.status(200).json(user.friends);
});
exports.addFriend = catchAsync(async (req, res, next) => {
  const { userId, friendId } = req.params;

  if (
    await Friend.findOne({
      $or: [
        {
          requestSenderId: userId,
          requestRecieverId: friendId
        },
        {
          requestSenderId: friendId,
          requestRecieverId: userId
        }
      ]
    })
  ) {
    return new AppError('You are already Friend', 400);
  }
  const friendDocument = await Friend.create({
    requestSenderId: userId,
    requestRecieverId: friendId
  });
  await User.findByIdAndUpdate(userId, {
    $push: {
      friends: {
        friend: friendId,
        fid: friendDocument._id
      }
    }
  });
  await User.findByIdAndUpdate(friendId, {
    $push: {
      friends: {
        friend: userId,
        fid: friendDocument._id
      }
    }
  });

  // user.friends.push(friendRow._id);
  // friend.friends.push(friendRow._id);
  // await User.findByIdAndUpdate(userId, {
  //   friends: user.friends
  // });
  // await User.findByIdAndUpdate(friendId, {
  //   friends: friend.friends
  // });

  res.status(200).json({ friendDocument });
});

exports.getUserByUsername = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const users = await User.find({
    username: {
      $regex: username,
      $options: 'i'
    }
  }).select('');

  res.status(200).json({
    status: 'Sucess',
    users
  });
});
// _id: users._id,
//     firstName: users.firstName,
//     lastName: users.lastName,
//     username: users.username,
//     userStatus: users.username
exports.updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const editedUser = { ...req.body };
  if (req.file) {
    const user = await User.findById(userId);
    fs.unlink(`./uploads/${user.profilePhoto}`, e => console.log(e));
    editedUser.profilePhoto = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(userId, editedUser, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    updatedUser: user
  });
});

exports.uploadFiles = catchAsync(async (req, res, next) => {
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  res.status(200).json({
    status: 'Sucess'
  });
});

