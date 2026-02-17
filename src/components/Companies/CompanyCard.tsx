import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Company } from '../../types';

interface CompanyCardProps {
  company: Company;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  index: number;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const avatarColors = [
  'from-primary to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-red-600',
  'from-lime-500 to-green-600',
];

export default function CompanyCard({ company, isFavorite, onToggleFavorite, onClick, index }: CompanyCardProps) {
  const colorClass = avatarColors[index % avatarColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-surface border border-border rounded-2xl p-4 transition-all duration-200 hover:border-primary/30 active:scale-[0.98] cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0`}>
          <span className="text-white font-display font-bold text-sm">{getInitials(company.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-[15px] text-text truncate">{company.name}</h3>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="p-1 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            >
              <Star
                size={20}
                className={`transition-all duration-200 ${isFavorite ? 'fill-gold text-gold scale-110' : 'text-text-muted hover:text-gold'}`}
              />
            </button>
          </div>
          <p className="text-text-muted text-[13px] line-clamp-1 mt-0.5">{company.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {company.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary/80 border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
