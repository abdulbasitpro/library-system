import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, BookOpen, X, ChevronDown } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/books/BookCard';
import { SkeletonBookCard } from '../components/common/SkeletonLoader';

const GENRES = [
  'All', 'Fiction', 'Non-Fiction', 'Science', 'Technology',
  'History', 'Biography', 'Literature', 'Philosophy',
  'Self-Help', 'Business', 'Children', 'Comics', 'Art',
  'Religion', 'Travel', 'Cooking', 'Health', 'General', 'Other',
];

const PAGE_SIZE = 24;

let debounceTimer;

const Catalog = () => {
  const { user } = useAuth();
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery]         = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const [total, setTotal]         = useState(0);
  const [toast, setToast]         = useState(null);
  const inputRef = useRef(null);

  const fetchBooks = useCallback(async (q = '', genre = '', pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (q)                   params.set('search', q);
      if (genre && genre !== 'All') params.set('category', genre); // ← fixed: was 'genre'
      params.set('page', pageNum);
      params.set('limit', PAGE_SIZE);

      const { data } = await axiosInstance.get(`/books?${params}`);
      const incoming = data.books || [];

      setBooks(prev => append ? [...prev, ...incoming] : incoming);
      setTotal(data.total || incoming.length);
      setHasMore(data.pages ? pageNum < data.pages : false);
      setPage(pageNum);
    } catch {
      if (!append) setBooks([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchBooks('', 'All', 1); }, [fetchBooks]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchBooks(val, activeGenre, 1), 400);
  };

  const handleGenre = (genre) => {
    setActiveGenre(genre);
    fetchBooks(query, genre, 1);
  };

  const clearSearch = () => {
    setQuery('');
    fetchBooks('', activeGenre, 1);
    inputRef.current?.focus();
  };

  const loadMore = () => fetchBooks(query, activeGenre, page + 1, true);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBorrow = async (book) => {
    try {
      await axiosInstance.post('/transactions/issue', { bookId: book._id });
      showToast(`"${book.title}" borrowed successfully!`);
      fetchBooks(query, activeGenre, 1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not borrow book.', 'error');
    }
  };

  const handleReserve = async (book) => {
    try {
      await axiosInstance.post('/reservations', { bookId: book._id });
      showToast(`Reserved "${book.title}" — you'll be notified when it's available!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not reserve book.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-card-hover text-sm font-medium animate-slide-in-up
          ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Book Catalog</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {loading ? 'Loading...' : `${total} book${total !== 1 ? 's' : ''} in library`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search by title or author..."
            className="input-field pl-10 pr-9 w-full"
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Genre filter chips — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => handleGenre(genre)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
              ${activeGenre === genre
                ? 'bg-primary-600 text-white shadow-glow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400 hover:text-primary-600'
              }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonBookCard key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-600 dark:text-neutral-400">No books found</h3>
          <p className="text-sm text-neutral-400 mt-1">Try a different search term or genre filter</p>
          {(query || activeGenre !== 'All') && (
            <button
              onClick={() => { setQuery(''); setActiveGenre('All'); fetchBooks(); }}
              className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {books.map(book => (
              <BookCard
                key={book._id}
                book={book}
                isAdmin={user?.role === 'admin'}
                onBorrow={handleBorrow}
                onReserve={handleReserve}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-primary-400 hover:text-primary-600 disabled:opacity-50 transition-all duration-200"
              >
                {loadingMore ? (
                  <span className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {loadingMore ? 'Loading...' : `Load More (${total - books.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
