import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import companies from '../../data/companies.json';
import { useFavorites } from '../../hooks/useProfile';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useCustomCompanies } from '../../hooks/useCustomCompanies';
import SearchBar from './SearchBar';
import CompanyCard from './CompanyCard';
import AddCompany from './AddCompany';
import type { Company } from '../../types';

type SortMode = 'name' | 'booth';

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useLocalStorage<SortMode>('gosta-sort-preference', 'name');
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { customCompanies, addCompany } = useCustomCompanies();

  const allCompanies = useMemo(() => {
    return [...(companies as Company[]), ...customCompanies];
  }, [customCompanies]);

  const filtered = useMemo(() => {
    let list = allCompanies;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.seeking.some(s => s.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (sortMode === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    } else {
      list = [...list].sort((a, b) => {
        if (a.booth != null && b.booth != null) return a.booth - b.booth;
        if (a.booth != null) return -1;
        if (b.booth != null) return 1;
        return a.name.localeCompare(b.name, 'sv');
      });
    }

    return list;
  }, [search, sortMode, allCompanies]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} resultCount={filtered.length} />

      {/* Sort + Add controls */}
      <div className="px-3 flex items-center gap-2 mb-2">
        <div className="flex rounded-lg border border-glass-border overflow-hidden flex-1">
          <button
            onClick={() => setSortMode('name')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
              sortMode === 'name'
                ? 'bg-accent-glow text-primary-hover'
                : 'bg-glass text-text-dim hover:text-text-muted'
            }`}
          >
            A–Ö
          </button>
          <button
            onClick={() => setSortMode('booth')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-all ${
              sortMode === 'booth'
                ? 'bg-accent-glow text-primary-hover'
                : 'bg-glass text-text-dim hover:text-text-muted'
            }`}
          >
            Monter
          </button>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-glass border border-glass-border text-text-muted hover:text-text hover:bg-glass-hover transition-all min-h-[32px]"
        >
          <Plus size={14} />
          Lägg till
        </button>
      </div>

      <div className="px-3 space-y-1.5 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-base">Inga företag matchade &quot;{search}&quot;</p>
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
