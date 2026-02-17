import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Globe, Github, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';
import QRCard from './QRCard';

interface QRItem {
  key: string;
  title: string;
  urlBuilder: (value: string) => string;
  icon: React.ReactNode;
  color: string;
  profileKey: 'linkedin' | 'portfolio' | 'github' | 'cvUrl';
}

const qrItems: QRItem[] = [
  {
    key: 'linkedin',
    title: 'LinkedIn',
    urlBuilder: (v) => `https://linkedin.com/in/${v}`,
    icon: <Linkedin size={22} />,
    color: 'text-[#818cf8]',
    profileKey: 'linkedin',
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    urlBuilder: (v) => v.startsWith('http') ? v : `https://${v}`,
    icon: <Globe size={22} />,
    color: 'text-success',
    profileKey: 'portfolio',
  },
  {
    key: 'github',
    title: 'GitHub',
    urlBuilder: (v) => `https://github.com/${v}`,
    icon: <Github size={22} />,
    color: 'text-text',
    profileKey: 'github',
  },
  {
    key: 'cv',
    title: 'CV',
    urlBuilder: (v) => v.startsWith('http') ? v : `https://${v}`,
    icon: <FileText size={22} />,
    color: 'text-gold',
    profileKey: 'cvUrl',
  },
];

export default function QRCarousel() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const allSlides = qrItems.map(item => ({
    ...item,
    configured: !!profile[item.profileKey],
    url: profile[item.profileKey] ? item.urlBuilder(profile[item.profileKey]) : '',
  }));

  const configured = allSlides.filter(s => s.configured);
  const unconfigured = allSlides.filter(s => !s.configured);
  const slides = [...configured, ...unconfigured];

  const goTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.offsetWidth;
    const index = Math.round(el.scrollLeft / slideWidth);
    setActiveIndex(Math.min(index, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (configured.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-glass border border-glass-border flex items-center justify-center mb-4">
          <FileText size={28} className="text-text-dim" />
        </div>
        <h2 className="font-semibold text-lg mb-2">Inga QR-koder ännu</h2>
        <p className="text-text-muted text-sm max-w-[280px]">
          Fyll i din LinkedIn, portfolio, GitHub eller CV i profilen för att generera QR-koder!
        </p>
        <button
          onClick={() => navigate('/profil')}
          className="mt-6 font-semibold px-6 py-3 rounded-[10px] text-sm min-h-[44px] text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)' }}
        >
          Gå till profil
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-6 pb-2 shrink-0 text-center">
        <h2 className="font-semibold text-lg">Dina QR-koder</h2>
        <p className="text-text-muted text-sm mt-1">Visa för rekryterare – de skannar direkt</p>
      </div>

      {/* Swipeable carousel with arrow navigation */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative">
          {/* Left arrow */}
          {activeIndex > 0 && (
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-glass border border-glass-border flex items-center justify-center text-text-muted hover:text-text hover:bg-glass-hover transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Right arrow */}
          {activeIndex < slides.length - 1 && (
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-glass border border-glass-border flex items-center justify-center text-text-muted hover:text-text hover:bg-glass-hover transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                className="min-w-full snap-center flex items-center justify-center px-4"
              >
                {slide.configured ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-elevated border border-glass-border rounded-2xl p-6 w-full max-w-[360px]"
                  >
                    <QRCard
                      title={slide.title}
                      url={slide.url}
                      icon={slide.icon}
                      color={slide.color}
                    />
                  </motion.div>
                ) : (
                  <div
                    className="cursor-pointer w-full max-w-[360px]"
                    onClick={() => navigate('/profil')}
                  >
                    <div className="bg-glass border border-dashed border-glass-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[340px] hover:border-primary/30 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-surface border border-glass-border flex items-center justify-center">
                        <Plus size={24} className="text-text-dim" />
                      </div>
                      <p className="font-medium text-text-dim text-sm">Lägg till {slide.title}</p>
                      <p className="text-text-dim text-xs">Gå till Profil för att fylla i</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 py-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-text-dim'
              }`}
            />
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-text-dim text-[11px] text-center pb-4">
          {activeIndex + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
}
