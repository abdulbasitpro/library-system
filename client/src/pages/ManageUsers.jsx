import { useState, useEffect, useCallback } from 'react';
import { Trash2, ShieldCheck, ShieldX, Search } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';

const ManageUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await axiosInstance.get(`/users?search=${search}&limit=50`);
    setUsers(data.users);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 400);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    await axiosInstance.put(`/users/${user._id}`, { role: newRole });
    fetchUsers();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setDeleting(user._id);
    try {
      await axiosInstance.delete(`/users/${user._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Users</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">{users.length} users total</p>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…" className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['User','Email','Role','Borrowed','Joined','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? Array.from({length:5}).map((_,i)=><TableRowSkeleton key={i} cols={6}/>)
              : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-light dark:text-muted-dark">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.borrowedBooks?.length || 0}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleRole(u)}
                        className="p-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors"
                        title={`Make ${u.role === 'admin' ? 'Member' : 'Admin'}`}>
                        {u.role === 'admin' ? <ShieldX size={14}/> : <ShieldCheck size={14}/>}
                      </button>
                      <button onClick={() => handleDelete(u)} disabled={deleting === u._id}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-40">
                        <Trash2 size={14} />
                      </button>
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

export default ManageUsers;
