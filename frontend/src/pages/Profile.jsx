import React, { useState } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, Calendar, BookMarked } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await axiosInstance.put('/auth/profile', payload);
      if (data.user && setUser) setUser(data.user);
      setForm(v => ({ ...v, password: '', confirmPassword: '' }));
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-card-hover text-sm font-medium animate-slide-in-up
          ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile banner */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold shadow-glow">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-neutral-400">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              <span className={user?.role === 'admin' ? 'badge-admin' : 'badge-member'}>
                <Shield className="h-3 w-3" />
                {user?.role}
              </span>
              {user?.createdAt && (
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-5">Account Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input type="text" required value={form.name} onChange={set('name')} className="input-field pl-10" placeholder="Your name" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input type="email" required value={form.email} onChange={set('email')} className="input-field pl-10" placeholder="email@example.com" />
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <p className="text-xs font-semibold text-neutral-400 mb-3">Change Password <span className="font-normal">(leave blank to keep current)</span></p>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    minLength={form.password ? 6 : undefined}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`input-field pl-10 ${form.password && form.confirmPassword && form.password !== form.confirmPassword ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-rose-500">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" loading={saving}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
