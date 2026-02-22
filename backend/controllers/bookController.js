const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Get all books with search & pagination
// @route   GET /api/books?search=&category=&page=&limit=
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      books,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return next(new AppError('Book not found', 404));
    res.status(200).json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

// @desc    Create book
// @route   POST /api/books
// @access  Admin
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Admin
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return next(new AppError('Book not found', 404));
    res.status(200).json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return next(new AppError('Book not found', 404));

    // Check if book has active transactions
    const activeTransaction = await Transaction.findOne({
      book: req.params.id,
      status: 'issued',
    });
    if (activeTransaction) {
      return next(new AppError('Cannot delete book with active issues', 400));
    }

    await book.deleteOne();
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get book categories (distinct)
// @route   GET /api/books/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct('category');
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// @desc    Get book stats (admin dashboard)
// @route   GET /api/books/stats
// @access  Admin
exports.getBookStats = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalCopies = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' }, available: { $sum: '$availableCopies' } } },
    ]);
    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        totalCopies: totalCopies[0]?.total || 0,
        availableCopies: totalCopies[0]?.available || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
