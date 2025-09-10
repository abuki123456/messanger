/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const path = require('path');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const friendRouter = require('./routes/friendRoutes');
const chatRouter = require('./routes/chatRoutes');
const errorHandler = require('./controllers/errorController');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(`${__dirname}/public/`));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(cors('*'));
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // Allow all origins (not recommended for production)
//   // OR restrict to your ngrok URL:
//   // res.header('Access-Control-Allow-Origin', 'https://abc123.ngrok.io');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   console.log('what happened');
//   next();
// });
// app.use(cors({ origin: 'http://localhost:5173/' }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/friends', friendRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;

//3rDClC7XUP1CWf3Z
//TyQQQUrRJcVch7zZ
