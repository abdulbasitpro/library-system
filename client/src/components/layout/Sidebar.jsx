import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ArrowLeftRight, Users,
  BookMarked, User, Settings, ChevronLeft, Library,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/catalog',      icon: BookOpen,         label: 'Book Catalog' },
  { to: '/admin/books',  icon: BookMarked,        label: 'Manage Books' },
  { to: '/admin/users',  icon: Users,             label: 'Manage Users' },
  { to: '/transactions', icon: ArrowLeftRight,    label: 'Transactions' },
  { to: '/profile',      icon: User,              label: 'My Profile' },
];

const memberLinks = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/catalog',      icon: BookOpen,         label: 'Browse Catalog' },
  { to: '/transactions', icon: ArrowLeftRight,    label: 'My Borrowings' },
  { to: '/profile',      icon: User,              label: 'My Profile' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : memberLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700/60
          flex flex-col shadow-xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:shadow-none md:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-700/60">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow">
              <Library size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">LibraryOS</p>
              <p className="text-[10px] text-muted-light dark:text-muted-dark capitalize">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden btn-ghost p-1.5 rounded-lg"
            aria-label="Close sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {user?.role === 'admin' ? 'Administration' : 'Navigation'}
          </p>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info footer */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-light dark:text-muted-dark truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
