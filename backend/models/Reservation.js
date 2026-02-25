const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled', 'expired'],
      default: 'pending',
    },
    // Auto-expire after 7 days if not fulfilled
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// A user can only have ONE pending reservation per book
reservationSchema.index(
  { user: 1, book: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('Reservation', reservationSchema);
