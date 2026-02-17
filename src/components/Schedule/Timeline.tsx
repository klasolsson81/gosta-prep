import { MapPin, Globe } from 'lucide-react';
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
        <h2 className="font-semibold text-xl">Schema – 19 feb 2026</h2>
        <p className="text-text-muted text-sm mt-1">Lindholmen, Göteborg</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border-subtle" />

        <div className="space-y-3">
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
                {/* Time + Dot */}
                <div className="relative z-10 w-[56px] shrink-0 flex flex-col items-center pt-4">
                  <span className={`font-mono text-[12px] font-medium mb-1.5 ${
                    isCurrent ? 'text-primary' : isPast ? 'text-text-dim' : 'text-text-muted'
                  }`}>
                    {event.time}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    isCurrent
                      ? 'bg-primary border-primary pulse-glow'
                      : isPast
                        ? 'bg-text-dim border-text-dim'
                        : 'bg-surface border-border'
                  }`} />
                </div>

                {/* Card */}
                <div className={`flex-1 rounded-xl p-4 border transition-all ${
                  isCurrent
                    ? 'bg-accent-glow border-primary/30'
                    : isPast
                      ? 'bg-glass border-glass-border opacity-50'
                      : 'bg-glass border-glass-border'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium text-[15px] ${isCurrent ? 'text-text' : isPast ? 'text-text-muted' : 'text-text'}`}>
                      {event.title}
                    </h3>
                    {event.language && (
                      <span className="flex items-center gap-1 text-[10px] text-text-dim bg-glass px-2 py-0.5 rounded-full border border-glass-border">
                        <Globe size={9} />
                        {event.language}
                      </span>
                    )}
                  </div>
                  {event.endTime && (
                    <p className="text-text-dim text-[11px] font-mono mb-1">{event.time} – {event.endTime}</p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin size={11} className="text-text-dim shrink-0" />
                      <span className="text-text-muted text-xs">{event.location}</span>
                    </div>
                  )}
                  <p className="text-text-muted text-[13px] leading-relaxed">{event.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
