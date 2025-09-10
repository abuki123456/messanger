const express = require('express');
const friendController = require('../controllers/friendController');

const router = express.Router();

router.route('/:userId').get(friendController.getAllFriends);
router.route('/:friendRowId').get(friendController.getfriendRowById);
router.route('/:userId/:friendId').post(friendController.addFriend);
router
  .route('/:friendUsername/:userId')
  .get(friendController.getFriendByUsername);

module.exports = router;
