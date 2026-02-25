const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getTransactions,
  getReadingHistory,
  getOverdueAlerts,
  getTransactionStats,
  getMyFines,
  getAllFines,
  payFine,
  getAnalyticsOverview,
  sendReminder,
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All transaction routes require login
router.use(protect);

// Analytics (admin only)
router.get('/analytics/overview', authorize('admin'), getAnalyticsOverview);

// Overdue & stats
router.get('/overdue', getOverdueAlerts);
router.get('/stats', authorize('admin'), getTransactionStats);

// Reading history
router.get('/history/me', getReadingHistory);

// Fines
router.get('/fines/me', getMyFines);
router.get('/fines/all', authorize('admin'), getAllFines);
router.patch('/:id/pay-fine', authorize('admin'), payFine);

// Main CRUD
router.get('/', getTransactions);
router.post('/issue', issueBook);
router.put('/return/:id', returnBook);
router.post('/remind/:id', authorize('admin'), sendReminder);

module.exports = router;
