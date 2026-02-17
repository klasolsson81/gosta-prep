import { Clock, MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ScheduleEvent } from '../../types';

const events: ScheduleEvent[] = [
  {
    id: 'breakfast',
    time: '08:30',
    endTime: '09:30',
    title: 'Frukostföreläsning: Axel Arigato',
    location: 'Torg Grön, Patricia, Forskningsgången 6',
    description: 'Om hur digitalisering och AI kan förstärka hur människor bygger, tänker och upplever – med riktiga exempel från Axel Arigato.',
    language: 'Engelska',
  },
  {
    id: 'fair-opens',
    time: '10:00',
    title: 'Mässan öppnar',
    location: 'Lindholmen Conference Center',
    description: 'Dags att möta företagen! Första 200 besökare får lottsedel.',
    highlight: true,
  },
  {
    id: 'lottery-start',
    time: '10:00',
    title: 'Lotteri: Första 200 får lott!',
    location: 'Entrén',
    description: 'Scanna QR-koden vid entrén. Priser från Paintballfabriken, World of Volvo, Mackbaren.',
  },
  {
    id: 'lunch-lecture',
    time: '12:00',
    endTime: '13:00',
    title: 'Lunchföreläsning: Deloitte – Cybersecurity',
    location: 'Torg Grön, Patricia, Forskningsgången 6',
    description: '"Discover Cybersecurity with Deloitte – Snapshots from Our Projects". Biljetter via Orbi.',
    language: 'Svenska',
  },
  {
    id: 'lottery-draw',
    time: '13:00',
    title: 'Lotteridragning',
    location: '',
    description: 'Vinnaren kontaktas – kolla mobilen! Priser från Paintballfabriken, World of Volvo, Mackbaren.',
  },
  {
    id: 'fair-closes',
    time: '15:00',
    title: 'Mässan stänger',
    location: 'Lindholmen Conference Center',
    description: 'Glöm inte att följa upp dina kontakter inom 24 timmar!',
  },
  {
    id: 'mingle',
    time: '17:00+',
    title: 'Göstas Mingel',
    location: 'TBD',
    description: 'SLUTSÅLT. Nätverka med utställare i avslappnad miljö.',
    language: 'Svenska',
  },
];

function isCurrentOrUpcoming(eventTime: string): 'past' | 'current' | 'upcoming' {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Only highlight on fair day (Feb 19, 2026)
  if (today !== '2026-02-19') return 'upcoming';

  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  const timeParts = eventTime.replace('+', '').split(':');
  const eventMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

  if (currentMinutes < eventMinutes - 15) return 'upcoming';
  if (currentMinutes < eventMinutes + 60) return 'current';
  return 'past';
}

export default function Timeline() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">Schema – 19 feb 2026</h2>
        <p className="text-text-muted text-sm mt-1">Lindholmen, Göteborg</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-border" />

        <div className="space-y-4">
          {events.map((event, index) => {
            const status = isCurrentOrUpcoming(event.time);
            const isCurrent = status === 'current';
            const isPast = status === 'past';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4"
              >
                {/* Dot */}
                <div className={`relative z-10 w-[48px] shrink-0 flex flex-col items-center pt-1`}>
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    isCurrent
                      ? 'bg-primary border-primary shadow-[0_0_8px_rgba(233,69,96,0.5)]'
                      : isPast
                        ? 'bg-border border-border'
                        : 'bg-surface-light border-border'
                  }`} />
                </div>

                {/* Card */}
                <div className={`flex-1 rounded-2xl p-4 border transition-all ${
                  isCurrent
                    ? 'bg-primary/10 border-primary/30'
                    : isPast
                      ? 'bg-surface/50 border-border/50 opacity-60'
                      : 'bg-surface border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock size={14} className={isCurrent ? 'text-primary' : 'text-text-muted'} />
                    <span className={`font-display font-bold text-sm ${isCurrent ? 'text-primary' : 'text-text-muted'}`}>
                      {event.time}{event.endTime ? ` – ${event.endTime}` : ''}
                    </span>
                    {event.language && (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted bg-surface-light px-2 py-0.5 rounded-full">
                        <Globe size={10} />
                        {event.language}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-display font-semibold text-[15px] ${isCurrent ? 'text-text' : ''}`}>
                    {event.title}
                  </h3>
                  {event.location && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin size={12} className="text-text-muted shrink-0" />
                      <span className="text-text-muted text-xs">{event.location}</span>
                    </div>
                  )}
                  <p className="text-text-muted text-[13px] mt-2 leading-relaxed">{event.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
