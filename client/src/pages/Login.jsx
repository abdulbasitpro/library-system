import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library, LogIn } from 'lucide-react';
import Button from '../components/common/Button';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-slate-900 to-primary-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-glow mb-4">
            <Library size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LibraryOS</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                required autoComplete="email" className="input-field" placeholder="you@example.com"
                id="login-email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                required autoComplete="current-password" className="input-field" placeholder="••••••••"
                id="login-password"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full justify-center" id="login-btn">
              <LogIn size={16} />
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
