import React, { useEffect, useState } from 'react';
import { BookPlus, Send, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

const STATUS_STYLES = {
  pending:  { bg: 'bg-amber-100 dark:bg-amber-950/30',   text: 'text-amber-700 dark:text-amber-400' },
  approved: { bg: 'bg-emerald-100 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400' },
  rejected: { bg: 'bg-rose-100 dark:bg-rose-950/30',     text: 'text-rose-700 dark:text-rose-400' },
};

const BookRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', author: '', isbn: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Admin actions
  const [actionNote, setActionNote] = useState({});

  const fetchRequests = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/book-requests' : '/book-requests/me';
      const { data } = await axiosInstance.get(endpoint);
      setRequests(data.bookRequests || []);
    } catch {
      setError('Failed to load book requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/book-requests', form);
      setRequests(prev => [data.bookRequest, ...prev]);
      setForm({ title: '', author: '', isbn: '', reason: '' });
      setShowForm(false);
      setSuccess('Book request submitted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminAction = async (id, status) => {
    const note = actionNote[id] || '';
    try {
      const { data } = await axiosInstance.patch(`/book-requests/${id}`, { status, adminNote: note });
      setRequests(prev => prev.map(r => r._id === id ? data.bookRequest : r));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950/40">
            <BookPlus className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Book Requests</h1>
            <p className="text-sm text-neutral-500">{requests.length} request{requests.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {user?.role !== 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <BookPlus className="h-4 w-4" />
            Request a Book
          </button>
        )}
      </div>

      {error && <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400 text-sm">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-700 dark:text-emerald-400 text-sm">{success}</div>}

      {/* Member: Request Form */}
      {showForm && user?.role !== 'admin' && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Request a New Book</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Book Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter book title"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Author</label>
                <input
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  placeholder="Author name"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">ISBN (optional)</label>
                <input
                  value={form.isbn}
                  onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                  placeholder="ISBN number"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Reason</label>
                <input
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Why do you need this book?"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <BookPlus className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No requests yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const style = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
            return (
              <div key={r._id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{r.title}</h3>
                    {r.author && <p className="text-xs text-neutral-400">{r.author}</p>}
                    {r.isbn && <p className="text-[11px] text-neutral-400">ISBN: {r.isbn}</p>}
                    {r.reason && <p className="text-xs text-neutral-500 mt-1">"{r.reason}"</p>}
                    {user?.role === 'admin' && r.user && (
                      <p className="text-xs text-neutral-400 mt-1">By: <span className="font-medium">{r.user.name}</span> ({r.user.email})</p>
                    )}
                    {r.adminNote && (
                      <p className="text-xs text-neutral-500 mt-1 italic">Admin note: {r.adminNote}</p>
                    )}
                    <p className="text-[11px] text-neutral-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                {/* Admin actions */}
                {user?.role === 'admin' && r.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <input
                      placeholder="Admin note (optional)"
                      value={actionNote[r._id] || ''}
                      onChange={e => setActionNote(n => ({ ...n, [r._id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => handleAdminAction(r._id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAdminAction(r._id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookRequests;
