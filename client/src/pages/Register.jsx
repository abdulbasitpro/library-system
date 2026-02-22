import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library, UserPlus } from 'lucide-react';
import Button from '../components/common/Button';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-slate-900 to-primary-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-glow mb-4">
            <Library size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LibraryOS</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="John Doe" id="reg-name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="you@example.com" id="reg-email" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="input-field" placeholder="Min. 6 characters" id="reg-password" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="input-field" id="reg-role">
                <option value="member">Member</option>
                <option value="admin">Admin / Librarian</option>
              </select>
            </div>
            <Button type="submit" loading={loading} className="w-full justify-center mt-2" id="reg-btn">
              <UserPlus size={16} />
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
