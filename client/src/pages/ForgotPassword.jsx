import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';

const ForgotPassword = () => {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [devLink, setDevLink]     = useState('');
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/auth/forgot-password', { email });
      if (data.devResetURL) setDevLink(data.devResetURL); // dev mode link
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          <p className="text-slate-400 text-sm mt-1">Reset your password</p>
        </div>

        <div className="card p-6 sm:p-8">
          {sent ? (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Check your inbox!
              </h2>
              <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
                If <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span> is registered,
                we've sent a password reset link. It expires in <strong>15 minutes</strong>.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
                Don't see it? Check your spam folder.
              </p>
              {devLink && (
                <div className="mt-2 mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-left">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    🧪 Dev Mode — Click to reset:
                  </p>
                  <a href={devLink} className="text-xs text-primary-600 dark:text-primary-400 break-all hover:underline">
                    {devLink}
                  </a>
                </div>
              )}
              <Link to="/login" className="btn-primary inline-flex">
                Back to Login
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Forgot your password?
                </h2>
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-9"
                    placeholder="you@example.com"
                    id="forgot-email"
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full justify-center" id="send-reset-btn">
                Send Reset Link
              </Button>

              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-light dark:text-muted-dark hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
