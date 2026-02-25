import React, { useEffect, useState } from 'react';
import { CalendarClock, BookOpen, XCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const STATUS_STYLES = {
  pending:   { bg: 'bg-amber-100 dark:bg-amber-950/30',   text: 'text-amber-700 dark:text-amber-400',   icon: Clock },
  fulfilled: { bg: 'bg-emerald-100 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
  cancelled: { bg: 'bg-neutral-100 dark:bg-neutral-800',  text: 'text-neutral-500',                      icon: XCircle },
  expired:   { bg: 'bg-rose-100 dark:bg-rose-950/30',     text: 'text-rose-700 dark:text-rose-400',      icon: AlertCircle },
};

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetchReservations = async () => {
    try {
      const { data } = await axiosInstance.get('/reservations/me');
      setReservations(data.reservations || []);
    } catch {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    setCancelling(id);
    try {
      await axiosInstance.patch(`/reservations/${id}/cancel`);
      setReservations(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(null);
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
          <CalendarClock className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">My Reservations</h1>
          <p className="text-sm text-neutral-500">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <CalendarClock className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No reservations</h3>
          <p className="text-sm text-neutral-400">Reserve unavailable books from the catalog to be notified when they're back.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const book = r.book;
            const style = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
            const StatusIcon = style.icon;
            const expiresAt = r.expiresAt ? new Date(r.expiresAt) : null;
            const isExpiringSoon = expiresAt && r.status === 'pending' &&
              (expiresAt - new Date()) < 2 * 24 * 60 * 60 * 1000;

            return (
              <div key={r._id} className="card flex items-center gap-4 p-4">
                <div className="h-14 w-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                  {book?.coverImageURL ? (
                    <img src={book.coverImageURL} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-600">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{book?.title}</h3>
                  <p className="text-xs text-neutral-400 truncate">{book?.author}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Reserved on {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {expiresAt && r.status === 'pending' && (
                    <p className={`text-[11px] mt-0.5 ${isExpiringSoon ? 'text-rose-500 font-medium' : 'text-neutral-400'}`}>
                      Expires {expiresAt.toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}>
                    <StatusIcon className="h-3 w-3" />
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                  {r.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(r._id)}
                      disabled={cancelling === r._id}
                      className="text-[11px] text-rose-600 hover:underline disabled:opacity-50"
                    >
                      {cancelling === r._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reservations;
