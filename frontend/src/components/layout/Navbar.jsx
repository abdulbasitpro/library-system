import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Bell, LogOut, User, ChevronDown, BookMarked } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  // Apply initial dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center px-5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 shrink-0">
      <div className="flex flex-1 items-center gap-4">
        {/* Sidebar toggle (mobile) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-sm">
            <BookMarked className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            Library<span className="text-primary-600">OS</span>
          </span>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search books, users..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all duration-200"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark
            ? <Sun className="h-4.5 w-4.5 transition-transform duration-300 rotate-0 hover:rotate-12" style={{ width: '18px', height: '18px' }} />
            : <Moon className="h-4.5 w-4.5 transition-transform duration-300" style={{ width: '18px', height: '18px' }} />
          }
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 group"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-glow-sm shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-xs text-neutral-400 capitalize leading-none mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-card-hover animate-scale-in overflow-hidden z-50">
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{user?.name}</p>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <button
                  onClick={() => { logout(); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
