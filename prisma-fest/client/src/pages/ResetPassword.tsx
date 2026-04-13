import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordInput } from '@shared/schemas/auth';
import { authService } from '../services';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password, data.confirmPassword);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <h2 className="font-display text-display mb-2">RESET PASSWORD</h2>
        <p className="text-prisma-muted font-mono text-sm mb-8">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label-text">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
              <input {...register('password')} type="password" placeholder="••••••••" className="input-field pl-10" aria-label="New password" />
            </div>
            {errors.password && <p className="mt-1 text-xs text-prisma-crimson font-mono">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label-text">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input-field pl-10" aria-label="Confirm password" />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-prisma-crimson font-mono">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
