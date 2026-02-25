const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,   // allows multiple docs with no ISBN
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Literature',
        'Philosophy',
        'Self-Help',
        'Business',
        'Children',
        'Comics',
        'Art',
        'Religion',
        'Travel',
        'Cooking',
        'Health',
        'General',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
    },
    coverImageURL: {
      type: String,
      default: '',
    },
    publishedYear: {
      type: Number,
    },
    googleBooksId: {
      type: String,
      default: '',
    },
    publisher: {
      type: String,
      default: '',
    },
    pageCount: {
      type: Number,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  { timestamps: true }
);

// Auto-set availableCopies = quantity on creation if not provided
bookSchema.pre('save', function (next) {
  if (this.isNew && this.availableCopies === undefined) {
    this.availableCopies = this.quantity;
  }
  next();
});

// Text index for full-text search
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
