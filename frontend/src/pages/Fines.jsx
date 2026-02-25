import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, DollarSign, BookOpen } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

const Fines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(null);

  const fetchFines = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/transactions/fines/all' : '/transactions/fines/me';
      const { data } = await axiosInstance.get(endpoint);
      setFines(data.fines || []);
      setTotalUnpaid(data.totalUnpaid || data.totalPending || 0);
      setTotalPaid(data.totalPaid || data.totalRevenue || 0);
    } catch {
      setError('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, []);

  const handlePayFine = async (transactionId) => {
    if (!confirm('Mark this fine as paid?')) return;
    setPaying(transactionId);
    try {
      await axiosInstance.patch(`/transactions/${transactionId}/pay-fine`);
      await fetchFines();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark fine as paid');
    } finally {
      setPaying(null);
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
          <AlertTriangle className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {user?.role === 'admin' ? 'Fine Management' : 'My Fines'}
          </h1>
          <p className="text-sm text-neutral-500">{fines.length} fine record{fines.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {user?.role === 'admin' ? 'Pending Revenue' : 'Unpaid Fines'}
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600">${totalUnpaid.toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {user?.role === 'admin' ? 'Total Collected' : 'Paid Fines'}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

      {fines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No fines!</h3>
          <p className="text-sm text-neutral-400">Great job returning books on time.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Book</th>
                  {user?.role === 'admin' && (
                    <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Member</th>
                  )}
                  <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Due Date</th>
                  <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Returned</th>
                  <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Fine</th>
                  <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((t) => (
                  <tr key={t._id} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-6 rounded overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                          {t.book?.coverImageURL ? (
                            <img src={t.book.coverImageURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-600">
                              <BookOpen className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">{t.book?.title}</p>
                          <p className="text-xs text-neutral-400">{t.book?.author}</p>
                        </div>
                      </div>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="p-4">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{t.user?.name}</p>
                        <p className="text-xs text-neutral-400">{t.user?.email}</p>
                      </td>
                    )}
                    <td className="p-4 text-neutral-500 text-xs">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-neutral-500 text-xs">
                      {t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600">${t.fineAmount?.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      {t.finePaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" /> Paid
                        </span>
                      ) : user?.role === 'admin' ? (
                        <button
                          onClick={() => handlePayFine(t._id)}
                          disabled={paying === t._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          <DollarSign className="h-3 w-3" />
                          {paying === t._id ? 'Processing...' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3" /> Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fines;
