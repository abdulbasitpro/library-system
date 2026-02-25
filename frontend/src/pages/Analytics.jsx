import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BookOpen, Users, AlertTriangle, TrendingUp, DollarSign, ArrowUpRight
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <ArrowUpRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
    </div>
    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
    <p className="text-xs font-medium text-neutral-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get('/transactions/analytics/overview');
        setData(res.data);
      } catch {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400">
        {error}
      </div>
    );
  }

  const overview = data?.overview || {};

  // Format monthly trends for recharts
  const monthlyData = (data?.monthlyTrends || []).map((t) => ({
    name: `${MONTH_NAMES[t._id.month - 1]} ${t._id.year}`,
    borrows: t.count,
  }));

  // Format categories
  const categoryData = (data?.topCategories || []).map((c) => ({
    name: c._id,
    count: c.count,
  }));

  // Status distribution
  const statusData = [
    { name: 'Issued', value: overview.activeIssued || 0 },
    { name: 'Overdue', value: overview.overdueCount || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/40">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-neutral-500">Real-time library insights</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Total Books" value={overview.totalBooks || 0} color="bg-indigo-500" />
        <StatCard icon={Users} label="Total Members" value={overview.totalUsers || 0} color="bg-violet-500" />
        <StatCard icon={BookOpen} label="Active Issues" value={overview.activeIssued || 0} color="bg-sky-500" />
        <StatCard icon={AlertTriangle} label="Overdue Books" value={overview.overdueCount || 0} color="bg-amber-500" />
        <StatCard icon={DollarSign} label="Fines Collected" value={`$${(overview.fineRevenue || 0).toFixed(2)}`} color="bg-emerald-500" />
        <StatCard icon={AlertTriangle} label="Pending Fines" value={`$${(overview.finePending || 0).toFixed(2)}`} color="bg-rose-500" />
      </div>

      {/* Monthly Borrow Trend */}
      {monthlyData.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Monthly Borrow Trends (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Line
                type="monotone"
                dataKey="borrows"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Categories */}
        {categoryData.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        {statusData.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Active Borrow Status</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Borrowed Books */}
      {data?.topBooks?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Most Borrowed Books</h2>
          <div className="space-y-3">
            {data.topBooks.map((item, i) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-neutral-300 dark:text-neutral-600 w-5 shrink-0">#{i + 1}</span>
                {item.book?.coverImageURL ? (
                  <img src={item.book.coverImageURL} alt="" className="h-9 w-7 rounded object-cover shrink-0" />
                ) : (
                  <div className="h-9 w-7 rounded bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">{item.book?.title}</p>
                  <p className="text-xs text-neutral-400">{item.book?.author}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-indigo-600">{item.count}</p>
                  <p className="text-[11px] text-neutral-400">borrows</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
