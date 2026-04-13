import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Hash, Lock, Trash2, Camera } from 'lucide-react';
import { userService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user: authUser, setAuth, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [name, setName] = useState(authUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateMe(data),
    onSuccess: (res) => {
      toast.success('Profile updated!');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      if (authUser) setAuth({ ...authUser, name: res.data.name }, useAuthStore.getState().accessToken!);
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => userService.changePassword({ currentPassword, newPassword, confirmNewPassword: newPassword }),
    onSuccess: () => {
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      toast.success('Avatar updated!');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: () => toast.error('Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteMe(),
    onSuccess: () => {
      toast.success('Account deleted');
      logout();
      window.location.href = '/';
    },
  });

  const profile = data?.data || authUser;

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-display-lg">MY PROFILE</h1>

      {/* Avatar Section */}
      <div className="glass-card p-6 flex items-center gap-6">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-prisma-crimson/20 flex items-center justify-center">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-prisma-crimson">{profile?.name?.charAt(0)}</span>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <Camera className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              if (e.target.files?.[0]) avatarMutation.mutate(e.target.files[0]);
            }} />
          </label>
        </div>
        <div>
          <h2 className="font-display text-xl tracking-wider">{profile?.name}</h2>
          <p className="font-mono text-xs text-prisma-muted">{profile?.email}</p>
          <span className="badge-crimson mt-2 inline-block">{profile?.role}</span>
        </div>
      </div>

      {/* Profile Details */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg tracking-wider">PERSONAL INFO</h3>
          <button onClick={() => setEditing(!editing)} className="btn-ghost text-xs font-mono">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            ) : (
              <p className="font-mono text-sm py-3 flex items-center gap-2"><User className="w-4 h-4 text-prisma-muted" /> {profile?.name}</p>
            )}
          </div>
          <div>
            <label className="label-text">Email</label>
            <p className="font-mono text-sm py-3 flex items-center gap-2"><Mail className="w-4 h-4 text-prisma-muted" /> {profile?.email}</p>
          </div>
          <div>
            <label className="label-text">Student ID</label>
            <p className="font-mono text-sm py-3 flex items-center gap-2"><Hash className="w-4 h-4 text-prisma-muted" /> {profile?.studentId || 'Not set'}</p>
          </div>
        </div>

        {editing && (
          <button onClick={() => updateMutation.mutate({ name })} disabled={updateMutation.isPending} className="btn-primary text-sm">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display text-lg tracking-wider">CHANGE PASSWORD</h3>
        <div>
          <label className="label-text">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" placeholder="••••••••" />
        </div>
        <div>
          <label className="label-text">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="••••••••" />
        </div>
        <button
          onClick={() => passwordMutation.mutate()}
          disabled={!currentPassword || !newPassword || passwordMutation.isPending}
          className="btn-primary text-sm"
        >
          {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-prisma-crimson/20">
        <h3 className="font-display text-lg tracking-wider text-prisma-crimson mb-2">DANGER ZONE</h3>
        <p className="font-mono text-xs text-prisma-muted mb-4">Once you delete your account, there is no going back.</p>
        <button onClick={() => setShowDeleteModal(true)} className="btn-ghost text-xs text-prisma-crimson border border-prisma-crimson/30 hover:bg-prisma-crimson/10">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="text-center space-y-4">
          <Trash2 className="w-12 h-12 text-prisma-crimson mx-auto" />
          <p className="font-display text-lg">ARE YOU SURE?</p>
          <p className="font-mono text-sm text-prisma-muted">This action cannot be undone. All your data will be permanently deleted.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button onClick={() => deleteMutation.mutate()} className="btn-primary flex-1 text-sm bg-prisma-crimson">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
