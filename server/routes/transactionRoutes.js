const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getTransactions,
  getOverdueAlerts,
  getTransactionStats,
  sendReminder,
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All transaction routes require login
router.use(protect);

router.get('/overdue', getOverdueAlerts);
router.get('/stats', authorize('admin'), getTransactionStats);
router.get('/', getTransactions);
router.post('/issue', issueBook);
router.put('/return/:id', returnBook);
router.post('/remind/:id', authorize('admin'), sendReminder); // Admin: send reminder

module.exports = router;
