/* eslint-disable no-unused-vars */
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  res.status(200).json({
    status: 'Success',
    data: {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        friends: newUser.friends,
        username: newUser.username
      }
    }
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const loginedUser = await User.findOne({
    email
  }).select('+password');

  if (
    !(
      loginedUser && loginedUser.correctPassword(password, loginedUser.password)
    )
  ) {
    throw new AppError('Either email or password is incorrect', 406);
  }
  res.status(201).json({
    status: 'Success',
    data: {
      loginedUser
    }
  });
});
