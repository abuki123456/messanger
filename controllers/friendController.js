/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// const { ObjectId } = require('mongodb');
const { ObjectId } = require('mongodb');
const Friend = require('../model/friendModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');

exports.getAllFriends = catchAsync(async (req, res) => {
  const { userId } = req.params;
  // const user = await User.aggregate([
  //   {
  //     $lookup: {
  //       from: 'friends',
  //       localField: 'friends',
  //       foreignField: '_id',
  //       as: 'friends_docs'
  //     }
  //   },

  // {
  //   $lookup: {
  //     from: 'users',
  //     localField: 'friends_docs.requestSenderId',
  //     foreignField: '_id',
  //     as: 'friendsSender'
  //   }
  // },
  // {
  //   $lookup: {
  //     from: 'users',
  //     localField: 'friends_docs.requestRecieverId',
  //     foreignField: '_id',
  //     as: 'friendsReciever'
  //   }
  // },

  // {
  //   $addFields: { 'friendsSender.id': '$friends_docs' }
  // },
  // {
  //   $addFields: { 'friendsReciever.id': '$friends_docs._id' }
  // },
  // {
  //   $match: {
  //     _id: {
  //       $eq: new ObjectId(userId)
  //     }
  //   }
  // },
  // {
  //   $project: {
  //     friends_docs: 0,
  //     email: 0,
  //     password: 0,
  //     // 'myFriends._id': 0,
  //     'friendsSender.email': 0,
  //     'friendsSender.password': 0,
  //     'friendsSender.friends': 0,
  //     'friendsSender.createAt': 0,
  //     'friendsSender.__v': 0,
  //     'friendsReciever.email': 0,
  //     'friendsReciever.password': 0,
  //     'friendsReciever.friends': 0,
  //     'friendsReciever.createAt': 0,
  //     'friendsReciever.__v': 0
  //   }
  // }

  // ]);
  // for (const [id, friend] of user[0].friendsSender.entries()) {
  //   if (String(friend._id) === userId) {
  //     delete user[0].friendsSender[id];
  //   }
  //   delete friend._id;
  // }
  // for (const [id, friend] of user[0].friendsReciever.entries()) {
  //   if (String(friend._id) === userId) {
  //     delete user[0].friendsReciever[id];
  //   }
  //   delete friend._id;
  // }

  // const friends = [...user[0].friendsReciever, ...user[0].friendsSender].filter(
  //   friend => friend
  // );

  const friendsUnfiltered = await Friend.find({
    $or: [
      { requestSenderId: { $eq: userId } },
      { requestRecieverId: { $eq: userId } }
    ]
  });
  const friends = [];
  for (const friendUnfiltered of friendsUnfiltered) {
    const friend = await User.findById(
      String(friendUnfiltered.requestSenderId) === userId
        ? friendUnfiltered.requestRecieverId
        : friendUnfiltered.requestSenderId
    );
    friends.push({
      id: friendUnfiltered._id,
      friendId: friend._id,
      firstName: friend.firstName,
      lastName: friend.lastName,
      userStatus: friend.userStatus,
      username: friend.username,
      profilePhoto: friend.profilePhoto
    });
  }
  // const friends = user;
  //   $or: [
  //     { requestSenderId: { $eq: userId } },
  //     { requestRecieverId: { $eq: userId } }
  //   ]
  // });

  // const friends = await Friend.aggregate([
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'requestRecieverId',
  //       foreignField: '_id',
  //       as: 'Test'
  //     }
  //   },

  //   {
  //     $match: {
  //       $or: [
  //         { requestSenderId: { $eq: new ObjectId(userId) } },
  //         { requestRecieverId: { $eq: new ObjectId(userId) } }
  //       ]
  //     }
  //   }
  // ]);
  res.status(200).json({
    results: friends.length,
    status: 'sucess',
    friends
  });
});
exports.getFriendByUsername = catchAsync(async (req, res, next) => {
  const { friendUsername, userId } = req.params;

  const friend = await User.findOne({
    username: {
      $eq: friendUsername
    }
  });

  const friendRow = await Friend.findOne({
    $or: [
      {
        requestSenderId: { $eq: new ObjectId(userId) },

        requestRecieverId: { $eq: new ObjectId(friend._id) }
      },

      {
        requestSenderId: { $eq: new ObjectId(friend._id) },
        requestRecieverId: { $eq: new ObjectId(userId) }
      }
    ]
  });

  res.status(200).json({
    status: 'Sucess',
    id: friendRow ? friendRow._id : null
  });
});

exports.getfriendRowById = catchAsync(async (req, res, next) => {
  const { friendRowId } = req.params;
  const friendRow = await Friend.findById(friendRowId);

  res.status(200).json({
    status: 'Sucess',
    data: { friendRow: friendRow }
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const { userId, friendId } = req.params;
  const friendRow = await Friend.create({
    requestSenderId: userId,
    requestRecieverId: friendId
  });

  res.status(200).json({
    status: 'Sucess',
    friendRow,
    message: 'The friend is seccessfully added'
  });
});
