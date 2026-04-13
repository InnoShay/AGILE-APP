import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Star, Ticket, CheckCircle2 } from 'lucide-react';
import { eventService, registrationService, feedbackService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [showRegModal, setShowRegModal] = useState(false);
  const [ticketType, setTicketType] = useState<'general' | 'vip'>('general');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.get(id!),
    enabled: !!id,
  });

  const { data: feedbackData } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => feedbackService.getForEvent(id!),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () => registrationService.create({ eventId: id!, ticketType }),
    onSuccess: (res) => {
      toast.success('Registration successful!');
      setShowRegModal(false);
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: () => feedbackService.create({ eventId: id!, rating, comment }),
    onSuccess: () => {
      toast.success('Feedback submitted!');
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
      setRating(0);
      setComment('');
    },
    onError: (err: any) => toast.error(err.response?.data?.error?.message || 'Failed'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const event = data?.data;
  if (!event) return <div className="text-center py-20 font-display text-xl text-prisma-muted">Event not found</div>;

  const capacityPercent = Math.min((event.registeredCount / event.totalCapacity) * 100, 100);
  const isFull = event.registeredCount >= event.totalCapacity;
  const feedback = feedbackData?.data?.feedback || [];
  const avgRating = feedbackData?.data?.averageRating || event.averageRating || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Image */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        <img src={event.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-prisma-black via-prisma-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="badge-crimson">{event.category}</span>
            <span className={`badge ${event.status === 'upcoming' ? 'badge-teal' : event.status === 'live' ? 'badge-gold' : 'bg-prisma-card text-prisma-muted border border-prisma-border'}`}>
              {event.status}
            </span>
            {event.isFree ? <span className="badge-teal">Free</span> : <span className="badge-gold">₹{event.price}</span>}
          </div>
          <h1 className="font-display text-display tracking-wider">{event.title}</h1>
        </div>
      </motion.div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Date', value: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
          { icon: Clock, label: 'Time', value: event.time },
          { icon: MapPin, label: 'Venue', value: event.venue },
          { icon: Users, label: 'Spots', value: `${event.registeredCount}/${event.totalCapacity}` },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 text-center">
            <item.icon className="w-5 h-5 text-prisma-crimson mx-auto mb-2" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-prisma-muted">{item.label}</p>
            <p className="font-display text-sm mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Capacity Bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-xs font-mono text-prisma-muted mb-2">
          <span>Registration Progress</span>
          <span>{Math.round(capacityPercent)}%</span>
        </div>
        <div className="h-2 bg-prisma-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${capacityPercent}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${capacityPercent > 90 ? 'bg-prisma-crimson' : capacityPercent > 60 ? 'bg-prisma-gold' : 'bg-emerald-500'}`}
          />
        </div>
      </div>

      {/* Organizer */}
      <div className="flex items-center gap-3 glass-card p-4">
        <div className="w-10 h-10 rounded-full bg-prisma-crimson/20 flex items-center justify-center font-display text-prisma-crimson">
          {event.organizer?.name?.charAt(0)}
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-prisma-muted">Organized by</p>
          <p className="text-sm">{event.organizer?.name}</p>
        </div>
      </div>

      {/* Description */}
      <div className="glass-card p-6">
        <h2 className="font-display text-lg tracking-wider mb-4">ABOUT THIS EVENT</h2>
        <div className="prose prose-invert prose-sm max-w-none font-body" dangerouslySetInnerHTML={{ __html: event.description }} />
      </div>

      {/* Schedule */}
      {event.schedule && event.schedule.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-display text-lg tracking-wider mb-4">SCHEDULE</h2>
          <div className="space-y-3">
            {event.schedule.map((slot: any) => (
              <div key={slot.id} className="flex items-center gap-4 p-3 bg-prisma-card rounded-lg">
                <div className="font-mono text-xs text-prisma-crimson whitespace-nowrap">{slot.startTime} - {slot.endTime}</div>
                <div className="flex-1">
                  <p className="text-sm">{slot.title}</p>
                  <p className="font-mono text-[10px] text-prisma-muted">{slot.stage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Register Button */}
      {isAuthenticated && event.status === 'upcoming' && !isFull && (
        <button onClick={() => setShowRegModal(true)} className="btn-primary w-full py-4 text-lg">
          <Ticket className="w-5 h-5" />
          Register for this Event
        </button>
      )}
      {isFull && (
        <div className="glass-card p-4 text-center">
          <p className="font-display text-lg text-prisma-crimson">EVENT IS FULL</p>
          <p className="font-mono text-xs text-prisma-muted mt-1">All spots have been taken</p>
        </div>
      )}

      {/* Registration Modal */}
      <Modal isOpen={showRegModal} onClose={() => setShowRegModal(false)} title="Register for Event" size="md">
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-lg">{event.title}</h3>
            <p className="font-mono text-xs text-prisma-muted mt-1">{new Date(event.date).toLocaleDateString()} · {event.time} · {event.venue}</p>
          </div>

          {/* Ticket Type */}
          <div>
            <p className="label-text mb-3">Ticket Type</p>
            <div className="grid grid-cols-2 gap-3">
              {(['general', 'vip'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTicketType(type)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    ticketType === type ? 'border-prisma-crimson bg-prisma-crimson/10' : 'border-prisma-border hover:border-prisma-crimson/30'
                  }`}
                >
                  <p className="font-display text-sm uppercase">{type}</p>
                  <p className="font-mono text-lg mt-1">
                    {event.isFree ? 'Free' : `₹${type === 'vip' ? event.price * 2 : event.price}`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="glass-card p-4">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-prisma-muted">Ticket ({ticketType})</span>
              <span>{event.isFree ? 'Free' : `₹${ticketType === 'vip' ? event.price * 2 : event.price}`}</span>
            </div>
          </div>

          <button
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending}
            className="btn-primary w-full"
          >
            {registerMutation.isPending ? 'Processing...' : event.isFree ? 'Confirm Registration' : 'Pay & Register'}
          </button>
        </div>
      </Modal>

      {/* Feedback Section */}
      <div className="glass-card p-6">
        <h2 className="font-display text-lg tracking-wider mb-4">REVIEWS & FEEDBACK</h2>

        {avgRating > 0 && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-prisma-card rounded-lg">
            <div className="text-center">
              <p className="font-display text-4xl text-prisma-gold">{avgRating.toFixed(1)}</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= avgRating ? 'text-prisma-gold fill-prisma-gold' : 'text-prisma-border'}`} />
                ))}
              </div>
            </div>
            <p className="font-mono text-xs text-prisma-muted">{feedback.length} reviews</p>
          </div>
        )}

        {/* Submit Feedback */}
        {isAuthenticated && (
          <div className="mb-6">
            <p className="label-text mb-3">Leave your review</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} aria-label={`Rate ${s} stars`}>
                  <Star className={`w-6 h-6 transition-colors ${s <= rating ? 'text-prisma-gold fill-prisma-gold' : 'text-prisma-border hover:text-prisma-gold/50'}`} />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." className="input-field h-24 resize-none" aria-label="Feedback comment" />
            <button onClick={() => feedbackMutation.mutate()} disabled={rating === 0 || feedbackMutation.isPending} className="btn-primary text-sm mt-3">
              Submit Feedback
            </button>
          </div>
        )}

        {/* Feedback List */}
        {feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map((fb: any) => (
              <div key={fb.id} className="p-4 bg-prisma-card rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-prisma-crimson/20 flex items-center justify-center text-xs font-display text-prisma-crimson">
                    {fb.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm">{fb.user?.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? 'text-prisma-gold fill-prisma-gold' : 'text-prisma-border'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {fb.comment && <p className="text-sm text-prisma-muted">{fb.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-prisma-muted font-mono text-sm py-4">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
