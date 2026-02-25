const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Reserve a book (only when unavailable)
// @route   POST /api/reservations
// @access  Private (Member)
exports.createReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return next(new AppError('bookId is required', 400));

    const book = await Book.findById(bookId);
    if (!book) return next(new AppError('Book not found', 404));

    if (book.availableCopies > 0) {
      return next(new AppError('Book is currently available — please borrow it directly', 400));
    }

    const reservation = await Reservation.create({ user: req.user._id, book: bookId });
    const populated = await reservation.populate('book', 'title author coverImageURL');
    res.status(201).json({ success: true, reservation: populated });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('You already have a pending reservation for this book', 409));
    }
    next(err);
  }
};

// @desc    Get current user's reservations
// @route   GET /api/reservations/me
// @access  Private
exports.getMyReservations = async (req, res, next) => {
  try {
    // Auto expire old pending reservations
    await Reservation.updateMany(
      { status: 'pending', expiresAt: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );

    const reservations = await Reservation.find({ user: req.user._id })
      .populate('book', 'title author coverImageURL availableCopies category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reservations (admin)
// @route   GET /api/reservations
// @access  Admin
exports.getAllReservations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Reservation.countDocuments(query);

    const reservations = await Reservation.find(query)
      .populate('book', 'title author coverImageURL')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, reservations });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel own reservation
// @route   PATCH /api/reservations/:id/cancel
// @access  Private (Owner | Admin)
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return next(new AppError('Reservation not found', 404));

    if (
      req.user.role !== 'admin' &&
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Not authorized', 403));
    }

    if (reservation.status !== 'pending') {
      return next(new AppError('Only pending reservations can be cancelled', 400));
    }

    reservation.status = 'cancelled';
    await reservation.save();
    res.status(200).json({ success: true, reservation });
  } catch (err) {
    next(err);
  }
};

// @desc    Fulfil the first pending reservation for a book (called internally on book return)
// @route   Internal helper
exports.fulfilNextReservation = async (bookId) => {
  try {
    const next = await Reservation.findOne({
      book: bookId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: 1 });

    if (next) {
      next.status = 'fulfilled';
      await next.save();
    }
    return next;
  } catch (_) {
    // Non-critical — log and continue
    console.error('Error fulfilling reservation:', _);
  }
};
