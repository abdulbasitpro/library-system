import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Library,
  Users,
  LogOut,
  BookMarked,
  X,
  ChevronRight,
  Heart,
  Clock,
  CalendarClock,
  AlertTriangle,
  BookPlus,
  MessageSquare,
  BarChart2,
  Download,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../utils/axiosInstance';

const NAV_MEMBER = [
  { name: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { name: 'Book Catalog',    path: '/catalog',          icon: BookOpen },
  { name: 'Transactions',    path: '/transactions',     icon: ArrowLeftRight },
  { name: 'Wishlist',        path: '/wishlist',         icon: Heart },
  { name: 'Reading History', path: '/reading-history',  icon: Clock },
  { name: 'Reservations',    path: '/reservations',     icon: CalendarClock },
  { name: 'My Fines',        path: '/fines',            icon: AlertTriangle },
  { name: 'Book Requests',   path: '/book-requests',    icon: BookPlus },
  { name: 'Messages',        path: '/messages',         icon: MessageSquare },
];

const NAV_ADMIN_MAIN = [
  { name: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { name: 'Book Catalog',    path: '/catalog',          icon: BookOpen },
  { name: 'Transactions',    path: '/transactions',     icon: ArrowLeftRight },
  { name: 'Messages',        path: '/messages',         icon: MessageSquare },
];

const NAV_ADMIN = [
  { name: 'Analytics',     path: '/admin/analytics', icon: BarChart2 },
  { name: 'Import Books',  path: '/admin/import',    icon: Download },
  { name: 'Manage Books',  path: '/admin/books',     icon: Library },
  { name: 'Manage Users',  path: '/admin/users',     icon: Users },
];

const NavItem = ({ link, onClick, badge = 0 }) => (
  <NavLink
    to={link.path}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
       ${isActive
         ? 'bg-primary-600 text-white shadow-glow-sm'
         : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
       }`
    }
  >
    {({ isActive }) => (
      <>
        <link.icon
          className={`shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
          style={{ width: '18px', height: '18px' }}
        />
        <span className="flex-1">{link.name}</span>

        {/* Unread badge — hidden when on the messages page itself */}
        {!isActive && badge > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
      </>
    )}
  </NavLink>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread message count every 60 seconds
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await axiosInstance.get('/messages/inbox?limit=1');
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 60000);
    return () => clearInterval(timer);
  }, [user]);

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const mainLinks = user?.role === 'admin' ? NAV_ADMIN_MAIN : NAV_MEMBER;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-white dark:bg-neutral-900
        border-r border-neutral-200 dark:border-neutral-800
        transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        lg:static lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-sm">
              <BookMarked className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              Library<span className="text-primary-600">OS</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 no-scrollbar">
          {/* Main / My Library */}
          <div className="space-y-1">
            <p className="label px-3 mb-3">
              {user?.role === 'admin' ? 'Main Menu' : 'My Library'}
            </p>
            {mainLinks.map(link => (
              <NavItem
                key={link.path}
                link={link}
                onClick={handleNavClick}
                badge={link.path === '/messages' ? unreadCount : 0}
              />
            ))}
          </div>

          {/* Administration (admin only) */}
          {user?.role === 'admin' && (
            <div className="space-y-1">
              <p className="label px-3 mb-3">Administration</p>
              {NAV_ADMIN.map(link => (
                <NavItem key={link.path} link={link} onClick={handleNavClick} />
              ))}
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 p-3 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
