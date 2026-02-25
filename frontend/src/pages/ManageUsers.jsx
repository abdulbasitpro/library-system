import React, { useState, useEffect } from 'react';
import { Search, Trash2, Users, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';
import { SkeletonRow } from '../components/common/SkeletonLoader';
import { useAuth } from '../hooks/useAuth';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState(null);
  const { user: currentUser } = useAuth();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const params = q ? `?search=${q}` : '';
      const { data } = await axiosInstance.get(`/users${params}`);
      setUsers(data.users || data || []);
    } catch { setUsers([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  let timer;
  const handleSearch = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timer);
    timer = setTimeout(() => fetchUsers(v), 400);
  };

  const handleToggleRole = async (id, name, currentRole) => {
    const action = currentRole === 'admin' ? 'demote to Member' : 'promote to Admin';
    if (!window.confirm(`${action === 'promote to Admin' ? '🔑 Promote' : '⬇️ Demote'} ${name} to ${currentRole === 'admin' ? 'Member' : 'Admin'}?`)) return;
    setToggling(id);
    try {
      const { data } = await axiosInstance.patch(`/users/${id}/toggle-role`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      showToast(`${name} is now a ${data.user.role}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally { setToggling(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This will delete all their data.`)) return;
    setDeleting(id);
    try {
      await axiosInstance.delete(`/users/${id}`);
      showToast(`${name} removed.`);
      setUsers(us => us.filter(u => u._id !== id));
    } catch { showToast('Delete failed.', 'error'); }
    finally { setDeleting(null); }
  };

  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_COLORS = [
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-blue-600',
    'from-cyan-500 to-teal-600',
    'from-emerald-500 to-green-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ];
  const avatarColor = (name = '') => {
    const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-card-hover text-sm font-medium animate-slide-in-up
          ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-neutral-400 mt-1">View and manage library members</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchUsers(query)}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input type="text" value={query} onChange={handleSearch} placeholder="Search users..." className="input-field pl-10 w-full" />
      </div>

      {/* Stats summary */}
      {!loading && users.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Total Members', count: users.length, color: 'text-neutral-700 dark:text-neutral-300' },
            { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'text-primary-600' },
            { label: 'Members', count: users.filter(u => u.role === 'member').length, color: 'text-neutral-500' },
          ].map(s => (
            <div key={s.label} className="card px-5 py-3 flex items-center gap-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-neutral-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Users className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                      </div>
                      <p className="text-sm text-neutral-400">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColor(u.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials(u.name)}
                        </div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-100">{u.name}</p>
                      </div>
                    </td>
                    <td className="text-neutral-400">{u.email}</td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge-admin' : 'badge-member'}>{u.role}</span>
                    </td>
                    <td className="text-xs text-neutral-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {/* Promote / Demote */}
                        {u._id !== currentUser?._id && (
                          <button
                            onClick={() => handleToggleRole(u._id, u.name, u.role)}
                            disabled={toggling === u._id}
                            title={u.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40
                              ${u.role === 'admin'
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                              }`}
                          >
                            {toggling === u._id
                              ? <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : u.role === 'admin'
                                ? <ShieldOff className="h-3.5 w-3.5" />
                                : <ShieldCheck className="h-3.5 w-3.5" />
                            }
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          disabled={deleting === u._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors disabled:opacity-40"
                          title={`Remove ${u.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && users.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-400">{users.length} user{users.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
