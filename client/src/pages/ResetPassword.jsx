import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Library, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { refetch } = useAuth();

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/auth/reset-password/${token}`, { password });
      await refetch(); // refresh auth context with new session
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
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
          <p className="text-slate-400 text-sm mt-1">Set a new password</p>
        </div>

        <div className="card p-6 sm:p-8">
          {success ? (
            <div className="text-center py-4">
              <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Password updated!
              </h2>
              <p className="text-sm text-muted-light dark:text-muted-dark">
                Redirecting you to the dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Create a new password
                </h2>
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  Must be at least 6 characters.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-field pr-10"
                    placeholder="Min. 6 characters"
                    id="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`input-field ${confirm && confirm !== password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Re-enter password"
                  id="confirm-password"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full justify-center" id="reset-password-btn">
                <ShieldCheck size={16} /> Reset Password
              </Button>

              <p className="text-center text-sm text-muted-light dark:text-muted-dark">
                Remember it?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
