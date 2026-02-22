import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import { User, Shield, ShieldAlert, Trash2, Mail } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      await axiosInstance.put(`/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-slate-500">Manage member access and administration roles.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold text-center">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center w-fit mx-auto ${
                      u.role === 'admin' 
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {u.role === 'admin' ? <ShieldAlert className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleRole(u._id, u.role)}
                        className="text-xs"
                      >
                        Change Role
                      </Button>
                      <button onClick={() => handleDelete(u._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
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
