/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION; 🌋 Shutting down...');
//   console.log(err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });
const { server } = require('./utils/connection');

// const { server } = connection;

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection seccessful');
  });

const port = process.env.PORT || 3000;
server.listen(5000, '0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
});

// process.on('unhandledRejection', err => {
//   console.log(err.name, err.message);
//   console.log('UNHANDLED REJECTION; 🌋 Shutting down...');
//   server.close(() => {
//     process.exit(1);
//   });
// });
