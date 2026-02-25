import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { Mail, Lock, BookMarked, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col auth-mesh grid-pattern relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col justify-between h-full p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/20">
              <BookMarked className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">LibraryOS</span>
          </div>

          {/* Center copy */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold ring-1 ring-white/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                Professional Library Management
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance">
                Manage your library <br />with precision.
              </h1>
              <p className="text-base text-white/70 leading-relaxed max-w-xs">
                A modern platform for tracking books, borrowers, and transactions — all in one place.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['Real-time Inventory', 'Role-based Access', 'Overdue Alerts', 'Dark Mode'].map(f => (
                <span key={f} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} LibraryOS. Built for librarians.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12 bg-white dark:bg-neutral-950">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm">
              <BookMarked className="h-4.5 w-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              Library<span className="text-primary-600">OS</span>
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-neutral-500">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 text-sm animate-slide-in-up">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError(); }}
                  className="input-field pl-10"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  className="input-field pl-10 pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
