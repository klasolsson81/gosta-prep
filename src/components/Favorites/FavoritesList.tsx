import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import companies from '../../data/companies.json';
import { useFavorites, useNotes } from '../../hooks/useProfile';
import { useCustomCompanies } from '../../hooks/useCustomCompanies';
import type { Company } from '../../types';

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

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function FavoritesList() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { getNote } = useNotes();
  const { customCompanies } = useCustomCompanies();

  const allCompanies = useMemo(() => {
    return [...(companies as Company[]), ...customCompanies];
  }, [customCompanies]);

  const favoriteCompanies = allCompanies.filter(c => favorites[c.id]);

  if (favoriteCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-glass border border-glass-border flex items-center justify-center mb-4">
          <Star size={24} className="text-text-dim" />
        </div>
        <h2 className="font-semibold text-lg mb-2">Inga favoriter ännu</h2>
        <p className="text-text-muted text-sm max-w-[280px]">
          Stjärnmarkera de företag du vill prata med på mässan — de hamnar här för snabb åtkomst!
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 font-semibold px-6 py-3 rounded-[10px] text-sm min-h-[44px] text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)' }}
        >
          Utforska företag
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-2">
      <p className="text-text-dim text-[11px] font-medium px-1">
        {favoriteCompanies.length} {favoriteCompanies.length === 1 ? 'favorit' : 'favoriter'}
      </p>
      {favoriteCompanies.map((company, index) => {
        const gradient = gradients[hashName(company.name) % gradients.length];
        const note = getNote(company.id);
        const notePreview = [note.talkedTo, note.about, note.nextStep].filter(Boolean).join(' · ');
        const hasNote = notePreview.length > 0;

        return (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-glass border border-glass-border rounded-xl p-4 cursor-pointer hover:bg-glass-hover hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-px active:scale-[0.98] transition-all"
            onClick={() => navigate(`/foretag/${company.id}`)}
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
                  <h3 className="font-medium text-[15px] truncate">{company.name}</h3>
                  <motion.button
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(company.id); }}
                    className="p-1 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                  >
                    <Star size={18} className="fill-gold text-gold" />
                  </motion.button>
                </div>
                <p className="text-text-muted text-[13px] line-clamp-1 mt-0.5">{company.description}</p>
                {hasNote && (
                  <p className="text-[12px] text-primary/70 mt-2 line-clamp-2 italic">
                    {notePreview.slice(0, 120)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
