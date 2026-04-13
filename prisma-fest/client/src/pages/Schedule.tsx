import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, MapPin, Filter } from 'lucide-react';
import { scheduleService } from '../services';
import { Skeleton } from '../components/ui/LoadingScreen';

const categoryColors: Record<string, string> = {
  technical: 'border-l-blue-500 bg-blue-500/5',
  cultural: 'border-l-purple-500 bg-purple-500/5',
  sports: 'border-l-green-500 bg-green-500/5',
  workshop: 'border-l-orange-500 bg-orange-500/5',
  gaming: 'border-l-red-500 bg-red-500/5',
  music: 'border-l-pink-500 bg-pink-500/5',
  dance: 'border-l-violet-500 bg-violet-500/5',
  arts: 'border-l-teal-500 bg-teal-500/5',
  literary: 'border-l-amber-500 bg-amber-500/5',
  default: 'border-l-prisma-crimson bg-prisma-crimson/5',
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState(1);
  const [stageFilter, setStageFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => scheduleService.get(),
  });

  const schedule = data?.data || {};
  const days = Object.keys(schedule).map(Number).sort();
  const currentDaySlots = schedule[activeDay] || [];

  const stages = [...new Set(currentDaySlots.map((s: any) => s.stage))];
  const filteredSlots = stageFilter === 'all' ? currentDaySlots : currentDaySlots.filter((s: any) => s.stage === stageFilter);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-display-lg">FEST SCHEDULE</h1>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(days.length > 0 ? days : [1, 2, 3]).map((day) => (
          <button
            key={day}
            onClick={() => { setActiveDay(day); setStageFilter('all'); }}
            className={`px-6 py-3 rounded-xl font-display text-sm tracking-wider whitespace-nowrap transition-all ${
              activeDay === day
                ? 'bg-prisma-crimson text-prisma-ivory'
                : 'bg-prisma-card text-prisma-muted hover:bg-prisma-card/80 border border-prisma-border'
            }`}
          >
            DAY {day}
          </button>
        ))}
      </div>

      {/* Stage Filter */}
      {stages.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-4 h-4 text-prisma-muted flex-shrink-0" />
          <button
            onClick={() => setStageFilter('all')}
            className={`badge cursor-pointer ${stageFilter === 'all' ? 'badge-crimson' : 'bg-prisma-card text-prisma-muted border border-prisma-border'}`}
          >
            All Stages
          </button>
          {stages.map((stage: string) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`badge cursor-pointer whitespace-nowrap ${stageFilter === stage ? 'badge-crimson' : 'bg-prisma-card text-prisma-muted border border-prisma-border'}`}
            >
              {stage}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filteredSlots.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-prisma-muted mx-auto mb-4" />
          <p className="font-display text-lg">NO EVENTS SCHEDULED</p>
          <p className="font-mono text-sm text-prisma-muted mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-prisma-border" />

          <div className="space-y-4">
            {filteredSlots.map((slot: any, i: number) => {
              const color = categoryColors[slot.event?.category] || categoryColors.default;
              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`ml-12 p-4 rounded-xl border-l-4 ${color}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-sm tracking-wider">{slot.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="flex items-center gap-1 font-mono text-[11px] text-prisma-muted">
                          <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-prisma-muted">
                          <MapPin className="w-3 h-3" /> {slot.stage}
                        </span>
                      </div>
                    </div>
                    {slot.event && (
                      <span className="badge-crimson text-[9px]">{slot.event.category}</span>
                    )}
                  </div>
                  {/* Timeline dot */}
                  <div className="absolute left-[18px] mt-[-30px] w-3 h-3 rounded-full bg-prisma-crimson border-2 border-prisma-black" />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
