const express = require('express');
const chatController = require('../controllers/chatController');
const upload = require('../utils/uploadFiles');

const router = express.Router();

router
  .route('/')
  .post(chatController.saveMessage)
  .delete(chatController.deleteMessageByIds);
router.route('/:messageId').patch(chatController.updateMessageById);
// .delete(chatController.deleteMessageByIds);
// router.route('/:senderId/:recieverId').post(chatController.saveMessages);
router.route('/download/:filename').get(chatController.downloadFile);
router
  .route('/latest-message/:friendRowId')
  .get(chatController.getLatestMessage);
router
  .route('/:friendUsername/:userId')
  .get(chatController.getFriendMessagesByUsername);
router.route('/:friendRowId').get(chatController.getFriendMessages);
router.post('/uploads', upload.array('files'), chatController.uploadFiles);
// router.route('').get((req, res) => {
//   req.params
// });

// router
//   .route('/:messageId')
//   .patch(chatController.updatechat)
//   .delete(chatController.deletechat);

module.exports = router;
