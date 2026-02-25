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
  isbnLookup,
  searchGoogleBooks,
  importGoogleBook,
  getRecommendations,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, bookSchema } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', getBooks);
router.get('/categories', getCategories);

// Protected: named routes MUST come before /:id
router.get('/isbn-lookup',    protect, authorize('admin'), isbnLookup);
router.get('/google-search',  protect, authorize('admin'), searchGoogleBooks);
router.post('/google-import', protect, authorize('admin'), importGoogleBook);
router.get('/recommendations', protect, getRecommendations);
router.get('/stats',          protect, authorize('admin'), getBookStats);

// Public single book
router.get('/:id', getBook);

// Admin only
router.post('/',    protect, authorize('admin'), validate(bookSchema), createBook);
router.put('/:id',  protect, authorize('admin'), validate(bookSchema), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
