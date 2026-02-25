import React, { useEffect, useState } from 'react';
import { Heart, BookOpen, Trash2, ShoppingBag } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = async () => {
    try {
      const { data } = await axiosInstance.get('/wishlists/me');
      setWishlist(data.wishlist || []);
    } catch {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (bookId) => {
    try {
      await axiosInstance.delete(`/wishlists/${bookId}`);
      setWishlist(prev => prev.filter(item => item.book?._id !== bookId));
    } catch {
      setError('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/40">
          <Heart className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">My Wishlist</h1>
          <p className="text-sm text-neutral-500">{wishlist.length} saved {wishlist.length === 1 ? 'book' : 'books'}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <Heart className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-neutral-400">Browse the catalog and save books you'd like to borrow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map((item) => {
            const book = item.book;
            const isAvailable = (book?.availableCopies ?? 0) > 0;
            return (
              <div key={item._id} className="card group overflow-hidden flex flex-col">
                {/* Cover */}
                <div className="relative h-44 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  {book?.coverImageURL ? (
                    <img
                      src={book.coverImageURL}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-600">
                      <BookOpen className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm
                      ${isAvailable ? 'bg-emerald-900/60 text-emerald-200' : 'bg-neutral-900/60 text-neutral-300'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-neutral-400'}`} />
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">{book?.title}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{book?.author}</p>
                    {book?.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase tracking-wide">
                        {book.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-auto">
                    Saved {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleRemove(book?._id)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-rose-200 dark:border-rose-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
