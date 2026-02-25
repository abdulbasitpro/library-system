const express = require('express');
const router = express.Router();
const {
  createReview,
  getBookReviews,
  getMyReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public: get reviews for a book
router.get('/book/:bookId', getBookReviews);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/my/:bookId', getMyReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
