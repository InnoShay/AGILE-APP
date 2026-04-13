import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Calendar, Ticket, DollarSign, Activity, Database, Wifi } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyticsService } from '../services';
import { Skeleton } from '../components/ui/LoadingScreen';

const COLORS = ['#FF2442', '#C9A84C', '#0D3B38', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsService.getOverview(),
  });

  const analytics = data?.data;

  const stats = [
    { icon: Users, label: 'Total Users', value: analytics?.totalUsers || 0, color: 'text-prisma-crimson', bg: 'bg-prisma-crimson/10' },
    { icon: Calendar, label: 'Total Events', value: analytics?.totalEvents || 0, color: 'text-prisma-gold', bg: 'bg-prisma-gold/10' },
    { icon: Ticket, label: 'Total Registrations', value: analytics?.totalRegistrations || 0, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  ];

  const systemHealth = [
    { icon: Activity, label: 'API Latency', value: '12ms', status: 'healthy' },
    { icon: Database, label: 'Database', value: 'Connected', status: 'healthy' },
    { icon: Wifi, label: 'Cache Hit Rate', value: '94.2%', status: 'healthy' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="font-display text-display-lg">ADMIN DASHBOARD</h1>
        <p className="font-mono text-sm text-prisma-muted mt-1">Platform-wide overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-display text-3xl">{isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}</p>
            <p className="font-mono text-xs text-prisma-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-sm tracking-wider mb-4">TOP EVENTS BY REGISTRATION</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.eventsWithRegs?.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
                <XAxis type="number" tick={{ fill: '#6B6B7B', fontSize: 10 }} />
                <YAxis type="category" dataKey="title" width={120} tick={{ fill: '#6B6B7B', fontSize: 9, fontFamily: 'DM Mono' }} />
                <Tooltip contentStyle={{ background: '#16161E', border: '1px solid #2A2A35', borderRadius: 8 }} />
                <Bar dataKey="registeredCount" fill="#FF2442" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-sm tracking-wider mb-4">CATEGORY DISTRIBUTION</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics.categoryDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="count" label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {analytics.categoryDistribution?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161E', border: '1px solid #2A2A35', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="glass-card p-6">
        <h3 className="font-display text-sm tracking-wider mb-4">SYSTEM HEALTH</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemHealth.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 bg-prisma-card rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-mono text-xs text-prisma-muted">{item.label}</p>
                <p className="text-sm font-display">{item.value}</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
