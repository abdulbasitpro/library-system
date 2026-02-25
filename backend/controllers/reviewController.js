const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Submit a review for a book (only if user has returned it)
// @route   POST /api/reviews
// @access  Private (Member)
exports.createReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;
    if (!bookId || !rating) return next(new AppError('bookId and rating are required', 400));

    // Ensure the user has returned this book before
    const returned = await Transaction.findOne({
      user: req.user._id,
      book: bookId,
      status: 'returned',
    });
    if (!returned) {
      return next(new AppError('You can only review books you have returned', 403));
    }

    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating,
      comment,
    });

    const populated = await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('You have already reviewed this book', 409));
    }
    next(err);
  }
};

// @desc    Get all reviews for a book (with average rating)
// @route   GET /api/reviews/book/:bookId
// @access  Public
exports.getBookReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments({ book: req.params.bookId });
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate average rating
    const ratingAgg = await Review.aggregate([
      { $match: { book: require('mongoose').Types.ObjectId.createFromHexString(req.params.bookId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const averageRating = ratingAgg[0]?.avg || 0;
    const reviewCount = ratingAgg[0]?.count || 0;

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get the current user's review for a book
// @route   GET /api/reviews/my/:bookId
// @access  Private
exports.getMyReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ user: req.user._id, book: req.params.bookId });
    res.status(200).json({ success: true, review: review || null });
  } catch (err) {
    next(err);
  }
};

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private (Owner)
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));
    if (review.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to update this review', 403));
    }
    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();
    const populated = await review.populate('user', 'name avatar');
    res.status(200).json({ success: true, review: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a review (admin or owner)
// @route   DELETE /api/reviews/:id
// @access  Private (Owner | Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));
    if (
      req.user.role !== 'admin' &&
      review.user.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Not authorized to delete this review', 403));
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
