import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if account exists');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-mono text-prisma-muted hover:text-prisma-ivory mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <h2 className="font-display text-display mb-2">FORGOT PASSWORD</h2>
        <p className="text-prisma-muted font-mono text-sm mb-8">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="glass-card p-8 text-center">
            <Mail className="w-12 h-12 text-prisma-crimson mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">CHECK YOUR EMAIL</h3>
            <p className="font-mono text-sm text-prisma-muted">If an account exists for <span className="text-prisma-ivory">{email}</span>, we've sent a reset link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input-field pl-10" aria-label="Email" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
