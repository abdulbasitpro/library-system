import { useState, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle, AlertTriangle, Clock, Bell } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';

const STATUS_BADGE = {
  issued:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  returned: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  overdue:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};
const STATUS_ICON = {
  issued:   <Clock size={11} />,
  returned: <CheckCircle size={11} />,
  overdue:  <AlertTriangle size={11} />,
};

const Transactions = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [returning, setReturning]       = useState(null);
  const [reminding, setReminding]       = useState(null);
  const [toast, setToast]               = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchTx = async () => {
    setLoading(true);
    const { data } = await axiosInstance.get(`/transactions?status=${statusFilter}&limit=50`);
    setTransactions(data.transactions);
    setLoading(false);
  };

  useEffect(() => { fetchTx(); }, [statusFilter]);

  const handleReturn = async (tid) => {
    if (!window.confirm('Mark this book as returned?')) return;
    setReturning(tid);
    try {
      await axiosInstance.put(`/transactions/return/${tid}`);
      fetchTx();
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    } finally {
      setReturning(null);
    }
  };

  const handleRemind = async (t) => {
    setReminding(t._id);
    try {
      const { data } = await axiosInstance.post(`/transactions/remind/${t._id}`);
      showToast(`✅ Reminder sent to ${t.user?.name}`);
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Failed to send reminder'}`);
    } finally {
      setReminding(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isAdmin ? 'All Transactions' : 'My Borrowings'}
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">{transactions.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-light dark:text-muted-dark">Filter:</span>
          {['', 'issued', 'returned', 'overdue'].map((s) => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'btn-secondary'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in ${
          toast.startsWith('✅')
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
        }`}>
          {toast}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {[
                  'Book', isAdmin && 'Member', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Action'
                ].filter(Boolean).map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? Array.from({length:5}).map((_,i)=><TableRowSkeleton key={i} cols={isAdmin?7:6}/>)
              : transactions.length === 0 ? (
                <tr><td colSpan={isAdmin?7:6} className="px-4 py-10 text-center text-muted-light dark:text-muted-dark">No transactions found</td></tr>
              ) : transactions.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={t.book?.coverImageURL || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=40&q=60'} alt=""
                        className="h-9 w-7 object-cover rounded shrink-0" onError={(e)=>e.target.style.display='none'} />
                      <span className="font-medium text-slate-700 dark:text-slate-200 max-w-[150px] truncate">{t.book?.title}</span>
                    </div>
                  </td>
                  {isAdmin && <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{t.user?.name}</td>}
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(t.issueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_BADGE[t.status]}`}>
                      {STATUS_ICON[t.status]} {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!isAdmin && t.status !== 'returned' && (
                        <Button size="sm" variant="secondary" loading={returning === t._id}
                          onClick={() => handleReturn(t._id)}>
                          ↩ Return
                        </Button>
                      )}
                      {isAdmin && t.status !== 'returned' && (
                        <button
                          onClick={() => handleRemind(t)}
                          disabled={reminding === t._id}
                          title={`Send reminder to ${t.user?.name}`}
                          className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-40"
                        >
                          <Bell size={14} className={reminding === t._id ? 'animate-bounce' : ''} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
