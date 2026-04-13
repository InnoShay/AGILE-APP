import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock, QrCode } from 'lucide-react';
import { registrationService } from '../services';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/LoadingScreen';
import { Link } from 'react-router-dom';

export default function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => registrationService.getMine(),
  });

  const registrations = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-display-lg">MY TICKETS</h1>
        <p className="font-mono text-sm text-prisma-muted mt-1">{registrations.length} registrations</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-10 h-10 text-prisma-muted" />}
          title="NO TICKETS YET"
          description="Register for events to see your tickets here."
          action={<Link to="/events" className="btn-primary text-sm">Browse Events</Link>}
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((reg: any, i: number) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedTicket(reg)}
              className="glass-card-hover flex items-center gap-4 p-4 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-xl bg-prisma-crimson/10 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-6 h-6 text-prisma-crimson" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm tracking-wider truncate group-hover:text-prisma-crimson transition-colors">
                  {reg.event?.title}
                </h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-prisma-muted">
                    <Calendar className="w-3 h-3" />
                    {new Date(reg.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-prisma-muted">
                    <MapPin className="w-3 h-3" />
                    {reg.event?.venue}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge text-[10px] ${reg.ticketType === 'vip' ? 'badge-gold' : 'badge-crimson'}`}>
                  {reg.ticketType}
                </span>
                {reg.checkedIn ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Checked In
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-prisma-muted">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Ticket Details" size="sm">
        {selectedTicket && (
          <div className="text-center space-y-4">
            <h3 className="font-display text-lg tracking-wider">{selectedTicket.event?.title}</h3>
            <div className="flex justify-center gap-4 text-xs font-mono text-prisma-muted">
              <span>{new Date(selectedTicket.event?.date).toLocaleDateString()}</span>
              <span>{selectedTicket.event?.venue}</span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-4">
              {selectedTicket.qrCode ? (
                <img src={selectedTicket.qrCode} alt="Ticket QR Code" className="w-48 h-48 rounded-xl" />
              ) : (
                <div className="w-48 h-48 bg-prisma-card rounded-xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-prisma-muted" />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <span className={`badge ${selectedTicket.ticketType === 'vip' ? 'badge-gold' : 'badge-crimson'}`}>
                {selectedTicket.ticketType} ticket
              </span>
              <span className={`badge ${selectedTicket.checkedIn ? 'badge-teal' : 'bg-prisma-card text-prisma-muted border border-prisma-border'}`}>
                {selectedTicket.checkedIn ? 'Checked In' : 'Not Checked In'}
              </span>
            </div>

            <p className="font-mono text-[10px] text-prisma-muted">
              Show this QR code at the event entrance
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
