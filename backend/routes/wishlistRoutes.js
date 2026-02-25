const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addToWishlist);
router.get('/me', getMyWishlist);
router.get('/check/:bookId', checkWishlist);
router.delete('/:bookId', removeFromWishlist);

module.exports = router;
