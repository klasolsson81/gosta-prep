import { useState, useEffect } from 'react';
import { MapPin, Globe, Radio } from 'lucide-react';
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

type CountdownState =
  | { type: 'countdown'; days: number; hours: number; minutes: number; seconds: number }
  | { type: 'live' }
  | { type: 'over' };

function getCountdownState(): CountdownState {
  const now = new Date();
  const fairOpen = new Date('2026-02-19T10:00:00+01:00');
  const fairClose = new Date('2026-02-19T15:00:00+01:00');

  if (now >= fairOpen && now <= fairClose) return { type: 'live' };
  if (now > fairClose) return { type: 'over' };

  const diff = fairOpen.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { type: 'countdown', days, hours, minutes, seconds };
}

export default function Timeline() {
  const [countdown, setCountdown] = useState<CountdownState>(getCountdownState);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdownState()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-6">
      {/* Countdown banner */}
      {countdown.type === 'countdown' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl p-4 text-center border border-primary/20"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)' }}
        >
          <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-medium">Mässan öppnar om</p>
          <div className="flex items-center justify-center gap-3">
            {countdown.days > 0 && (
              <div className="text-center">
                <span className="text-3xl font-bold font-mono text-primary">{countdown.days}</span>
                <span className="text-xs text-text-dim block">dagar</span>
              </div>
            )}
            <div className="text-center">
              <span className="text-3xl font-bold font-mono text-primary">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="text-xs text-text-dim block">tim</span>
            </div>
            <span className="text-2xl font-bold text-primary/40 -mt-4">:</span>
            <div className="text-center">
              <span className="text-3xl font-bold font-mono text-primary">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="text-xs text-text-dim block">min</span>
            </div>
            <span className="text-2xl font-bold text-primary/40 -mt-4">:</span>
            <div className="text-center">
              <span className="text-3xl font-bold font-mono text-primary">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="text-xs text-text-dim block">sek</span>
            </div>
          </div>
        </motion.div>
      )}
      {countdown.type === 'live' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-xl p-4 text-center border border-success/30"
          style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(56,249,215,0.08) 100%)' }}
        >
          <div className="flex items-center justify-center gap-2">
            <Radio size={16} className="text-success animate-pulse" />
            <span className="text-lg font-bold text-success">LIVE – Mässan pågår!</span>
          </div>
        </motion.div>
      )}

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
