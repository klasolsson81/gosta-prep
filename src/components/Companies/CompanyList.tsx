import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import companies from '../../data/companies.json';
import { useFavorites } from '../../hooks/useProfile';
import SearchBar from './SearchBar';
import CompanyCard from './CompanyCard';
import type { Company } from '../../types';

export default function CompanyList() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const filtered = useMemo(() => {
    if (!search.trim()) return companies as Company[];
    const q = search.toLowerCase();
    return (companies as Company[]).filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.seeking.some(s => s.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} resultCount={filtered.length} />
      <div className="px-4 space-y-2 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-base">Inga företag matchade "{search}"</p>
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
    </div>
  );
}
