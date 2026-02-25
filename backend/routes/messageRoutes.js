const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getInbox,
  getSent,
  getConversation,
  getAdmins,
  getMembers,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  clearMessages,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/inbox', getInbox);
router.get('/sent', getSent);
router.get('/admins', getAdmins);
router.get('/members', authorize('admin'), getMembers);
router.get('/conversation/:userId', getConversation);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/clear', clearMessages);
router.delete('/:id', deleteMessage);

module.exports = router;
