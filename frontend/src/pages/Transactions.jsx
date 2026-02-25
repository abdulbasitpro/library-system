import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, Clock, Filter } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { SkeletonRow } from '../components/common/SkeletonLoader';

const FILTERS = ['All', 'Issued', 'Returned', 'Overdue'];

const StatusBadge = ({ status }) => {
  const map = {
    issued:   'badge-issued',
    returned: 'badge-returned',
    overdue:  'badge-overdue',
  };
  return <span className={map[status] ?? 'badge bg-neutral-100 text-neutral-500'}>{status}</span>;
};

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [returning, setReturning] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTransactions = async (status = '') => {
    setLoading(true);
    try {
      const params = status && status !== 'All' ? `?status=${status.toLowerCase()}` : '';
      const { data } = await axiosInstance.get(`/transactions${params}`);
      setTransactions(data.transactions || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleFilter = (f) => {
    setFilter(f);
    fetchTransactions(f);
  };

  const handleReturn = async (transactionId) => {
    setReturning(transactionId);
    try {
      await axiosInstance.patch(`/transactions/${transactionId}/return`);
      showToast('Book returned successfully!');
      fetchTransactions(filter);
    } catch (err) {
      showToast(err.response?.data?.message || 'Return failed.', 'error');
    } finally {
      setReturning(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-card-hover text-sm font-medium animate-slide-in-up
          ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-neutral-400 mt-1">Track all borrowing history and returns</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchTransactions(filter)}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
              ${filter === f
                ? 'bg-primary-600 text-white shadow-glow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:text-primary-600 hover:border-primary-300'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                {user?.role === 'admin' && <th>Member</th>}
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <ArrowLeftRight className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                      </div>
                      <p className="text-sm text-neutral-400">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-100">{t.book?.title || '—'}</p>
                        <p className="text-xs text-neutral-400">{t.book?.author || ''}</p>
                      </div>
                    </td>
                    {user?.role === 'admin' && <td>{t.user?.name || '—'}</td>}
                    <td className="text-xs text-neutral-400">
                      {t.issueDate ? new Date(t.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="text-xs text-neutral-400">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      {t.status === 'issued' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={returning === t._id}
                          onClick={() => handleReturn(t._id)}
                        >
                          Return
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && transactions.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <p className="text-xs text-neutral-400">{transactions.length} result{transactions.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
