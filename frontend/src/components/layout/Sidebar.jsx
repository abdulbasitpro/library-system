import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  History, 
  Users, 
  LogOut,
  X 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Catalog', path: '/catalog', icon: BookOpen },
    { name: 'Transactions', path: '/transactions', icon: History },
  ];

  if (user?.role === 'admin') {
    links.push(
      { name: 'Manage Books', path: '/admin/books', icon: Library },
      { name: 'Manage Users', path: '/admin/users', icon: Users }
    );
  }

  const NavItem = ({ link }) => (
    <NavLink
      to={link.path}
      onClick={() => window.innerWidth < 1024 && onClose()}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-semibold' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
      `}
    >
      <link.icon className="h-5 w-5" />
      <span>{link.name}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between lg:hidden">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">LibraryOS</span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {links.map((link) => (
              <NavItem key={link.path} link={link} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
