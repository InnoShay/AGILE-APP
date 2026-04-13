import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Calendar, Megaphone, Ticket, AlertTriangle } from 'lucide-react';
import { notificationService } from '../services';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/LoadingScreen';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const iconMap: Record<string, any> = {
  registration: Ticket,
  event_cancelled: AlertTriangle,
  announcement: Megaphone,
  welcome: Bell,
  general: Bell,
};

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => notificationService.getMine(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-lg">NOTIFICATIONS</h1>
          <p className="font-mono text-sm text-prisma-muted mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-ghost text-xs font-mono">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-prisma-muted" />}
          title="NO NOTIFICATIONS"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any, i: number) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                  notif.isRead ? 'bg-transparent' : 'bg-prisma-crimson/5 border border-prisma-crimson/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  notif.isRead ? 'bg-prisma-card' : 'bg-prisma-crimson/10'
                }`}>
                  <Icon className={`w-4 h-4 ${notif.isRead ? 'text-prisma-muted' : 'text-prisma-crimson'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.isRead ? 'text-prisma-muted' : 'text-prisma-ivory'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-prisma-muted mt-0.5 font-mono">{notif.body}</p>
                  <p className="text-[10px] text-prisma-muted/60 mt-1 font-mono">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {notif.eventId && (
                  <Link to={`/events/${notif.eventId}`} className="btn-ghost text-[10px] flex-shrink-0">View</Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
