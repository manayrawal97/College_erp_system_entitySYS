const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/conversations', ctrl.getConversations);
router.get('/messages/:id', ctrl.getMessages);
router.post('/send', ctrl.sendMessage);

module.exports = router;
