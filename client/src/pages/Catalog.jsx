import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import useBooks from '../hooks/useBooks';
import BookCard from '../components/books/BookCard';
import SearchBar from '../components/common/SearchBar';
import { BookGridSkeleton } from '../components/common/SkeletonLoader';
import axiosInstance from '../utils/axiosInstance';

const CATEGORIES = ['All','Fiction','Non-Fiction','Science','Technology','History',
  'Biography','Literature','Philosophy','Self-Help','Business','Children','Other'];

const Catalog = () => {
  const {
    books, loading, error, search, setSearch,
    category, setCategory, page, setPage, totalPages, total,
  } = useBooks();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Book Catalog</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          {loading ? 'Loading…' : `${total} books found`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} className="flex-1" />
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field w-40"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <BookGridSkeleton count={12} />
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-slate-500 dark:text-slate-400">No books found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
