const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const sendReminderEmail = require('../config/sendReminderEmail');

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
      // Default to 14 days from now if member doesn't specify a due date
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

// @desc    Return a book
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

    transaction.status = 'returned';
    transaction.returnDate = new Date();
    await transaction.save();

    // Increment available copies & remove from user's borrowedBooks
    await Book.findByIdAndUpdate(transaction.book, { $inc: { availableCopies: 1 } });
    await User.findByIdAndUpdate(transaction.user, {
      $pull: { borrowedBooks: transaction.book },
    });

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
