import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Bell, ArrowRight, Clock, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { registrationService, notificationService, eventService } from '../services';
import { CardSkeleton } from '../components/ui/LoadingScreen';

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
};

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: regsData, isLoading: regsLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => registrationService.getMine(),
  });

  const { data: notifsData } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => notificationService.getMine(),
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['today-events'],
    queryFn: () => eventService.list({ status: 'upcoming', limit: '6', sortBy: 'date', sortOrder: 'asc' }),
  });

  const registrations = regsData?.data || [];
  const unreadCount = notifsData?.data?.unreadCount || 0;
  const upcomingEvents = eventsData?.data?.events || [];
  const myUpcoming = registrations.filter((r: any) => r.event?.status === 'upcoming');

  const stats = [
    { icon: Calendar, label: 'Events Registered', value: registrations.length, color: 'text-prisma-crimson', bg: 'bg-prisma-crimson/10' },
    { icon: Clock, label: 'Upcoming Events', value: myUpcoming.length, color: 'text-prisma-gold', bg: 'bg-prisma-gold/10' },
    { icon: Bell, label: 'Unread Notifications', value: unreadCount, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: Ticket, label: 'My Tickets', value: registrations.length, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  ];

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="visible" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={stagger.item}>
        <h1 className="font-display text-display-lg">
          WELCOME BACK, <span className="text-prisma-crimson">{user?.name?.split(' ')[0]?.toUpperCase()}</span>
        </h1>
        <p className="font-mono text-sm text-prisma-muted mt-1">Here's what's happening at PRISMA Fest</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-display text-3xl">{stat.value}</p>
            <p className="font-mono text-xs text-prisma-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Happening Today */}
      <motion.div variants={stagger.item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl tracking-wider">UPCOMING EVENTS</h2>
          <Link to="/events" className="flex items-center gap-1 text-xs font-mono text-prisma-crimson hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {upcomingEvents.map((event: any) => (
              <Link key={event.id} to={`/events/${event.id}`} className="glass-card-hover min-w-[280px] flex-shrink-0 overflow-hidden group">
                <div className="relative h-36 overflow-hidden">
                  <img src={event.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-prisma-black/80 to-transparent" />
                  <span className="absolute top-2 left-2 badge-crimson text-[10px]">{event.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base tracking-wider truncate">{event.title}</h3>
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-prisma-muted mt-1">
                    <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {event.time}
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-prisma-muted mt-0.5">
                    <MapPin className="w-3 h-3" /> {event.venue}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* My Upcoming Events */}
      <motion.div variants={stagger.item}>
        <h2 className="font-display text-xl tracking-wider mb-4">MY REGISTERED EVENTS</h2>
        {regsLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
        ) : myUpcoming.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-prisma-muted font-mono text-sm mb-4">You haven't registered for any upcoming events yet.</p>
            <Link to="/events" className="btn-primary text-sm">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myUpcoming.slice(0, 5).map((reg: any) => (
              <Link key={reg.id} to={`/events/${reg.event.id}`} className="glass-card-hover flex items-center gap-4 p-4 group">
                <div className="w-12 h-12 rounded-lg bg-prisma-crimson/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-prisma-crimson" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm tracking-wider truncate group-hover:text-prisma-crimson transition-colors">{reg.event.title}</h3>
                  <p className="font-mono text-[11px] text-prisma-muted">
                    {new Date(reg.event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {reg.event.time} · {reg.event.venue}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-prisma-muted group-hover:text-prisma-crimson transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/events" className="stat-card flex items-center gap-4 group">
          <Calendar className="w-8 h-8 text-prisma-crimson" />
          <div>
            <p className="font-display text-sm tracking-wider group-hover:text-prisma-crimson transition-colors">BROWSE EVENTS</p>
            <p className="font-mono text-[11px] text-prisma-muted">Discover & register</p>
          </div>
        </Link>
        <Link to="/tickets" className="stat-card flex items-center gap-4 group">
          <Ticket className="w-8 h-8 text-prisma-gold" />
          <div>
            <p className="font-display text-sm tracking-wider group-hover:text-prisma-gold transition-colors">MY TICKETS</p>
            <p className="font-mono text-[11px] text-prisma-muted">View your QR codes</p>
          </div>
        </Link>
        <Link to="/schedule" className="stat-card flex items-center gap-4 group">
          <Clock className="w-8 h-8 text-emerald-400" />
          <div>
            <p className="font-display text-sm tracking-wider group-hover:text-emerald-400 transition-colors">FEST SCHEDULE</p>
            <p className="font-mono text-[11px] text-prisma-muted">Day-wise timeline</p>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
