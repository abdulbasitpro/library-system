const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorMiddleware');

// @desc    Get all books with advanced search, filtering & pagination
// @route   GET /api/books?search=&category=&author=&yearFrom=&yearTo=&available=&sort=&page=&limit=
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      author,
      yearFrom,
      yearTo,
      available,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (yearFrom || yearTo) {
      query.publishedYear = {};
      if (yearFrom) query.publishedYear.$gte = Number(yearFrom);
      if (yearTo) query.publishedYear.$lte = Number(yearTo);
    }

    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    } else if (available === 'false') {
      query.availableCopies = 0;
    }

    // Sort options
    const sortMap = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt: 1 },
      titleAZ:  { title: 1 },
      titleZA:  { title: -1 },
      yearDesc: { publishedYear: -1 },
      yearAsc:  { publishedYear: 1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);

    const books = await Book.find(query)
      .sort(sortOption)
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

// @desc    Get ISBN lookup from Google Books API
// @route   GET /api/books/isbn-lookup?isbn=
// @access  Private (Admin)
exports.isbnLookup = async (req, res, next) => {
  try {
    const { isbn } = req.query;
    if (!isbn) return next(new AppError('isbn query param is required', 400));

    const fetch = (await import('node-fetch')).default;
    // No API key needed — Books API allows unauthenticated requests (1000/day)
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    const response = await fetch(url, { timeout: 8000 });
    const data = await response.json();

    if (!data.totalItems || data.totalItems === 0 || !data.items?.length) {
      return next(new AppError('Book not found in Google Books for this ISBN', 404));
    }

    const volumeInfo = data.items[0].volumeInfo;

    // Best available cover — prefer the largest thumbnail Google provides
    const imageLinks = volumeInfo.imageLinks || {};
    const coverImageURL =
      imageLinks.extraLarge ||
      imageLinks.large ||
      imageLinks.medium ||
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail ||
      '';

    // Strip trailing &edge=curl / &zoom params that Google adds
    const cleanCover = coverImageURL.replace(/&edge=curl/g, '').replace(/^http:/, 'https:');

    const bookData = {
      title: volumeInfo.title || '',
      author: volumeInfo.authors?.[0] || '',
      isbn,
      publishedYear: volumeInfo.publishedDate
        ? parseInt(volumeInfo.publishedDate.substring(0, 4)) || null
        : null,
      coverImageURL: cleanCover,
      description: volumeInfo.description || '',
      category: volumeInfo.categories?.[0] || '',
      publisher: volumeInfo.publisher || '',
      pageCount: volumeInfo.pageCount || null,
      language: volumeInfo.language || '',
    };

    res.status(200).json({ success: true, bookData });
  } catch (err) {
    next(err);
  }
};

// ─── Helper: map Google Books categories → our enum ──────────────────────────
const VALID_CATEGORIES = [
  'Fiction','Non-Fiction','Science','Technology','History','Biography',
  'Literature','Philosophy','Self-Help','Business','Children','Comics',
  'Art','Religion','Travel','Cooking','Health','General','Other',
];

const normaliseCategory = (raw = '') => {
  if (!raw) return 'General';
  const r = raw.toLowerCase();
  if (r.includes('fiction') && !r.includes('non')) {
    if (r.includes('juvenile') || r.includes('children') || r.includes('young')) return 'Children';
    if (r.includes('comic') || r.includes('graphic')) return 'Comics';
    return 'Fiction';
  }
  if (r.includes('non-fiction') || r.includes('nonfiction'))  return 'Non-Fiction';
  if (r.includes('science') && !r.includes('computer') && !r.includes('tech')) return 'Science';
  if (r.includes('computer') || r.includes('tech') || r.includes('programming') || r.includes('software')) return 'Technology';
  if (r.includes('history'))      return 'History';
  if (r.includes('biograph') || r.includes('memoir') || r.includes('autobiography')) return 'Biography';
  if (r.includes('literatur') || r.includes('poetry') || r.includes('drama')) return 'Literature';
  if (r.includes('philosoph'))    return 'Philosophy';
  if (r.includes('self-help') || r.includes('self help') || r.includes('motivation') || r.includes('personal development')) return 'Self-Help';
  if (r.includes('business') || r.includes('economic') || r.includes('finance') || r.includes('management')) return 'Business';
  if (r.includes('juvenile') || r.includes('children') || r.includes('picture book')) return 'Children';
  if (r.includes('comic') || r.includes('manga') || r.includes('graphic')) return 'Comics';
  if (r.includes('art') || r.includes('design') || r.includes('music') || r.includes('photography')) return 'Art';
  if (r.includes('religio') || r.includes('spiritual') || r.includes('bible') || r.includes('faith')) return 'Religion';
  if (r.includes('travel') || r.includes('geography')) return 'Travel';
  if (r.includes('cook') || r.includes('food') || r.includes('culinary')) return 'Cooking';
  if (r.includes('health') || r.includes('medicine') || r.includes('medical') || r.includes('fitness') || r.includes('wellness')) return 'Health';
  // Exact match fallback
  const exact = VALID_CATEGORIES.find(c => c.toLowerCase() === r);
  if (exact) return exact;
  return 'General';
};

// ─── Helper: parse a Google Books volume into our schema ─────────────────────
const parseGoogleVolume = (item) => {
  const v = item.volumeInfo;
  const imageLinks = v.imageLinks || {};
  const rawCover =
    imageLinks.extraLarge || imageLinks.large || imageLinks.medium ||
    imageLinks.thumbnail || imageLinks.smallThumbnail || '';
  const coverImageURL = rawCover.replace(/&edge=curl/g, '').replace(/^http:/, 'https:');

  const isbn13 = v.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || '';
  const isbn10 = v.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier || '';

  // Truncate description to stay within 2000-char limit
  const rawDesc = v.description || '';
  const description = rawDesc.length > 1950 ? rawDesc.substring(0, 1950) + '…' : rawDesc;

  return {
    googleBooksId: item.id,
    title: v.title || 'Unknown Title',
    author: v.authors?.[0] || 'Unknown Author',
    isbn: isbn13 || isbn10 || undefined,   // undefined → sparse unique index skips it
    publishedYear: v.publishedDate ? parseInt(v.publishedDate.substring(0, 4)) || null : null,
    coverImageURL,
    description,
    category: normaliseCategory(v.categories?.[0]),
    publisher: v.publisher || '',
    pageCount: v.pageCount || null,
    language: v.language || 'en',
  };
};

// @desc    Search Google Books by title/author/keyword
// @route   GET /api/books/google-search?q=&maxResults=12
// @access  Private (Admin)
exports.searchGoogleBooks = async (req, res, next) => {
  try {
    const { q, maxResults = 20 } = req.query;
    if (!q || q.trim().length < 2) {
      return next(new AppError('Query must be at least 2 characters', 400));
    }

    const fetch = (await import('node-fetch')).default;

    // No API key — Books API allows unauthenticated requests (1000/day free)
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${Math.min(Number(maxResults), 40)}&printType=books`;

    console.log('[Google Books] Searching:', q);
    const response = await fetch(url, { timeout: 10000 });
    const data = await response.json();

    // Catch API-level errors (e.g. invalid key, quota exceeded, key restrictions)
    if (data.error) {
      console.error('[Google Books] API error:', data.error.message);
      return next(new AppError(`Google Books API error: ${data.error.message}`, 502));
    }

    console.log('[Google Books] Total results:', data.totalItems, '| Items returned:', data.items?.length ?? 0);

    if (!data.items?.length) {
      return res.status(200).json({ success: true, books: [], total: 0 });
    }

    const books = data.items.map(parseGoogleVolume);
    res.status(200).json({ success: true, books, total: data.totalItems || books.length });

  } catch (err) {
    next(err);
  }
};

// @desc    Import a Google Books result directly into the library database
// @route   POST /api/books/google-import
// @access  Private (Admin)
exports.importGoogleBook = async (req, res, next) => {
  try {
    const { googleBooksId, quantity = 1 } = req.body;
    if (!googleBooksId) return next(new AppError('googleBooksId is required', 400));

    // Check for duplicate by googleBooksId or ISBN
    const fetch = (await import('node-fetch')).default;
    // No API key needed for single volume lookup either
    const url = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`;

    const response = await fetch(url, { timeout: 10000 });
    const item = await response.json();

    if (!item.volumeInfo) return next(new AppError('Book not found on Google Books', 404));

    const parsed = parseGoogleVolume(item);

    // Prevent duplicate imports
    if (parsed.isbn) {
      const existing = await Book.findOne({ isbn: parsed.isbn });
      if (existing) {
        return res.status(200).json({
          success: false,
          message: `"${parsed.title}" already exists in your library`,
          book: existing,
        });
      }
    }

    const qty = Math.max(1, Number(quantity));
    const book = await Book.create({
      ...parsed,
      quantity: qty,
      availableCopies: qty,
    });

    res.status(201).json({ success: true, message: `"${book.title}" imported successfully!`, book });
  } catch (err) {
    next(err);
  }
};

// @desc    Get personalized book recommendations for current user
// @route   GET /api/books/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    // Get user's last 15 returned books
    const history = await Transaction.find({
      user: req.user._id,
      status: 'returned',
    })
      .populate('book', 'category author')
      .sort({ returnDate: -1 })
      .limit(15);

    // Extract already-read book IDs
    const readBookIds = history.map((t) => t.book?._id).filter(Boolean);

    // Get top categories from history
    const categoryCounts = {};
    history.forEach((t) => {
      if (t.book?.category) {
        categoryCounts[t.book.category] = (categoryCounts[t.book.category] || 0) + 1;
      }
    });
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    let books = [];

    if (topCategories.length > 0) {
      books = await Book.find({
        _id: { $nin: readBookIds },
        category: { $in: topCategories },
        availableCopies: { $gt: 0 },
      })
        .sort({ createdAt: -1 })
        .limit(8);
    }

    // Fallback: return popular new arrivals
    if (books.length < 4) {
      const extra = await Book.find({
        _id: { $nin: [...readBookIds, ...books.map((b) => b._id)] },
      })
        .sort({ createdAt: -1 })
        .limit(8 - books.length);
      books = [...books, ...extra];
    }

    res.status(200).json({ success: true, count: books.length, books });
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
