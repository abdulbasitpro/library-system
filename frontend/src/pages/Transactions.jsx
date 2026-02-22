import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import { Search, Filter, History, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/transactions');
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      await axiosInstance.put(`/transactions/return/${id}`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning book');
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  const StatusBadge = ({ status }) => {
    const styles = {
      issued: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      returned: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    const Icons = {
      issued: Clock,
      returned: CheckCircle,
      overdue: AlertCircle,
    };
    const Icon = Icons[status];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
        <Icon className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <p className="text-slate-500">Track all book issues and returns.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'issued', 'returned', 'overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap
                ${filter === f 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-semibold">Book</th>
                {user?.role === 'admin' && <th className="px-6 py-4 font-semibold">Member</th>}
                <th className="px-6 py-4 font-semibold">Issue Date</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array(6).fill(0).map((_, i) => <TableRowSkeleton key={i} cols={user?.role === 'admin' ? 6 : 5} />)
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{t.book?.title}</p>
                      <p className="text-xs text-slate-500">{t.book?.isbn}</p>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4">
                        <p className="font-medium">{t.user?.name}</p>
                        <p className="text-xs text-slate-500">{t.user?.email}</p>
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(t.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.status !== 'returned' && (user?.role === 'admin' || t.status === 'issued') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-700"
                          onClick={() => handleReturn(t._id)}
                        >
                          Mark Returned
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-6 py-20 text-center">
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No transaction records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
