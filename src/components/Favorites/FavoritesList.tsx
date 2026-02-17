import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import companies from '../../data/companies.json';
import { useFavorites, useNotes } from '../../hooks/useProfile';
import type { Company } from '../../types';

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

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function FavoritesList() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { getNote } = useNotes();

  const favoriteCompanies = (companies as Company[]).filter(c => favorites[c.id]);

  if (favoriteCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
          <Star size={28} className="text-text-muted" />
        </div>
        <h2 className="font-display font-semibold text-lg mb-2">Inga favoriter ännu</h2>
        <p className="text-text-muted text-sm max-w-[280px]">
          Gå till Företag och stjärnmarkera de du vill prata med på mässan!
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-primary text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-primary-hover transition-colors min-h-[44px]"
        >
          Se företag
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <p className="text-text-muted text-xs font-medium px-1">
        {favoriteCompanies.length} {favoriteCompanies.length === 1 ? 'favorit' : 'favoriter'}
      </p>
      {favoriteCompanies.map((company, index) => {
        const globalIndex = (companies as Company[]).indexOf(company);
        const colorClass = avatarColors[globalIndex % avatarColors.length];
        const note = getNote(company.id);
        const notePreview = [note.talkedTo, note.about, note.nextStep].filter(Boolean).join(' · ');
        const hasNote = notePreview.length > 0;

        return (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/30 active:scale-[0.98] transition-all"
            onClick={() => navigate(`/foretag/${company.id}`)}
          >
            <div className="flex items-start gap-3">
              {company.logo ? (
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 p-1.5">
                  <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0`}>
                  <span className="text-white font-display font-bold text-sm">{getInitials(company.name)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-[15px] truncate">{company.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(company.id); }}
                    className="p-1 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                  >
                    <Star size={20} className="fill-gold text-gold" />
                  </button>
                </div>
                <p className="text-text-muted text-[13px] line-clamp-1 mt-0.5">{company.description}</p>
                {hasNote && (
                  <p className="text-[12px] text-primary/70 mt-2 line-clamp-1 italic">
                    {notePreview.slice(0, 80)}
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
