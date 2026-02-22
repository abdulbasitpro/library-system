import { Menu, X, Sun, Moon, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="btn-ghost p-2 rounded-lg md:hidden"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Page title — could be dynamic */}
      <div className="hidden md:block">
        <p className="text-xs text-muted-light dark:text-muted-dark font-medium">
          Welcome back,{' '}
          <span className="text-primary-600 dark:text-primary-400 font-semibold">{user?.name}</span>
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="btn-ghost p-2 rounded-lg"
          aria-label="Toggle dark mode"
          id="dark-mode-toggle"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            id="user-menu-btn"
            aria-expanded={userMenuOpen}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 card shadow-xl z-20 py-1 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-muted-light dark:text-muted-dark">{user?.email}</p>
                  <span className={`badge mt-1 text-[10px] ${user?.role === 'admin' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  id="logout-btn"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
