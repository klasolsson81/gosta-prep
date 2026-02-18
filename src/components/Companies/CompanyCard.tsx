import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
  isFavorite: boolean;
  matchScore?: number;
  onToggleFavorite: () => void;
  onClick: () => void;
  index: number;
}

function matchColor(score: number): string {
  if (score >= 70) return '#22c55e';  // green
  if (score >= 40) return '#f59e0b';  // amber
  if (score > 0) return '#ef4444';    // red
  return '';
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return Math.abs(hash);
}

export default function CompanyCard({ company, isFavorite, matchScore, onToggleFavorite, onClick, index }: CompanyCardProps) {
  const gradient = gradients[hashName(company.name) % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-glass border border-glass-border rounded-xl px-3.5 py-3 transition-all duration-200 hover:bg-glass-hover hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-px hover:shadow-md active:scale-[0.98] cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {company.logo ? (
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 p-1">
            <img src={company.logo} alt={company.name} loading="lazy" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: gradient }}
          >
            <span className="text-white font-semibold text-xs">{getInitials(company.name)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-medium text-[15px] text-text truncate">{company.name}</h3>
                {company.isCustom && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success border border-success/20">
                    Tillagd
                  </span>
                )}
                {company.booth && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-glow text-primary-hover border border-tag-border">
                    Monter {company.booth}
                  </span>
                )}
                {!!matchScore && matchScore > 0 && (
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ color: matchColor(matchScore), backgroundColor: matchColor(matchScore) + '18' }}
                  >
                    {matchScore}%
                  </span>
                )}
              </div>
              <p className="text-text-muted text-[13px] line-clamp-2 mt-0.5 leading-snug">{company.description}</p>
            </div>
            <motion.button
              whileTap={{ scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="p-1 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            >
              <Star
                size={18}
                className={`transition-all duration-200 ${isFavorite ? 'fill-gold text-gold' : 'text-text-dim hover:text-gold'}`}
              />
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {company.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-tag-bg text-tag-text border border-tag-border tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
