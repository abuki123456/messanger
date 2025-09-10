const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');

const authController = require('../controllers/authController');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.route('/signup').post(authController.signup);
router.post('/login', authController.loginUser);
router.get('/username/:username', userController.getUserByUsername);
router.get('/friends/:userId', userController.getAllFriends);
router
  .route('/:userId')
  .get(userController.getUserById)
  .patch(userController.updateUser);
router.post('/friends/:userId/:friendId', userController.addFriend);
router.route('/').get(userController.getAllUsers);
router.post('/uploads', upload.single('file'), userController.uploadFiles);
module.exports = router;
