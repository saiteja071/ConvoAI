const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter, messageLimiter, concurrentLimiter } = require('../middlewares/rateLimiter');

router.use(authMiddleware);
router.use(apiLimiter);

router.post('/', chatController.createChat);
router.get('/', chatController.getChats);
router.get('/:id', chatController.getChatById);
router.post('/:id/message', messageLimiter, chatController.sendMessage);
router.post('/:id/message/stream', messageLimiter, concurrentLimiter, chatController.sendMessageStream);
router.delete('/:id', chatController.deleteChat);

module.exports = router;