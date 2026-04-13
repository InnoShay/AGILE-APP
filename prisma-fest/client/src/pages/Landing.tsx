import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin, Calendar as CalendarIcon, Users, Zap, ChevronRight, Star, ExternalLink } from 'lucide-react';
import { useCountdown, useLiveCount } from '../hooks';
import { eventService, sponsorService } from '../services';

// Fest opening date
const FEST_DATE = new Date('2025-11-15T09:00:00');

const categories = [
  'TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'GAMING',
  'MUSIC', 'DANCE', 'ARTS', 'LITERARY', 'HACKATHON',
  'TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'GAMING',
  'MUSIC', 'DANCE', 'ARTS', 'LITERARY', 'HACKATHON',
];

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  },
};

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const countdown = useCountdown(FEST_DATE);
  const liveCount = useLiveCount();

  const { data: eventsData } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventService.list({ limit: '3', sortBy: 'popularity', sortOrder: 'desc' }),
  });

  const { data: sponsorsData } = useQuery({
    queryKey: ['sponsors'],
    queryFn: () => sponsorService.list(),
  });

  const events = eventsData?.data?.events || [];
  const sponsors = sponsorsData?.data || [];

  return (
    <div className="bg-prisma-black overflow-hidden">
      {/* ─── HERO ─── */}
      <motion.section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ opacity: heroOpacity }}>
        {/* Ambient grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,36,66,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,36,66,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-prisma-crimson/5 blur-[150px]" />

        <motion.div className="relative z-10 text-center px-4" style={{ scale: heroScale, y: heroY }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-xs uppercase tracking-[0.4em] text-prisma-muted mb-6"
          >
            SRM University Sonepat Presents
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className="font-display text-hero leading-none tracking-wider"
          >
            <span className="block">PRISMA</span>
            <span className="block text-prisma-crimson">FEST</span>
            <span className="block text-[clamp(1.5rem,4vw,3rem)]">2025</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-serif italic text-lg md:text-xl text-prisma-gold mt-6 max-w-lg mx-auto"
          >
            Where Creativity Collides with Innovation
          </motion.p>

          {/* Live Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-sm text-prisma-muted">
              <span className="text-emerald-400 font-bold">{liveCount || 247}</span> people online now
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link to="/register" className="btn-primary text-base px-8 py-4 group">
              Register Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="btn-secondary text-base px-8 py-4">
              Explore Events
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border-2 border-prisma-muted/30 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-prisma-muted/60 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── COUNTDOWN ─── */}
      <section className="py-16 border-y border-prisma-border">
        <div className="page-container">
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-prisma-muted mb-8">
            Countdown to PRISMA Fest 2025
          </p>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="glass-card w-20 h-20 md:w-28 md:h-28 flex items-center justify-center mb-2 overflow-hidden">
                  <motion.span
                    key={item.value}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    className="font-display text-3xl md:text-5xl text-prisma-crimson"
                    style={{ perspective: '200px' }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </motion.span>
                </div>
                <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-prisma-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <section className="py-6 overflow-hidden border-b border-prisma-border">
        <div className="flex animate-marquee whitespace-nowrap">
          {categories.map((cat, i) => (
            <span key={i} className="font-display text-4xl md:text-6xl tracking-wider mx-6 md:mx-12 text-prisma-muted/20 hover:text-prisma-crimson/50 transition-colors cursor-default">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* ─── FEATURED EVENTS ─── */}
      <section className="py-20 md:py-32">
        <div className="page-container">
          <motion.div variants={stagger.container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
            <motion.div variants={stagger.item} className="mb-12">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-prisma-crimson mb-2">Featured</p>
              <h2 className="font-display text-display-lg">DON'T MISS OUT</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any, i: number) => (
                <motion.div key={event.id} variants={stagger.item}>
                  <Link to={`/events/${event.id}`} className="glass-card-hover block group overflow-hidden">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={event.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-prisma-black via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="badge-crimson">{event.category}</span>
                      </div>
                      {event.isFree ? (
                        <span className="absolute top-3 right-3 badge-teal">Free</span>
                      ) : (
                        <span className="absolute top-3 right-3 badge-gold">₹{event.price}</span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl tracking-wider mb-2 group-hover:text-prisma-crimson transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-1.5 text-prisma-muted">
                        <p className="flex items-center gap-2 font-mono text-xs">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {event.time}
                        </p>
                        <p className="flex items-center gap-2 font-mono text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}
                        </p>
                      </div>
                      {/* Capacity bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-mono text-prisma-muted mb-1">
                          <span>{event.registeredCount} registered</span>
                          <span>{event.totalCapacity} spots</span>
                        </div>
                        <div className="h-1 bg-prisma-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-prisma-crimson rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((event.registeredCount / event.totalCapacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div variants={stagger.item} className="text-center mt-10">
              <Link to="/events" className="btn-secondary group">
                View All Events <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── SPONSORS ─── */}
      {sponsors.length > 0 && (
        <section className="py-20 border-t border-prisma-border">
          <div className="page-container text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-prisma-gold mb-2">Powered By</p>
            <h2 className="font-display text-display mb-12">OUR SPONSORS</h2>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {sponsors.map((sponsor: any) => (
                <motion.a
                  key={sponsor.id}
                  href={sponsor.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-4 md:p-6 flex flex-col items-center gap-3 group"
                >
                  <img src={sponsor.logoUrl} alt={sponsor.name} className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="font-mono text-xs text-prisma-muted">{sponsor.name}</span>
                  <span className={`badge text-[9px] ${
                    sponsor.tier === 'title' ? 'badge-gold' : sponsor.tier === 'gold' ? 'badge-gold' : 'badge-crimson'
                  }`}>
                    {sponsor.tier} sponsor
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-prisma-border py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-prisma-crimson" />
                <span className="font-display text-2xl tracking-wider">PRISMA FEST</span>
              </div>
              <p className="font-serif italic text-prisma-muted max-w-md">
                The official annual cultural & technical fest of SRM University Sonepat. Three days of innovation, creativity, and celebration.
              </p>
            </div>
            <div>
              <h4 className="font-display text-sm tracking-wider mb-4 text-prisma-muted">QUICK LINKS</h4>
              <nav className="space-y-2">
                {[
                  { label: 'Events', href: '/events' },
                  { label: 'Schedule', href: '/schedule' },
                  { label: 'Register', href: '/register' },
                  { label: 'Login', href: '/login' },
                ].map((link) => (
                  <Link key={link.href} to={link.href} className="block font-mono text-sm text-prisma-muted hover:text-prisma-ivory transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="font-display text-sm tracking-wider mb-4 text-prisma-muted">CONNECT</h4>
              <div className="space-y-2">
                <a href="https://instagram.com" target="_blank" className="flex items-center gap-2 font-mono text-sm text-prisma-muted hover:text-prisma-ivory transition-colors">
                  Instagram <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://twitter.com" target="_blank" className="flex items-center gap-2 font-mono text-sm text-prisma-muted hover:text-prisma-ivory transition-colors">
                  Twitter/X <ExternalLink className="w-3 h-3" />
                </a>
                <p className="font-mono text-sm text-prisma-muted mt-4">
                  contact@prismafest.com
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-prisma-border mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-prisma-muted">
              © 2025 PRISMA Fest — SRM University Sonepat. All rights reserved.
            </p>
            <p className="font-mono text-xs text-prisma-muted">
              Built with ❤️ for the PRISMA community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
