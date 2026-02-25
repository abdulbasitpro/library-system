import React, { useEffect, useState } from 'react';
import { Clock, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const ReadingHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/transactions/history/me?page=${p}&limit=12`);
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load reading history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const daysBetween = (a, b) => {
    if (!a || !b) return null;
    return Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/40">
          <Clock className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Reading History</h1>
          <p className="text-sm text-neutral-500">{total} books read</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No reading history yet</h3>
          <p className="text-sm text-neutral-400">Books you return will appear here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {transactions.map((t, idx) => {
              const book = t.book;
              const held = daysBetween(t.issueDate, t.returnDate);
              return (
                <div key={t._id} className="card flex items-start gap-4 p-4 hover:shadow-card-hover transition-all duration-200">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      #{total - (page - 1) * 12 - idx}
                    </div>
                  </div>

                  {/* Cover thumb */}
                  <div className="h-[60px] w-[44px] rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                    {book?.coverImageURL ? (
                      <img src={book.coverImageURL} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-600">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{book?.title}</h3>
                    <p className="text-xs text-neutral-400 truncate">{book?.author}</p>
                    {book?.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase tracking-wide">
                        {book.category}
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="shrink-0 text-right space-y-1">
                    <div className="flex items-center gap-1.5 justify-end text-xs text-neutral-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(t.issueDate)}</span>
                      <ArrowRight className="h-3 w-3 text-neutral-300" />
                      <span>{formatDate(t.returnDate)}</span>
                    </div>
                    {held !== null && (
                      <p className="text-[11px] text-neutral-400">{held} day{held !== 1 ? 's' : ''} held</p>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                      Returned
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Prev
              </button>
              <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReadingHistory;
