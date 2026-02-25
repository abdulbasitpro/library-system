const BookRequest = require('../models/BookRequest');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Member submits a book request
// @route   POST /api/book-requests
// @access  Private (Member)
exports.createBookRequest = async (req, res, next) => {
  try {
    const { title, author, isbn, reason } = req.body;
    if (!title) return next(new AppError('Book title is required', 400));

    const request = await BookRequest.create({
      user: req.user._id,
      title,
      author,
      isbn,
      reason,
    });

    const populated = await request.populate('user', 'name email');
    res.status(201).json({ success: true, bookRequest: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's own requests
// @route   GET /api/book-requests/me
// @access  Private
exports.getMyBookRequests = async (req, res, next) => {
  try {
    const requests = await BookRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, bookRequests: requests });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin gets all book requests
// @route   GET /api/book-requests
// @access  Admin
exports.getAllBookRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BookRequest.countDocuments(query);

    const requests = await BookRequest.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, bookRequests: requests });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin approves or rejects a book request
// @route   PATCH /api/book-requests/:id
// @access  Admin
exports.updateBookRequest = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError('Status must be approved or rejected', 400));
    }

    const request = await BookRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!request) return next(new AppError('Book request not found', 404));
    res.status(200).json({ success: true, bookRequest: request });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a book request (admin or owner)
// @route   DELETE /api/book-requests/:id
// @access  Private
exports.deleteBookRequest = async (req, res, next) => {
  try {
    const request = await BookRequest.findById(req.params.id);
    if (!request) return next(new AppError('Book request not found', 404));

    if (
      req.user.role !== 'admin' &&
      request.user.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Not authorized', 403));
    }

    await request.deleteOne();
    res.status(200).json({ success: true, message: 'Book request deleted' });
  } catch (err) {
    next(err);
  }
};
