import React, { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/books/BookCard';
import { BookCardSkeleton } from '../components/common/SkeletonLoader';
import { Search, SlidersHorizontal, Grid, List as ListIcon } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const Catalog = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const { books, loading, error, refetch } = useBooks(query);
  const { user } = useAuth();
  const [issueLoading, setIssueLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleIssue = async (bookId) => {
    setIssueLoading(true);
    try {
      await axiosInstance.post('/transactions/issue', { bookId });
      setSuccessMsg('Book issued successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing book');
    } finally {
      setIssueLoading(false);
    }
  };

  const filteredBooks = category === 'All' 
    ? books 
    : books.filter(b => b.category === category);

  const categories = ['All', ...new Set(books.map(b => b.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Library Catalog</h2>
          <p className="text-slate-500">Explore and borrow from our extensive collection.</p>
        </div>
        
        {successMsg && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-medium animate-in fade-in zoom-in">
            {successMsg}
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow hover:shadow-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <button className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <SlidersHorizontal className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {error ? (
        <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 font-medium">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            Array(10).fill(0).map((_, i) => <BookCardSkeleton key={i} />)
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <BookCard 
                key={book._id} 
                book={book} 
                isAdmin={user?.role === 'admin'}
                onIssue={handleIssue}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-3">
              <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No books found matching your criteria.</p>
              <button 
                onClick={() => { setQuery(''); setCategory('All'); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Catalog;
