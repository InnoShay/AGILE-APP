import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Events', href: '/events' },
    { label: 'Schedule', href: '/schedule' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-prisma-black/90 backdrop-blur-xl border-b border-prisma-border'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="page-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Zap className="w-6 h-6 text-prisma-crimson group-hover:animate-pulse" />
          <span className="font-display text-2xl tracking-wider">PRISMA</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`font-mono text-sm uppercase tracking-widest transition-colors duration-200 ${
                location.pathname === link.href
                  ? 'text-prisma-crimson'
                  : 'text-prisma-muted hover:text-prisma-ivory'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : '/dashboard'}
              className="btn-primary text-sm py-2 px-5"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost font-mono text-xs uppercase tracking-widest">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-prisma-black/95 backdrop-blur-xl border-b border-prisma-border"
          >
            <div className="page-container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-sm uppercase tracking-widest text-prisma-muted hover:text-prisma-ivory py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-prisma-border pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary text-sm">Login</Link>
                    <Link to="/register" className="btn-primary text-sm">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
