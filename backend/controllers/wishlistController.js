const Wishlist = require('../models/Wishlist');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Add book to wishlist
// @route   POST /api/wishlists
// @access  Private (Member)
exports.addToWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return next(new AppError('bookId is required', 400));

    const item = await Wishlist.create({ user: req.user._id, book: bookId });
    const populated = await item.populate('book', 'title author coverImageURL availableCopies category');
    res.status(201).json({ success: true, wishlistItem: populated });
  } catch (err) {
    // Duplicate key = already in wishlist
    if (err.code === 11000) {
      return next(new AppError('Book is already in your wishlist', 409));
    }
    next(err);
  }
};

// @desc    Get current user's wishlist
// @route   GET /api/wishlists/me
// @access  Private
exports.getMyWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate('book', 'title author coverImageURL availableCopies category publishedYear')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, wishlist: items });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/wishlists/:bookId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const deleted = await Wishlist.findOneAndDelete({
      user: req.user._id,
      book: req.params.bookId,
    });
    if (!deleted) return next(new AppError('Book not found in your wishlist', 404));
    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if a book is in the user's wishlist
// @route   GET /api/wishlists/check/:bookId
// @access  Private
exports.checkWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({ user: req.user._id, book: req.params.bookId });
    res.status(200).json({ success: true, inWishlist: !!item });
  } catch (err) {
    next(err);
  }
};
