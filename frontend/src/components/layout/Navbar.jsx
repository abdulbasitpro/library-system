import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            LibraryOS
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <User className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
