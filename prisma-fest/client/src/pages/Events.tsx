import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Users, X } from 'lucide-react';
import { eventService } from '../services';
import { useDebounce } from '../hooks';
import { CardSkeleton } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';

const categories = ['all', 'technical', 'cultural', 'sports', 'workshop', 'gaming', 'music', 'dance', 'arts', 'literary'];
const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price', label: 'Price' },
];

export default function Events() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isFree, setIsFree] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['events', { search: debouncedSearch, category, isFree, sortBy }],
    queryFn: () => eventService.list({
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(category !== 'all' && { category }),
      ...(isFree && { isFree }),
      sortBy,
      sortOrder: sortBy === 'date' ? 'asc' : 'desc',
      limit: '24',
    }),
  });

  const events = data?.data?.events || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-lg">EXPLORE EVENTS</h1>
        <p className="font-mono text-sm text-prisma-muted mt-1">
          {data?.data?.pagination?.total || 0} events available
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="input-field pl-10"
            aria-label="Search events"
          />
        </div>
        <div className="flex gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto" aria-label="Sort by">
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-ghost px-3 ${showFilters ? 'text-prisma-crimson' : ''}`} aria-label="Toggle filters">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-4">
          <div>
            <p className="label-text mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`badge cursor-pointer transition-all ${
                    category === cat ? 'badge-crimson' : 'bg-prisma-card text-prisma-muted border border-prisma-border hover:border-prisma-crimson/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label-text mb-3">Price</p>
            <div className="flex gap-2">
              {[
                { value: undefined, label: 'All' },
                { value: 'true', label: 'Free' },
                { value: 'false', label: 'Paid' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setIsFree(opt.value)}
                  className={`badge cursor-pointer transition-all ${
                    isFree === opt.value ? 'badge-crimson' : 'bg-prisma-card text-prisma-muted border border-prisma-border hover:border-prisma-crimson/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Filters */}
      {(category !== 'all' || isFree || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-prisma-muted">Active filters:</span>
          {category !== 'all' && (
            <button onClick={() => setCategory('all')} className="badge-crimson flex items-center gap-1">
              {category} <X className="w-3 h-3" />
            </button>
          )}
          {isFree && (
            <button onClick={() => setIsFree(undefined)} className="badge-crimson flex items-center gap-1">
              {isFree === 'true' ? 'Free' : 'Paid'} <X className="w-3 h-3" />
            </button>
          )}
          {search && (
            <button onClick={() => setSearch('')} className="badge-crimson flex items-center gap-1">
              "{search}" <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="NO EVENTS FOUND"
          description="Try adjusting your filters or search term."
          action={
            <button onClick={() => { setSearch(''); setCategory('all'); setIsFree(undefined); }} className="btn-primary text-sm">
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event: any, i: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/events/${event.id}`} className="glass-card-hover block group overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-prisma-black via-transparent to-transparent" />
                  <span className="absolute top-2.5 left-2.5 badge-crimson text-[10px]">{event.category}</span>
                  {event.isFree ? (
                    <span className="absolute top-2.5 right-2.5 badge-teal text-[10px]">Free</span>
                  ) : (
                    <span className="absolute top-2.5 right-2.5 badge-gold text-[10px]">₹{event.price}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg tracking-wider mb-1.5 group-hover:text-prisma-crimson transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-1 text-prisma-muted">
                    <p className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {event.time}
                    </p>
                    <p className="flex items-center gap-1.5 font-mono text-[11px]">
                      <MapPin className="w-3 h-3" /> {event.venue}
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-prisma-muted mb-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.registeredCount}</span>
                      <span>{event.totalCapacity} total</span>
                    </div>
                    <div className="h-1 bg-prisma-border rounded-full overflow-hidden">
                      <div className="h-full bg-prisma-crimson rounded-full" style={{ width: `${Math.min((event.registeredCount / event.totalCapacity) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
