import React, { useState, useEffect } from 'react';
import {
  BookMarked, ArrowLeftRight, AlertTriangle, CheckCircle2,
  TrendingUp, ArrowRight, Plus, Users, Clock, Zap, Sparkles, BookOpen,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { SkeletonStat, SkeletonRow } from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const STAT_CONFIG = [
  {
    key: 'total',
    label: 'Total Transactions',
    icon: ArrowLeftRight,
    gradient: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    key: 'issued',
    label: 'Active Issues',
    icon: BookMarked,
    gradient: 'from-sky-500 to-cyan-600',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
  },
  {
    key: 'overdue',
    label: 'Overdue Books',
    icon: AlertTriangle,
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    key: 'returned',
    label: 'Books Returned',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

const StatusBadge = ({ status }) => {
  const cls = {
    issued:   'badge-issued',
    returned: 'badge-returned',
    overdue:  'badge-overdue',
  }[status] ?? 'badge bg-neutral-100 text-neutral-600';
  return <span className={cls}>{status}</span>;
};

const StatCard = ({ config, value, loading }) => {
  if (loading) return <SkeletonStat />;
  return (
    <div className="card p-6 flex items-start gap-4 hover:shadow-card-hover transition-all duration-300 group">
      <div className={`stat-icon bg-gradient-to-br ${config.gradient} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
        <config.icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{config.label}</p>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1 leading-none">{value ?? 0}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, transRes, alertsRes] = await Promise.all([
          axiosInstance.get('/transactions/stats'),
          axiosInstance.get('/transactions?limit=5'),
          axiosInstance.get('/transactions/overdue'),
        ]);
        setStats(statsRes.data.stats);
        setRecentTransactions(transRes.data.transactions || []);
        setOverdueAlerts(alertsRes.data.overdueTransactions || []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome back, {firstName} 👋</h1>
          <p className="text-sm text-neutral-400 mt-1">Here's what's happening in your library today.</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/admin/books">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </Link>
        )}
      </div>

      {/* ── Stat Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CONFIG.map(cfg => (
          <StatCard key={cfg.key} config={cfg} value={stats?.[cfg.key]} loading={loading} />
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="xl:col-span-2 card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/40">
                <Clock className="h-3.5 w-3.5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Recent Transactions</h2>
            </div>
            <Link to="/transactions" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-neutral-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map(t => (
                    <tr key={t._id}>
                      <td>
                        <span className="font-medium text-neutral-800 dark:text-neutral-100">
                          {t.book?.title || '—'}
                        </span>
                      </td>
                      <td>{t.user?.name || '—'}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="text-neutral-400 text-xs">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Alert card */}
          {!loading && (
            overdueAlerts.length > 0 ? (
              <div className="card p-5 border-rose-200 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-950/20">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-600" style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">Overdue Alert</h3>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 leading-relaxed">
                      {overdueAlerts.length} book{overdueAlerts.length > 1 ? 's' : ''} past due date.
                    </p>
                    <Link to="/transactions" className="inline-block mt-3">
                      <Button variant="danger" size="sm">View Overdue</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-5 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">All Clear</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">No overdue books. Great job!</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Admin quick actions */}
          {user?.role === 'admin' && (
            <div className="card p-5 bg-gradient-brand text-white border-0">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Add Book', path: '/admin/books', icon: Plus },
                  { label: 'Manage Users', path: '/admin/users', icon: Users },
                ].map(a => (
                  <Link key={a.path} to={a.path}
                    className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/25 transition-all duration-200 text-center group"
                  >
                    <a.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Catalog shortcut */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Book Catalog</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Browse available books</p>
              </div>
              <Link to="/catalog">
                <Button variant="secondary" size="sm">
                  Browse <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommendations (members only) ── */}
      {user?.role === 'member' && <RecommendationsSection />}
    </div>
  );
};

const RecommendationsSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/books/recommendations')
      .then(({ data }) => setBooks(data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBorrow = async (book) => {
    try {
      await axiosInstance.post('/transactions/issue', { bookId: book._id });
      setBooks(prev => prev.filter(b => b._id !== book._id));
    } catch {}
  };

  if (!loading && books.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/40">
          <Sparkles className="h-4 w-4 text-fuchsia-600" />
        </div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Recommended for You</h2>
        <Link to="/catalog" className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {loading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="shrink-0 w-40 h-56 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ))
          : books.slice(0, 8).map((book) => {
              const isAvailable = (book.availableCopies ?? 0) > 0;
              return (
                <div key={book._id} className="shrink-0 w-36 card overflow-hidden flex flex-col">
                  <div className="h-36 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    {book.coverImageURL ? (
                      <img src={book.coverImageURL} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-fuchsia-400 to-violet-600 flex items-center justify-center">
                        <BookOpen className="h-7 w-7 text-white/80" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-3">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug mb-1">{book.title}</p>
                    <p className="text-[11px] text-neutral-400 truncate mb-3">{book.author}</p>
                    {isAvailable ? (
                      <button
                        onClick={() => handleBorrow(book)}
                        className="mt-auto w-full py-1.5 rounded-lg bg-primary-600 text-white text-[11px] font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Borrow
                      </button>
                    ) : (
                      <span className="mt-auto text-center text-[11px] text-neutral-400">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
};

export default Dashboard;
