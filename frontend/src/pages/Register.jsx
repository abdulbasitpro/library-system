import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { User, Mail, Lock, BookMarked, ArrowRight, Eye, EyeOff } from 'lucide-react';


const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); clearError(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-12">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-60" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              Library<span className="text-primary-600">OS</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="card p-8 dark:bg-neutral-900/80 dark:border-neutral-700/60 shadow-card-md backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Create your account</h2>
            <p className="text-sm text-neutral-500 mt-1">Join LibraryOS as a member. Admins are assigned by the library team.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 text-sm animate-slide-in-up">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={set('name')}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  className="input-field pl-10"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  className="input-field pl-10 pr-11"
                  placeholder="Min. 6 characters"
                  minLength={6}
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


            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Create Account
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
