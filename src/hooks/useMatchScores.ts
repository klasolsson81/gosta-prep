import { useState, useEffect, useRef } from 'react';
import companies from '../data/companies.json';
import { useProfile } from './useProfile';
import { useCustomCompanies } from './useCustomCompanies';
import type { Company } from '../types';

const CACHE_KEY = 'gosta-match-scores';
const SKILLS_HASH_KEY = 'gosta-match-skills-hash';

function hashSkills(skills: string[]): string {
  return skills.slice().sort().join(',').toLowerCase();
}

export function useMatchScores(): Record<string, number> {
  const { profile } = useProfile();
  const { customCompanies } = useCustomCompanies();
  const [scores, setScores] = useState<Record<string, number>>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const fetchedRef = useRef(false);

  const skills = profile.skills || [];

  // No skills → no scores
  useEffect(() => {
    if (skills.length === 0) {
      if (Object.keys(scores).length > 0) setScores({});
      return;
    }
    if (fetchedRef.current) return;

    // Check if cached scores match current skills
    const currentHash = hashSkills(skills);
    try {
      const cachedHash = localStorage.getItem(SKILLS_HASH_KEY);
      if (cachedHash === currentHash && Object.keys(scores).length > 0) return;
    } catch { /* continue to fetch */ }

    fetchedRef.current = true;

    const allCompanies = [...(companies as Company[]), ...customCompanies];
    const payload = allCompanies.map(c => ({
      id: c.id,
      seeking: c.seeking,
      tags: c.tags,
    }));

    fetch('/api/match-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, companies: payload }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.scores && Object.keys(data.scores).length > 0) {
          setScores(data.scores);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.scores));
            localStorage.setItem(SKILLS_HASH_KEY, hashSkills(skills));
          } catch { /* quota */ }
        }
      })
      .catch(() => { /* silent fail, local scores remain */ })
      .finally(() => { fetchedRef.current = false; });
  }, [skills, customCompanies, scores]);

  return scores;
}
