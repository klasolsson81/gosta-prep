import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../utils/haptic';
import { fireConfetti } from '../../utils/confetti';

interface Phase {
  label: string;
  duration: number;
  color: string;
  tip: string;
  starters: string[];
}

const PHASES: Phase[] = [
  {
    label: 'Intro',
    duration: 5,
    color: '#34d399',
    tip: 'Presentera dig — namn, utbildning, intresse',
    starters: [
      'Hej! Jag heter…',
      'Jag läser .NET på NBI och…',
    ],
  },
  {
    label: 'Nytta',
    duration: 10,
    color: '#fbbf24',
    tip: 'Vad kan du bidra med? Koppla till deras behov',
    starters: [
      'Jag har jobbat med…',
      'Det jag brinner för är…',
      'I mitt senaste projekt löste jag…',
    ],
  },
  {
    label: 'Tech',
    duration: 10,
    color: '#f97316',
    tip: 'Visa teknisk bredd — nämn projekt, verktyg, resultat',
    starters: [
      'Min tech stack är…',
      'Jag har byggt en app som…',
      'Jag har erfarenhet av…',
    ],
  },
  {
    label: 'Avslut',
    duration: 5,
    color: '#f87171',
    tip: 'Avsluta starkt — fråga, be om kontakt',
    starters: [
      'Kan jag skicka mitt CV till…',
      'Vad är bästa sättet att söka hos er?',
    ],
  },
];

const TOTAL = PHASES.reduce((sum, p) => sum + p.duration, 0);

function getCurrentPhase(elapsed: number): { phase: Phase; index: number; phaseElapsed: number } {
  let acc = 0;
  for (let i = 0; i < PHASES.length; i++) {
    if (elapsed < acc + PHASES[i].duration) {
      return { phase: PHASES[i], index: i, phaseElapsed: elapsed - acc };
    }
    acc += PHASES[i].duration;
  }
  return { phase: PHASES[PHASES.length - 1], index: PHASES.length - 1, phaseElapsed: PHASES[PHASES.length - 1].duration };
}

interface Props {
  companyName: string;
  seeking: string[];
  onClose: () => void;
}

export default function ElevatorPitch({ companyName, seeking, onClose }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const prevPhaseRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const start = useCallback(() => {
    setRunning(true);
    setElapsed(0);
    setDone(false);
    prevPhaseRef.current = 0;
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1;
        if (next >= TOTAL) {
          setRunning(false);
          setDone(true);
          haptic('medium');
          fireConfetti(800);
          return TOTAL;
        }
        return next;
      });
    }, 100);
    return stop;
  }, [running, stop]);

  // Haptic on phase change
  useEffect(() => {
    if (!running) return;
    const { index } = getCurrentPhase(elapsed);
    if (index !== prevPhaseRef.current) {
      prevPhaseRef.current = index;
      haptic('light');
    }
  }, [elapsed, running]);

  const remaining = Math.max(0, TOTAL - elapsed);
  const { phase, index: phaseIndex } = getCurrentPhase(elapsed);
  const progress = elapsed / TOTAL;

  // Circle SVG params
  const size = 180;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-lg flex flex-col items-center px-6 overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={() => { stop(); onClose(); }}
          className="absolute top-4 right-4 p-3 rounded-full hover:bg-glass-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X size={22} className="text-text-muted" />
        </button>

        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm py-12">
          {/* Company info */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-1">{companyName}</h2>
            <p className="text-text-muted text-sm">{seeking.slice(0, 3).join(' · ')}</p>
          </div>

          {/* Timer circle */}
          <div className="relative mb-4">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={phase.color}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-[stroke] duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {done ? (
                <span className="text-2xl font-bold text-success">Klart!</span>
              ) : running ? (
                <>
                  <span className="text-3xl font-bold font-mono" style={{ color: phase.color }}>
                    {Math.ceil(remaining)}s
                  </span>
                  <span className="text-xs text-text-muted mt-1">{phase.label}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-text-muted">30s</span>
              )}
            </div>
          </div>

          {/* Phase indicators */}
          <div className="flex gap-2 mb-4 w-full">
            {PHASES.map((p, i) => (
              <div key={p.label} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="h-1.5 w-full rounded-full transition-all duration-300"
                  style={{
                    background: i < phaseIndex ? p.color
                      : i === phaseIndex && running ? p.color
                      : 'rgba(255,255,255,0.1)',
                    opacity: i <= phaseIndex || !running ? 1 : 0.4,
                  }}
                />
                <span className={`text-[10px] font-medium ${
                  i === phaseIndex && running ? 'text-text' : 'text-text-dim'
                }`}>
                  {p.label} ({p.duration}s)
                </span>
              </div>
            ))}
          </div>

          {/* Phase tip + starters */}
          {running && (
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-xl p-4 mb-6 border"
              style={{
                borderColor: `${phase.color}30`,
                background: `${phase.color}08`,
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: phase.color }}>{phase.tip}</p>
              <div className="space-y-1.5">
                {phase.starters.map((s, i) => (
                  <p key={i} className="text-[13px] text-text-muted italic">"{s}"</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pre-start tips overview */}
          {!running && !done && (
            <div className="w-full space-y-2 mb-6">
              {PHASES.map((p) => (
                <div key={p.label} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: p.color }} />
                  <div>
                    <span className="text-xs font-semibold text-text">{p.label}</span>
                    <span className="text-xs text-text-dim"> — {p.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          {done ? (
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-text">Bra jobbat! Nu kör du det live.</p>
              <div className="flex gap-3">
                <button
                  onClick={start}
                  className="px-6 py-3 rounded-xl text-sm font-medium bg-glass border border-glass-border text-text-muted hover:text-text transition-all min-h-[44px]"
                >
                  Kör igen
                </button>
                <button
                  onClick={() => { stop(); onClose(); }}
                  className="px-6 py-3 rounded-xl text-sm font-medium bg-primary text-white min-h-[44px]"
                >
                  Stäng
                </button>
              </div>
            </div>
          ) : !running ? (
            <button
              onClick={start}
              className="px-8 py-4 rounded-xl text-base font-semibold bg-primary text-white min-h-[44px] hover:bg-primary-hover transition-colors"
            >
              Starta pitchen
            </button>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
