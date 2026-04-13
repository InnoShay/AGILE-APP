import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldOff, Ban, Search } from 'lucide-react';
import { useState } from 'react';
import { userService } from '../services';
import { Skeleton } from '../components/ui/LoadingScreen';
import { useDebounce } from '../hooks';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search: debouncedSearch, role: roleFilter }],
    queryFn: () => userService.listUsers({ search: debouncedSearch, role: roleFilter || undefined }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userService.updateRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => userService.toggleBan(id),
    onSuccess: () => { toast.success('User status updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const users = data?.data?.users || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-display-lg">MANAGE USERS</h1>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-prisma-border">
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">User</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Email</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Role</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Status</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Joined</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-prisma-border/50 hover:bg-prisma-card/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-prisma-crimson/20 flex items-center justify-center text-xs font-display text-prisma-crimson">
                          {user.name?.charAt(0)}
                        </div>
                        <span className="text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-prisma-muted">{user.email}</td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                        className="bg-transparent border border-prisma-border rounded px-2 py-1 text-[10px] font-mono"
                      >
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {user.isBanned ? (
                        <span className="badge bg-red-500/15 text-red-400 border border-red-500/20 text-[10px]">Banned</span>
                      ) : (
                        <span className="badge-teal text-[10px]">Active</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs text-prisma-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => banMutation.mutate(user.id)}
                        className={`btn-ghost text-[10px] ${user.isBanned ? 'text-emerald-400' : 'text-prisma-crimson'}`}
                      >
                        {user.isBanned ? <><ShieldOff className="w-3 h-3" /> Unban</> : <><Ban className="w-3 h-3" /> Ban</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
