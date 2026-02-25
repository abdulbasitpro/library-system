const express = require('express');
const router = express.Router();
const {
  createBookRequest,
  getMyBookRequests,
  getAllBookRequests,
  updateBookRequest,
  deleteBookRequest,
} = require('../controllers/bookRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createBookRequest);
router.get('/me', getMyBookRequests);
router.get('/', authorize('admin'), getAllBookRequests);
router.patch('/:id', authorize('admin'), updateBookRequest);
router.delete('/:id', deleteBookRequest);

module.exports = router;
