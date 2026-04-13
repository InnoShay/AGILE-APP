import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, BarChart3, Settings, Download, XCircle, QrCode } from 'lucide-react';
import { eventService, analyticsService } from '../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function ManageEvent() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'registrations' | 'checkin' | 'analytics'>('registrations');
  const queryClient = useQueryClient();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.get(id!),
    enabled: !!id,
  });

  const { data: regsData } = useQuery({
    queryKey: ['event-registrations', id],
    queryFn: () => eventService.getRegistrations(id!),
    enabled: !!id,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['event-analytics', id],
    queryFn: () => analyticsService.getEventAnalytics(id!),
    enabled: !!id && activeTab === 'analytics',
  });

  const cancelMutation = useMutation({
    mutationFn: () => eventService.cancel(id!),
    onSuccess: () => {
      toast.success('Event cancelled');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  const event = eventData?.data;
  const registrations = regsData?.data || [];
  const analytics = analyticsData?.data;
  const tabs = [
    { key: 'registrations', label: 'Registrations', icon: Users },
    { key: 'checkin', label: 'Check-in', icon: QrCode },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  if (!event) return <p className="text-center py-20 font-display text-prisma-muted">Event not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display tracking-wider">{event.title}</h1>
          <div className="flex gap-2 mt-2">
            <span className="badge-crimson">{event.category}</span>
            <span className="badge-teal">{event.status}</span>
          </div>
        </div>
        {event.status !== 'cancelled' && (
          <button onClick={() => cancelMutation.mutate()} className="btn-ghost text-xs text-prisma-crimson border border-prisma-crimson/30">
            <XCircle className="w-4 h-4" /> Cancel Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-prisma-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-xs transition-colors ${
              activeTab === tab.key ? 'bg-prisma-card text-prisma-crimson border-b-2 border-prisma-crimson' : 'text-prisma-muted hover:text-prisma-ivory'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'registrations' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-prisma-border flex items-center justify-between">
            <span className="font-mono text-xs text-prisma-muted">{registrations.length} registrations</span>
            <button className="btn-ghost text-[10px]">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-prisma-border">
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Name</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Email</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Student ID</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Ticket</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg: any) => (
                  <tr key={reg.id} className="border-b border-prisma-border/50 hover:bg-prisma-card/30">
                    <td className="p-3 text-sm">{reg.user?.name}</td>
                    <td className="p-3 font-mono text-xs text-prisma-muted">{reg.user?.email}</td>
                    <td className="p-3 font-mono text-xs">{reg.user?.studentId || '-'}</td>
                    <td className="p-3"><span className={`badge text-[9px] ${reg.ticketType === 'vip' ? 'badge-gold' : 'badge-crimson'}`}>{reg.ticketType}</span></td>
                    <td className="p-3">
                      {reg.checkedIn ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]"><CheckCircle2 className="w-3 h-3" /> Checked In</span>
                      ) : (
                        <span className="font-mono text-[10px] text-prisma-muted">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'checkin' && (
        <div className="glass-card p-8 text-center">
          <QrCode className="w-16 h-16 text-prisma-crimson mx-auto mb-4" />
          <h3 className="font-display text-lg tracking-wider mb-2">QR SCANNER</h3>
          <p className="font-mono text-sm text-prisma-muted mb-4">Scan student QR codes to check them in</p>
          <p className="font-mono text-xs text-prisma-muted">
            Camera-based QR scanning requires the html5-qrcode library. Enter QR token manually:
          </p>
          <input type="text" className="input-field mt-4 max-w-md mx-auto" placeholder="Paste QR token here..." />
          <button className="btn-primary text-sm mt-4">Verify & Check In</button>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Registrations', value: analytics.totalRegistrations },
              { label: 'Checked In', value: analytics.checkedInCount },
              { label: 'Check-in Rate', value: `${analytics.checkInRate.toFixed(1)}%` },
              { label: 'Avg Rating', value: analytics.averageRating.toFixed(1) },
            ].map((stat) => (
              <div key={stat.label} className="stat-card text-center">
                <p className="font-display text-2xl">{stat.value}</p>
                <p className="font-mono text-[10px] text-prisma-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-sm tracking-wider mb-4">DAILY REGISTRATIONS</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.registrationsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
                <XAxis dataKey="date" tick={{ fill: '#6B6B7B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6B6B7B', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#16161E', border: '1px solid #2A2A35', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#FF2442" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
