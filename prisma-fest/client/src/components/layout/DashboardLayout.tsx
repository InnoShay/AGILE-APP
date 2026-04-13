import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Ticket, Bell, Clock, User, LogOut,
  PlusCircle, BarChart3, Users, Megaphone, Award, Menu, X, Zap, Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { authService } from '../../services';
import toast from 'react-hot-toast';

const studentLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Browse Events', href: '/events' },
  { icon: Ticket, label: 'My Tickets', href: '/tickets' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Clock, label: 'Schedule', href: '/schedule' },
  { icon: User, label: 'Profile', href: '/profile' },
];

const organizerLinks = [
  { icon: BarChart3, label: 'Overview', href: '/organizer' },
  { icon: PlusCircle, label: 'Create Event', href: '/organizer/events/new' },
  { icon: Calendar, label: 'Browse Events', href: '/events' },
  { icon: Clock, label: 'Schedule', href: '/schedule' },
  { icon: User, label: 'Profile', href: '/profile' },
];

const adminLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Manage Users', href: '/admin/users' },
  { icon: Calendar, label: 'Manage Events', href: '/admin/events' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
  { icon: Award, label: 'Sponsors', href: '/admin/sponsors' },
  { icon: Clock, label: 'Schedule', href: '/schedule' },
  { icon: Settings, label: 'Profile', href: '/profile' },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'organizer' ? organizerLinks : studentLinks;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-prisma-black">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-prisma-dark-surface border-r border-prisma-border fixed h-full z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-prisma-border">
          <Zap className="w-5 h-5 text-prisma-crimson" />
          <span className="font-display text-xl tracking-wider">PRISMA</span>
          <span className="badge-crimson text-[10px] ml-auto">
            {user?.role?.toUpperCase()}
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-mono transition-all duration-200 ${
                  active
                    ? 'bg-prisma-crimson/10 text-prisma-crimson border border-prisma-crimson/20'
                    : 'text-prisma-muted hover:bg-prisma-card hover:text-prisma-ivory'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="border-t border-prisma-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-prisma-crimson/20 flex items-center justify-center text-xs font-display text-prisma-crimson">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.name}</p>
              <p className="text-xs text-prisma-muted truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-start gap-2 text-xs text-prisma-muted hover:text-prisma-crimson">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-prisma-dark-surface/95 backdrop-blur-xl border-b border-prisma-border z-50 flex items-center px-4">
        <button onClick={toggleSidebar} className="p-1.5" aria-label="Toggle sidebar">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display text-lg tracking-wider ml-3">PRISMA</span>
        <span className="badge-crimson text-[10px] ml-auto">{user?.role?.toUpperCase()}</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-prisma-dark-surface border-r border-prisma-border z-50"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-prisma-border">
                <span className="font-display text-lg tracking-wider">PRISMA</span>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 px-3">
                {links.map((link) => {
                  const active = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-mono transition-all ${
                        active
                          ? 'bg-prisma-crimson/10 text-prisma-crimson'
                          : 'text-prisma-muted hover:bg-prisma-card hover:text-prisma-ivory'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-prisma-border p-4">
                <button onClick={handleLogout} className="btn-ghost w-full justify-start gap-2 text-xs text-prisma-muted">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
