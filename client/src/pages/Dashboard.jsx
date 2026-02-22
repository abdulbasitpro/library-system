import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeftRight, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import OverdueAlert from '../components/common/OverdueAlert';
import { StatCardSkeleton, TableRowSkeleton } from '../components/common/SkeletonLoader';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-light dark:text-muted-dark">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">{sub}</p>}
    </div>
  </div>
);

const STATUS_BADGE = {
  issued:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  returned: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  overdue:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [bookStats, setBookStats]     = useState(null);
  const [txStats, setTxStats]         = useState(null);
  const [userStats, setUserStats]     = useState(null);
  const [recent, setRecent]           = useState([]);
  const [overdue, setOverdue]         = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [txRes, overdueRes] = await Promise.all([
          axiosInstance.get('/transactions?limit=5'),
          axiosInstance.get('/transactions/overdue'),
        ]);
        setRecent(txRes.data.transactions);
        setOverdue(overdueRes.data.overdueTransactions);

        if (isAdmin) {
          const [bkRes, uRes, txSRes] = await Promise.all([
            axiosInstance.get('/books/stats'),
            axiosInstance.get('/users/stats'),
            axiosInstance.get('/transactions/stats'),
          ]);
          setBookStats(bkRes.data.stats);
          setUserStats(uRes.data.stats);
          setTxStats(txSRes.data.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          {isAdmin ? 'Library administration overview' : 'Your borrowing summary'}
        </p>
      </div>

      {/* Overdue Alert */}
      <OverdueAlert overdueTransactions={overdue} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : isAdmin ? (
          <>
            <StatCard icon={BookOpen}        label="Total Books"        value={bookStats?.totalBooks}      color="bg-primary-500" sub={`${bookStats?.availableCopies} copies available`} />
            <StatCard icon={ArrowLeftRight}  label="Active Issues"      value={txStats?.issued}            color="bg-blue-500"    />
            <StatCard icon={AlertTriangle}   label="Overdue"            value={txStats?.overdue}           color="bg-red-500"     />
            <StatCard icon={Users}           label="Total Members"      value={userStats?.members}         color="bg-violet-500"  />
          </>
        ) : (
          <>
            <StatCard icon={BookOpen}       label="Borrowed"     value={user?.borrowedBooks?.length || 0} color="bg-primary-500" />
            <StatCard icon={AlertTriangle}  label="Overdue"      value={overdue.length}                   color="bg-red-500"     />
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock size={16} /> Recent Transactions
          </h2>
          <Link to="/transactions" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Book', 'Member', 'Issue Date', 'Due Date', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-light dark:text-muted-dark">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                recent.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 max-w-[180px] truncate">
                      {t.book?.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.user?.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(t.issueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(t.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
