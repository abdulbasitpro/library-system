import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookMarked, 
  AlertCircle, 
  History, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import { Skeleton } from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, transRes, alertsRes] = await Promise.all([
          axiosInstance.get('/transactions/stats'), // Assuming this exists or returns relevant count
          axiosInstance.get('/transactions?limit=5'),
          axiosInstance.get('/transactions/overdue')
        ]);
        
        setStats(statsRes.data);
        setRecentTransactions(transRes.data.transactions || []);
        setOverdueAlerts(alertsRes.data.overdueTransactions || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>
        <p className="text-slate-500">Here's what's happening in your library today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        ) : (
          <>
            <StatCard 
              title="Total Books" 
              value={stats?.totalBooks || 0} 
              icon={BookMarked} 
              color="bg-indigo-600" 
            />
            <StatCard 
              title="Active Issues" 
              value={stats?.activeTransactions || 0} 
              icon={History} 
              color="bg-emerald-600" 
            />
            <StatCard 
              title="Overdue Books" 
              value={overdueAlerts.length} 
              icon={AlertCircle} 
              color="bg-rose-600" 
            />
            <StatCard 
              title="Registered Members" 
              value={stats?.totalUsers || 0} 
              icon={Users} 
              color="bg-violet-600" 
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <Link to="/transactions" className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-semibold">Book Title</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan="4" className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                    ))
                  ) : (
                    recentTransactions.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{t.book?.title}</td>
                        <td className="px-6 py-4 text-slate-500">{t.user?.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'issued' ? 'bg-amber-100 text-amber-700' :
                            t.status === 'returned' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(t.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && recentTransactions.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts & Actions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Alerts & Notifications</h3>
          {overdueAlerts.length > 0 ? (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-4 rounded-2xl flex gap-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl h-fit">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-200">Overdue Books</h4>
                <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
                  You have {overdueAlerts.length} books past their due date. Please return them immediately.
                </p>
                <Link to="/transactions" className="inline-block mt-3 text-sm font-bold text-rose-600 hover:underline">
                  Take Action →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4 rounded-2xl flex gap-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl h-fit">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">All Clear</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  You have no overdue books or pending notifications.
                </p>
              </div>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none space-y-4">
              <h4 className="font-bold text-xl">Quick Actions</h4>
              <p className="text-indigo-100 text-sm">Manage your inventory or users with a single click.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/books" className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                  <Plus className="h-6 w-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Book</span>
                </Link>
                <Link to="/admin/users" className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                  <Users className="h-6 w-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Manage</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
