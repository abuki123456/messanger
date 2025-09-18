const express = require('express');
const userController = require('../controllers/userController');

const authController = require('../controllers/authController');
const upload = require('../utils/uploadFiles');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.post('/login', authController.loginUser);
router.get('/username/:username', userController.getUserByUsername);
router.get('/friends/:userId', userController.getAllFriends);
router
  .route('/:userId')
  .get(userController.getUserById)
  .patch(upload.single('photo'), userController.updateUser);
router.post('/friends/:userId/:friendId', userController.addFriend);
router.route('/').get(userController.getAllUsers);
module.exports = router;

