import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventService } from '../services';
import { Skeleton } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function ManageEvents() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-events'],
    queryFn: () => eventService.list({ limit: '50' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => eventService.cancel(id),
    onSuccess: () => { toast.success('Event cancelled'); queryClient.invalidateQueries({ queryKey: ['admin-all-events'] }); },
  });

  const events = data?.data?.events || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-display-lg">MANAGE EVENTS</h1>
      <p className="font-mono text-sm text-prisma-muted">{events.length} events total</p>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-prisma-border">
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Event</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Organizer</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Category</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Status</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Registrations</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event.id} className="border-b border-prisma-border/50 hover:bg-prisma-card/30">
                    <td className="p-3 text-sm max-w-[200px] truncate">{event.title}</td>
                    <td className="p-3 font-mono text-xs text-prisma-muted">{event.organizer?.name}</td>
                    <td className="p-3"><span className="badge-crimson text-[10px]">{event.category}</span></td>
                    <td className="p-3">
                      <span className={`badge text-[10px] ${
                        event.status === 'upcoming' ? 'badge-teal' :
                        event.status === 'live' ? 'badge-gold' :
                        event.status === 'cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                        'bg-prisma-card text-prisma-muted border border-prisma-border'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{event.registeredCount}/{event.totalCapacity}</td>
                    <td className="p-3 flex items-center gap-2">
                      <Link to={`/events/${event.id}`} className="btn-ghost text-[10px]"><Eye className="w-3 h-3" /></Link>
                      {event.status !== 'cancelled' && (
                        <button onClick={() => cancelMutation.mutate(event.id)} className="btn-ghost text-[10px] text-prisma-crimson">
                          <XCircle className="w-3 h-3" /> Cancel
                        </button>
                      )}
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
