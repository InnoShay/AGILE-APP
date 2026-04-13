import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, Hash } from 'lucide-react';
import { registerSchema, RegisterInput } from '@shared/schemas/auth';
import { authService } from '../services';
import toast from 'react-hot-toast';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false as any },
  });

  const password = watch('password', '');

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400'];

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-prisma-dark-surface items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,36,66,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,36,66,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-prisma-crimson/8 blur-[150px]" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
          <Zap className="w-16 h-16 text-prisma-crimson mx-auto mb-6" />
          <h1 className="font-display text-8xl leading-none tracking-wider">JOIN</h1>
          <h1 className="font-display text-[6rem] leading-none tracking-wider text-prisma-crimson">PRISMA</h1>
          <p className="font-serif italic text-lg text-prisma-gold mt-4">Be Part of Something Extraordinary</p>
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-prisma-crimson" />
            <span className="font-display text-2xl tracking-wider">PRISMA</span>
          </div>

          <h2 className="font-display text-display-lg mb-2">CREATE ACCOUNT</h2>
          <p className="text-prisma-muted font-mono text-sm mb-8">Register for PRISMA Fest 2025</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
                <input {...register('name')} id="name" placeholder="Your full name" className="input-field pl-10" aria-label="Full name" />
              </div>
              {errors.name && <p className="mt-1 text-xs text-prisma-crimson font-mono">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label-text" htmlFor="reg-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
                <input {...register('email')} id="reg-email" type="email" placeholder="you@example.com" className="input-field pl-10" aria-label="Email" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-prisma-crimson font-mono">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-text" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
                <input {...register('password')} id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-10 pr-10" aria-label="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-prisma-muted hover:text-prisma-ivory" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${strength >= level ? strengthColor[Math.min(strength, 5)] : 'bg-prisma-border'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-prisma-muted">{strengthLabel[Math.min(strength, 5)]}</p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-prisma-crimson font-mono">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label-text" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
                <input {...register('confirmPassword')} id="confirmPassword" type="password" placeholder="••••••••" className="input-field pl-10" aria-label="Confirm password" />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-prisma-crimson font-mono">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="label-text" htmlFor="studentId">Student ID (optional)</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
                <input {...register('studentId')} id="studentId" placeholder="SRM2025XXX" className="input-field pl-10" aria-label="Student ID" />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input {...register('acceptTerms')} type="checkbox" className="mt-0.5 w-4 h-4 rounded border-prisma-border bg-prisma-dark-surface text-prisma-crimson focus:ring-prisma-crimson" />
              <span className="text-xs font-mono text-prisma-muted">I agree to the Terms & Conditions and Privacy Policy</span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-prisma-crimson font-mono">{errors.acceptTerms.message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 font-mono text-sm text-prisma-muted">
            Already have an account? <Link to="/login" className="text-prisma-crimson hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
