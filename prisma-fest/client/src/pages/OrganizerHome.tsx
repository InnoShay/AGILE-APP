import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, Users, DollarSign, Star, PlusCircle, ArrowRight, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { eventService, analyticsService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { Skeleton } from '../components/ui/LoadingScreen';

const CHART_COLORS = ['#FF2442', '#C9A84C', '#0D3B38', '#6B6B7B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];

export default function OrganizerHome() {
  const user = useAuthStore((s) => s.user);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => eventService.list({ limit: '50' }),
  });

  const events = (eventsData?.data?.events || []).filter((e: any) => e.organizer?.id === user?.id);
  const totalRegs = events.reduce((acc: number, e: any) => acc + e.registeredCount, 0);
  const totalRevenue = events.filter((e: any) => !e.isFree).reduce((acc: number, e: any) => acc + (e.price * e.registeredCount), 0);

  const regsPerEvent = events.map((e: any) => ({ name: e.title.slice(0, 15), registrations: e.registeredCount }));
  const categoryDist = events.reduce((acc: any, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(categoryDist).map(([name, value]) => ({ name, value }));

  const stats = [
    { icon: Calendar, label: 'Total Events', value: events.length, color: 'text-prisma-crimson', bg: 'bg-prisma-crimson/10' },
    { icon: Users, label: 'Total Registrations', value: totalRegs, color: 'text-prisma-gold', bg: 'bg-prisma-gold/10' },
    { icon: DollarSign, label: 'Revenue (₹)', value: totalRevenue.toLocaleString(), color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: Star, label: 'Avg Rating', value: '4.5', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-lg">ORGANIZER DASHBOARD</h1>
          <p className="font-mono text-sm text-prisma-muted mt-1">Manage your events and track performance</p>
        </div>
        <Link to="/organizer/events/new" className="btn-primary text-sm">
          <PlusCircle className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-display text-3xl">{stat.value}</p>
            <p className="font-mono text-xs text-prisma-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="font-display text-sm tracking-wider mb-4">REGISTRATIONS PER EVENT</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regsPerEvent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
              <XAxis dataKey="name" tick={{ fill: '#6B6B7B', fontSize: 10, fontFamily: 'DM Mono' }} />
              <YAxis tick={{ fill: '#6B6B7B', fontSize: 10, fontFamily: 'DM Mono' }} />
              <Tooltip contentStyle={{ background: '#16161E', border: '1px solid #2A2A35', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }} />
              <Bar dataKey="registrations" fill="#FF2442" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="font-display text-sm tracking-wider mb-4">CATEGORY DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#16161E', border: '1px solid #2A2A35', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My Events Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-prisma-border flex items-center justify-between">
          <h3 className="font-display text-sm tracking-wider">MY EVENTS</h3>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-prisma-border">
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Event</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Category</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Status</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Registrations</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event.id} className="border-b border-prisma-border/50 hover:bg-prisma-card/50 transition-colors">
                    <td className="p-3 text-sm">{event.title}</td>
                    <td className="p-3"><span className="badge-crimson text-[10px]">{event.category}</span></td>
                    <td className="p-3"><span className="badge-teal text-[10px]">{event.status}</span></td>
                    <td className="p-3 font-mono text-sm">{event.registeredCount}/{event.totalCapacity}</td>
                    <td className="p-3">
                      <Link to={`/organizer/events/${event.id}`} className="btn-ghost text-[10px]">Manage <ArrowRight className="w-3 h-3" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
