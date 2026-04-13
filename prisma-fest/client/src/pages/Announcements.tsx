import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { announcementService } from '../services';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function Announcements() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => announcementService.create({ title, body, priority }),
    onSuccess: () => {
      toast.success('Announcement published!');
      setShowCreate(false);
      setTitle(''); setBody(''); setPriority('normal');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementService.delete(id),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const announcements = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-lg">ANNOUNCEMENTS</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : announcements.length === 0 ? (
        <EmptyState icon={<Megaphone className="w-10 h-10 text-prisma-muted" />} title="NO ANNOUNCEMENTS" description="Create an announcement to broadcast to all users." />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann: any, i: number) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 ${ann.priority === 'urgent' ? 'border-prisma-crimson/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-prisma-crimson" />}
                    <h3 className="font-display text-sm tracking-wider">{ann.title}</h3>
                    <span className={`badge text-[9px] ${ann.priority === 'urgent' ? 'badge-crimson' : 'bg-prisma-card text-prisma-muted border border-prisma-border'}`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-sm text-prisma-muted mt-1">{ann.body}</p>
                  <p className="font-mono text-[10px] text-prisma-muted/60 mt-2">
                    by {ann.createdBy?.name} · {new Date(ann.createdAt).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => deleteMutation.mutate(ann.id)} className="btn-ghost text-xs text-prisma-crimson">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Announcement" size="md">
        <div className="space-y-4">
          <div>
            <label className="label-text">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Announcement title..." />
          </div>
          <div>
            <label className="label-text">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input-field h-24 resize-none" placeholder="Announcement content..." />
          </div>
          <div>
            <label className="label-text">Priority</label>
            <div className="flex gap-3">
              <button onClick={() => setPriority('normal')} className={`flex-1 p-3 rounded-xl border ${priority === 'normal' ? 'border-prisma-crimson bg-prisma-crimson/10' : 'border-prisma-border'} text-center font-display text-sm`}>
                Normal
              </button>
              <button onClick={() => setPriority('urgent')} className={`flex-1 p-3 rounded-xl border ${priority === 'urgent' ? 'border-prisma-crimson bg-prisma-crimson/10' : 'border-prisma-border'} text-center font-display text-sm`}>
                🚨 Urgent
              </button>
            </div>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={!title || !body || createMutation.isPending} className="btn-primary w-full">
            {createMutation.isPending ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
