import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import companies from '../../data/companies.json';
import { useProfile, useFavorites, useNotes } from '../../hooks/useProfile';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useCustomCompanies } from '../../hooks/useCustomCompanies';
import { useDebounce } from '../../hooks/useDebounce';
import { fireConfetti } from '../../utils/confetti';
import { haptic } from '../../utils/haptic';
import SearchBar from './SearchBar';
import CompanyCard from './CompanyCard';
import AddCompany from './AddCompany';
import type { Company } from '../../types';

type SortMode = 'name' | 'booth' | 'recommended';

function scoreCompany(company: Company, isFav: boolean, hasNotes: boolean, skills: string[]): number {
  let score = 0;
  if (isFav) score += 30;
  if (hasNotes) score += 20;
  if (skills.length === 0) return score;
  const seekingLower = company.seeking.map(s => s.toLowerCase()).join(' ');
  const tagsLower = company.tags.map(t => t.toLowerCase()).join(' ');
  const combined = seekingLower + ' ' + tagsLower + ' ' + company.description.toLowerCase();
  for (const skill of skills) {
    if (combined.includes(skill.toLowerCase())) score += 5;
  }
  return score;
}

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [sortMode, setSortMode] = useLocalStorage<SortMode>('gosta-sort-preference', 'name');
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const { customCompanies, addCompany } = useCustomCompanies();
  const { notes } = useNotes();
  const userSkills = profile.skills || [];
  const prevCountRef = useRef<number | null>(null);

  const allCompanies = useMemo(() => {
    return [...(companies as Company[]), ...customCompanies];
  }, [customCompanies]);

  const filtered = useMemo(() => {
    let list = allCompanies;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.seeking.some(s => s.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (sortMode === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    } else if (sortMode === 'booth') {
      list = [...list].sort((a, b) => {
        if (a.booth != null && b.booth != null) return a.booth - b.booth;
        if (a.booth != null) return -1;
        if (b.booth != null) return 1;
        return a.name.localeCompare(b.name, 'sv');
      });
    } else {
      // Recommended: score-based sorting
      list = [...list].sort((a, b) => {
        const hasNotesA = !!(notes[a.id] && (typeof notes[a.id] === 'string' || notes[a.id].talkedTo || notes[a.id].about || notes[a.id].nextStep));
        const hasNotesB = !!(notes[b.id] && (typeof notes[b.id] === 'string' || notes[b.id].talkedTo || notes[b.id].about || notes[b.id].nextStep));
        const scoreA = scoreCompany(a, !!favorites[a.id], hasNotesA, userSkills);
        const scoreB = scoreCompany(b, !!favorites[b.id], hasNotesB, userSkills);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.name.localeCompare(b.name, 'sv');
      });
    }

    return list;
  }, [debouncedSearch, sortMode, allCompanies, favorites, notes, userSkills]);

  // Connection tracker: count companies with non-empty notes
  const contactedCount = useMemo(() => {
    return Object.entries(notes).filter(([, n]) => {
      if (!n) return false;
      if (typeof n === 'string') return (n as string).trim().length > 0;
      return !!(n.talkedTo || n.role || n.about || n.nextStep || n.followUp || n.extra);
    }).length;
  }, [notes]);

  const totalCompanies = allCompanies.length;
  const progressPct = totalCompanies > 0 ? Math.min(100, (contactedCount / totalCompanies) * 100) : 0;
  const progressColor = progressPct >= 60 ? '#fbbf24' : progressPct >= 30 ? '#34d399' : '#6366f1';

  // Confetti milestones
  useEffect(() => {
    if (prevCountRef.current === null) {
      prevCountRef.current = contactedCount;
      return;
    }
    const prev = prevCountRef.current;
    prevCountRef.current = contactedCount;

    if (contactedCount === 5 && prev < 5) {
      haptic('medium');
      fireConfetti(1000);
    } else if (contactedCount === 10 && prev < 10) {
      haptic('medium');
      fireConfetti(1000);
    }
  }, [contactedCount]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} resultCount={filtered.length} />

      {/* Connection tracker */}
      <div className="px-3 mb-3">
        <div className="bg-glass border border-glass-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              <span className="font-bold text-text">{contactedCount}</span> av <span className="font-bold text-text">{totalCompanies}</span> kontaktade
            </span>
            {contactedCount >= 5 && contactedCount < 10 && (
              <span className="text-[10px] text-gold font-medium">Halvvägs!</span>
            )}
            {contactedCount >= 10 && (
              <span className="text-[10px] text-gold font-medium">Du krossar det!</span>
            )}
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: progressColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Sort + Add controls */}
      <div className="px-3 flex items-center gap-2 mb-2">
        <div className="flex rounded-lg border border-glass-border overflow-hidden flex-1">
          <button
            onClick={() => setSortMode('name')}
            className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-all ${
              sortMode === 'name'
                ? 'bg-accent-glow text-primary-hover'
                : 'bg-glass text-text-dim hover:text-text-muted'
            }`}
          >
            A–Ö
          </button>
          <button
            onClick={() => setSortMode('booth')}
            className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-all ${
              sortMode === 'booth'
                ? 'bg-accent-glow text-primary-hover'
                : 'bg-glass text-text-dim hover:text-text-muted'
            }`}
          >
            Monter
          </button>
          <button
            onClick={() => setSortMode('recommended')}
            className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              sortMode === 'recommended'
                ? 'bg-accent-glow text-primary-hover'
                : 'bg-glass text-text-dim hover:text-text-muted'
            }`}
          >
            <Zap size={11} />
            För dig
          </button>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all min-h-[32px] hover:brightness-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Plus size={14} />
          Lägg till
        </button>
      </div>

      {/* Easter egg */}
      {debouncedSearch.trim() && /^(nbi|handelsakademin|\.net\s*25|\.net25)$/i.test(debouncedSearch.trim()) && (
        <div className="px-3 mb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-accent-glow border border-primary/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <GraduationCap size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-text">NBI Handelsakademin</h3>
                <p className="text-text-muted text-xs mt-0.5">
                  Det är vi! .NET System Development 2025–2027
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="px-3 space-y-1.5 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-base">Inga företag matchade &quot;{debouncedSearch}&quot;</p>
            <button onClick={() => setSearch('')} className="mt-3 text-primary font-medium text-sm">
              Rensa sökning
            </button>
          </div>
        ) : (
          filtered.map((company, index) => (
            <CompanyCard
              key={company.id}
              company={company}
              isFavorite={isFavorite(company.id)}
              onToggleFavorite={() => toggleFavorite(company.id)}
              onClick={() => navigate(`/foretag/${company.id}`)}
              index={index}
            />
          ))
        )}
      </div>

      <AddCompany
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addCompany}
      />
    </div>
  );
}
