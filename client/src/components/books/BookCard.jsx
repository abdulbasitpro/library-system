import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Copy, BookMarked, Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80';

const CATEGORY_COLORS = {
  Fiction:      'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Non-Fiction':'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Science:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Technology:   'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  History:      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Biography:    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Literature:   'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Philosophy:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Self-Help':  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Business:     'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Children:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Other:        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const BookCard = ({ book, onAction, actionLabel, actionVariant = 'primary', onBorrowed }) => {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isAdmin    = user?.role === 'admin';

  const [borrowing, setBorrowing]   = useState(false);
  const [borrowed, setBorrowed]     = useState(false);
  const [borrowErr, setBorrowErr]   = useState('');
  const [copies, setCopies]         = useState(book.availableCopies);

  const isAvailable = copies > 0;

  // Navigate to detail page — whole card is a click target
  const goToDetail = () => navigate(`/books/${book._id}`);

  // Stop propagation so Borrow button click doesn't navigate
  const handleBorrow = async (e) => {
    e.stopPropagation();
    setBorrowErr('');
    setBorrowing(true);
    try {
      await axiosInstance.post('/transactions/issue', { bookId: book._id });
      setCopies((c) => Math.max(0, c - 1));
      setBorrowed(true);
      if (onBorrowed) onBorrowed(book._id);
    } catch (err) {
      setBorrowErr(err.response?.data?.message || 'Borrow failed');
      // Clear error after 3 s
      setTimeout(() => setBorrowErr(''), 3000);
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && goToDetail()}
      className="card group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label={`View details for ${book.title}`}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={book.coverImageURL || FALLBACK_COVER}
          alt={`Cover of ${book.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = FALLBACK_COVER; }}
          loading="lazy"
        />
        {/* Availability Badge */}
        <div className={`absolute top-2 right-2 badge ${
          isAvailable
            ? 'bg-emerald-500/90 text-white'
            : 'bg-red-500/90 text-white'
        }`}>
          <Copy size={10} />
          {isAvailable ? `${copies} left` : 'Unavailable'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 text-sm leading-snug mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-muted-light dark:text-muted-dark mb-3 flex items-center gap-1">
          <BookOpen size={11} />
          {book.author}
        </p>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`badge text-[10px] ${CATEGORY_COLORS[book.category] || CATEGORY_COLORS.Other}`}>
            {book.category}
          </span>
          {book.publishedYear && (
            <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 text-[10px]">
              {book.publishedYear}
            </span>
          )}
        </div>

        {/* ── Borrow Button (members) / custom action (admins) ── */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          {onAction ? (
            /* Admin / custom action passed from parent */
            <button
              onClick={(e) => { e.stopPropagation(); onAction(book); }}
              className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                actionVariant === 'danger'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {actionLabel || 'Manage'}
            </button>
          ) : !isAdmin ? (
            /* Member Borrow button */
            borrowErr ? (
              <p className="text-[11px] text-red-500 dark:text-red-400 text-center">{borrowErr}</p>
            ) : borrowed ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                <BookMarked size={13} /> Borrowed!
              </div>
            ) : (
              <button
                onClick={handleBorrow}
                disabled={!isAvailable || borrowing}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  isAvailable && !borrowing
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {borrowing ? (
                  <><Loader2 size={12} className="animate-spin" /> Borrowing…</>
                ) : isAvailable ? (
                  <><BookMarked size={12} /> Borrow Book</>
                ) : (
                  'Unavailable'
                )}
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
