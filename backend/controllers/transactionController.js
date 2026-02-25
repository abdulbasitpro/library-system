const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const sendReminderEmail = require('../config/sendReminderEmail');
const { fulfilNextReservation } = require('./reservationController');

const FINE_PER_DAY = parseFloat(process.env.FINE_PER_DAY) || 5;

// Helper: mark overdue transactions automatically
const markOverdue = async () => {
  await Transaction.updateMany(
    { status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
};

// @desc    Issue a book to a user
// @route   POST /api/transactions/issue
// @access  Admin
exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, userId, dueDate, notes } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return next(new AppError('Book not found', 404));
    if (book.availableCopies < 1) {
      return next(new AppError('No available copies of this book', 400));
    }

    const targetUserId = userId || req.user._id;

    // Prevent duplicate active issue for same user+book
    const existing = await Transaction.findOne({
      user: targetUserId,
      book: bookId,
      status: { $in: ['issued', 'overdue'] },
    });
    if (existing) {
      return next(new AppError('This user already has this book issued', 400));
    }

    const transaction = await Transaction.create({
      user: targetUserId,
      book: bookId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes,
    });

    // Decrement available copies & update user's borrowedBooks
    book.availableCopies -= 1;
    await book.save();

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { borrowedBooks: bookId },
    });

    const populated = await transaction.populate([
      { path: 'book', select: 'title author coverImageURL' },
      { path: 'user', select: 'name email' },
    ]);

    res.status(201).json({ success: true, transaction: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Return a book (with automatic fine calculation)
// @route   PUT /api/transactions/return/:id
// @access  Member (own) | Admin (any)
exports.returnBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(new AppError('Transaction not found', 404));
    if (transaction.status === 'returned') {
      return next(new AppError('Book already returned', 400));
    }

    // Members can only return their OWN transactions
    if (req.user.role !== 'admin' &&
        transaction.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to return this book', 403));
    }

    const returnDate = new Date();
    transaction.status = 'returned';
    transaction.returnDate = returnDate;

    // Calculate fine for overdue returns
    if (returnDate > transaction.dueDate) {
      const daysLate = Math.ceil((returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24));
      transaction.fineAmount = daysLate * FINE_PER_DAY;
    }

    await transaction.save();

    // Increment available copies & remove from user's borrowedBooks
    const book = await Book.findByIdAndUpdate(
      transaction.book,
      { $inc: { availableCopies: 1 } },
      { new: true }
    );
    await User.findByIdAndUpdate(transaction.user, {
      $pull: { borrowedBooks: transaction.book },
    });

    // Fulfil the next reservation in queue if any
    if (book) await fulfilNextReservation(book._id);

    const populated = await transaction.populate([
      { path: 'book', select: 'title author coverImageURL availableCopies' },
      { path: 'user', select: 'name email' },
    ]);

    res.status(200).json({ success: true, transaction: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transactions – admin: all, member: own
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    await markOverdue();

    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    // Members see only their own
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('book', 'title author coverImageURL isbn')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, transactions });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reading history (returned books) for current user
// @route   GET /api/transactions/history/me
// @access  Private
exports.getReadingHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { user: req.user._id, status: 'returned' };
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('book', 'title author coverImageURL category publishedYear')
      .sort({ returnDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get overdue alerts for dashboard
// @route   GET /api/transactions/overdue
// @access  Private
exports.getOverdueAlerts = async (req, res, next) => {
  try {
    await markOverdue();

    const query = { status: 'overdue' };
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const overdueTransactions = await Transaction.find(query)
      .populate('book', 'title author coverImageURL')
      .populate('user', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, count: overdueTransactions.length, overdueTransactions });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transaction stats for admin dashboard
// @route   GET /api/transactions/stats
// @access  Admin
exports.getTransactionStats = async (req, res, next) => {
  try {
    await markOverdue();
    const total = await Transaction.countDocuments();
    const issued = await Transaction.countDocuments({ status: 'issued' });
    const returned = await Transaction.countDocuments({ status: 'returned' });
    const overdue = await Transaction.countDocuments({ status: 'overdue' });

    res.status(200).json({ success: true, stats: { total, issued, returned, overdue } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get fines summary for current user
// @route   GET /api/transactions/fines/me
// @access  Private
exports.getMyFines = async (req, res, next) => {
  try {
    const fines = await Transaction.find({
      user: req.user._id,
      fineAmount: { $gt: 0 },
    })
      .populate('book', 'title author coverImageURL')
      .sort({ createdAt: -1 });

    const totalUnpaid = fines
      .filter((t) => !t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    const totalPaid = fines
      .filter((t) => t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    res.status(200).json({ success: true, totalUnpaid, totalPaid, fines });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin gets fines summary for all users
// @route   GET /api/transactions/fines/all
// @access  Admin
exports.getAllFines = async (req, res, next) => {
  try {
    const fines = await Transaction.find({ fineAmount: { $gt: 0 } })
      .populate('book', 'title author')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = fines
      .filter((t) => t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    const totalPending = fines
      .filter((t) => !t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    res.status(200).json({ success: true, totalRevenue, totalPending, fines });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a fine as paid
// @route   PATCH /api/transactions/:id/pay-fine
// @access  Admin
exports.payFine = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return next(new AppError('Transaction not found', 404));
    if (transaction.fineAmount === 0) return next(new AppError('No fine on this transaction', 400));
    if (transaction.finePaid) return next(new AppError('Fine already paid', 400));

    transaction.finePaid = true;
    await transaction.save();

    const populated = await transaction.populate([
      { path: 'book', select: 'title author' },
      { path: 'user', select: 'name email' },
    ]);

    res.status(200).json({ success: true, transaction: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Analytics overview for admin
// @route   GET /api/transactions/analytics/overview
// @access  Admin
exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    await markOverdue();

    const [totalBooks, totalUsers, activeIssued, overdueCount] = await Promise.all([
      require('../models/Book').countDocuments(),
      User.countDocuments({ role: 'member' }),
      Transaction.countDocuments({ status: 'issued' }),
      Transaction.countDocuments({ status: 'overdue' }),
    ]);

    // Monthly borrow trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Transaction.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top 5 most borrowed books
    const topBooks = await Transaction.aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      { $project: { count: 1, 'book.title': 1, 'book.author': 1, 'book.coverImageURL': 1 } },
    ]);

    // Top categories
    const topCategories = await Transaction.aggregate([
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookData',
        },
      },
      { $unwind: '$bookData' },
      { $group: { _id: '$bookData.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Fine revenue
    const fineAgg = await Transaction.aggregate([
      { $match: { fineAmount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: ['$finePaid', '$fineAmount', 0] } },
          totalPending: { $sum: { $cond: ['$finePaid', 0, '$fineAmount'] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalBooks,
        totalUsers,
        activeIssued,
        overdueCount,
        fineRevenue: fineAgg[0]?.totalRevenue || 0,
        finePending: fineAgg[0]?.totalPending || 0,
      },
      monthlyTrends,
      topBooks,
      topCategories,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin sends a manual return reminder to a borrower
// @route   POST /api/transactions/remind/:id
// @access  Admin
exports.sendReminder = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('book', 'title author');

    if (!transaction) return next(new AppError('Transaction not found', 404));
    if (transaction.status === 'returned') {
      return next(new AppError('This book has already been returned', 400));
    }

    const type = transaction.status === 'overdue' ? 'overdue' : 'reminder';

    await sendReminderEmail({
      user:    transaction.user,
      book:    transaction.book,
      dueDate: transaction.dueDate,
      type,
    });

    res.status(200).json({
      success: true,
      message: `Reminder sent to ${transaction.user.email}`,
    });
  } catch (err) {
    console.error('Manual Reminder Error:', err);
    next(err);
  }
};
