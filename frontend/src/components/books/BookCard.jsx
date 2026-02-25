import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Heart } from 'lucide-react';
import Button from '../common/Button';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../hooks/useAuth';

// Deterministic gradient from book title (used as fallback)
const COVER_GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-indigo-500 to-blue-700',
  'from-cyan-500 to-teal-700',
  'from-emerald-500 to-green-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-700',
  'from-sky-500 to-indigo-700',
  'from-fuchsia-500 to-violet-700',
];

const getCoverGradient = (title = '') => {
  const sum = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return COVER_GRADIENTS[sum % COVER_GRADIENTS.length];
};

const BookCard = ({ book, onBorrow, onReserve, isAdmin, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const imageUrl = book.coverImageURL;
  const showImage = imageUrl && !imgError;
  const isAvailable = (book.availableCopies ?? 0) > 0;
  const gradient = getCoverGradient(book.title);
  const category = book.category || book.genre || '';

  // Check wishlist status on mount (members only)
  useEffect(() => {
    if (user?.role === 'member' && book._id) {
      axiosInstance.get(`/wishlists/check/${book._id}`)
        .then(({ data }) => setInWishlist(data.inWishlist))
        .catch(() => {});
    }
  }, [book._id, user]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await axiosInstance.delete(`/wishlists/${book._id}`);
        setInWishlist(false);
      } else {
        await axiosInstance.post('/wishlists', { bookId: book._id });
        setInWishlist(true);
      }
    } catch {}
    setWishlistLoading(false);
  };

  return (
    <div className="card group overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* ── Book Cover ── */}
      <div className="relative h-52 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {showImage ? (
          <img
            src={imageUrl}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 text-center`}>
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <BookOpen className="relative h-10 w-10 text-white/80 mb-2 drop-shadow" />
            <p className="relative text-xs font-semibold text-white/90 line-clamp-3 drop-shadow leading-snug">
              {book.title}
            </p>
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm
            ${isAvailable
              ? 'bg-emerald-900/60 text-emerald-200 ring-1 ring-emerald-400/30'
              : 'bg-neutral-900/60 text-neutral-300 ring-1 ring-white/10'
            }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-neutral-400'}`} />
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Wishlist heart (members only, not shown in admin view) */}
        {user?.role === 'member' && !isAdmin && (
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-2.5 left-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm transition-all
              ${inWishlist
                ? 'bg-rose-600/90 text-white'
                : 'bg-neutral-900/50 text-white/70 hover:text-rose-400'
              }`}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-2 mb-0.5">
          {book.title}
        </h3>
        <p className="text-xs text-neutral-400 mb-3 truncate">{book.author}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-4">
          {category && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {category}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto text-xs text-neutral-400">
            <Users className="h-3 w-3" />
            <span>{book.availableCopies ?? 0}/{book.quantity ?? book.totalCopies ?? 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto">
          {isAdmin ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEdit?.(book)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" className="flex-1" onClick={() => onDelete?.(book)}>
                Delete
              </Button>
            </div>
          ) : isAvailable ? (
            <Button variant="primary" size="sm" className="w-full" onClick={() => onBorrow?.(book)}>
              Borrow Book
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" onClick={() => onReserve?.(book)}>
              Reserve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
