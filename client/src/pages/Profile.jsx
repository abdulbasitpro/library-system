import { useState } from 'react';
import { User, Mail, Shield, BookOpen, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: user?.name || '' });
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Profile</h1>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 mb-5 animate-fade-in">
          ✓ Profile updated successfully
        </div>
      )}

      {/* Avatar + Basic Info */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-5 mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-glow shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-field text-lg font-semibold mb-1"
                placeholder="Your name"
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-0.5">{user?.name}</h2>
            )}
            <p className="text-sm text-muted-light dark:text-muted-dark">{user?.email}</p>
          </div>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="shrink-0">
              <Edit2 size={14} /> Edit
            </Button>
          ) : (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" loading={saving} onClick={handleSave}>
                <Save size={14} /> Save
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                <X size={14} />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <Mail size={16} className="text-primary-500 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase font-medium">Email</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <Shield size={16} className="text-primary-500 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase font-medium">Role</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <BookOpen size={16} className="text-primary-500 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase font-medium">Borrowed</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.borrowedBooks?.length || 0} books</p>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowed Books */}
      {user?.borrowedBooks?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BookOpen size={16} /> Currently Borrowed
          </h3>
          <div className="space-y-3">
            {user.borrowedBooks.map((book) => (
              <div key={book._id || book} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <BookOpen size={18} className="text-primary-500 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {book.title || book}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
