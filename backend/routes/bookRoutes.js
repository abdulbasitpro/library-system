const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getBookStats,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, bookSchema } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/stats', protect, authorize('admin'), getBookStats);
router.get('/:id', getBook);

// Admin only
router.post('/', protect, authorize('admin'), validate(bookSchema), createBook);
router.put('/:id', protect, authorize('admin'), validate(bookSchema), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
