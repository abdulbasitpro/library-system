const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
      default: '',
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin note cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookRequest', bookRequestSchema);
