import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Copy, Calendar, Tag, Hash } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const FALLBACK = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/books/${id}`)
      .then(({ data }) => setBook(data.book))
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="animate-pulse grid md:grid-cols-[280px_1fr] gap-8">
        <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-1">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Cover */}
        <div className="shrink-0">
          <img
            src={book.coverImageURL || FALLBACK}
            alt={book.title}
            className="w-full h-80 md:h-96 object-cover rounded-xl shadow-lg"
            onError={(e) => { e.target.src = FALLBACK; }}
          />
          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl ${book.availableCopies > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <Copy size={16} className={book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'} />
              <span className={`text-sm font-semibold ${book.availableCopies > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {book.availableCopies > 0 ? `${book.availableCopies} of ${book.quantity} available` : 'All copies issued'}
              </span>
            </div>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/admin/books')} variant="secondary" className="w-full justify-center">
                Manage Books
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{book.title}</h1>
          <p className="text-lg text-muted-light dark:text-muted-dark mb-4">by {book.author}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Tag size={10} /> {book.category}
            </span>
            {book.isbn && (
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <Hash size={10} /> {book.isbn}
              </span>
            )}
            {book.publishedYear && (
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <Calendar size={10} /> {book.publishedYear}
              </span>
            )}
          </div>

          {book.description && (
            <div className="card p-5 mb-6">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-2 text-sm">About this book</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{book.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="text-xs text-muted-light dark:text-muted-dark">Total Copies</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{book.quantity}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-muted-light dark:text-muted-dark">Available</p>
              <p className={`text-xl font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {book.availableCopies}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
