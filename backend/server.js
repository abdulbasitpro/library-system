require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectDB = require('./config/db');
const startReminderCron = require('./config/reminderCron');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes        = require('./routes/authRoutes');
const bookRoutes        = require('./routes/bookRoutes');
const userRoutes        = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const wishlistRoutes    = require('./routes/wishlistRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const bookRequestRoutes = require('./routes/bookRequestRoutes');
const messageRoutes     = require('./routes/messageRoutes');

// Connect to MongoDB then start cron
connectDB();
startReminderCron();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/books',         bookRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/wishlists',     wishlistRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/reservations',  reservationRoutes);
app.use('/api/book-requests', bookRequestRoutes);
app.use('/api/messages',      messageRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
