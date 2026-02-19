import { useLocalStorage } from './useLocalStorage';
import { haptic } from '../utils/haptic';
import type { UserProfile, Favorites, SimpleNotes, StructuredNote } from '../types';

const defaultProfile: UserProfile = {
  name: '',
  linkedin: '',
  portfolio: '',
  github: '',
  cvUrl: '',
  onboardingComplete: false,
};

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('gosta-profile', defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    window.localStorage.removeItem('gosta-favorites');
    window.localStorage.removeItem('gosta-notes');
    window.localStorage.removeItem('gosta-match-scores');
    window.localStorage.removeItem('gosta-match-skills-hash');
  };

  return { profile, updateProfile, resetProfile };
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Favorites>('gosta-favorites', {});

  const toggleFavorite = (companyId: string) => {
    haptic('light');
    setFavorites(prev => ({
      ...prev,
      [companyId]: !prev[companyId],
    }));
  };

  const isFavorite = (companyId: string) => !!favorites[companyId];

  return { favorites, toggleFavorite, isFavorite };
}

// Migrate old StructuredNote to single string
function migrateNote(n: unknown): string {
  if (!n) return '';
  if (typeof n === 'string') return n;
  // Old structured format — merge non-empty fields into one text
  const s = n as StructuredNote;
  const parts: string[] = [];
  if (s.talkedTo) parts.push(`Pratade med: ${s.talkedTo}`);
  if (s.role) parts.push(`Roll: ${s.role}`);
  if (s.about) parts.push(s.about);
  if (s.nextStep) parts.push(`Nästa steg: ${s.nextStep}`);
  if (s.followUp) parts.push(`Följa upp: ${s.followUp}`);
  if (s.extra) parts.push(s.extra);
  return parts.join('\n');
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<SimpleNotes>('gosta-notes', {});

  const getNote = (companyId: string): string => {
    return migrateNote(notes[companyId]);
  };

  const setNote = (companyId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [companyId]: value,
    }));
  };

  const clearNote = (companyId: string) => {
    setNotes(prev => {
      const next = { ...prev };
      delete next[companyId];
      return next;
    });
  };

  const isNoteEmpty = (companyId: string): boolean => {
    return !getNote(companyId).trim();
  };

  return { notes, getNote, setNote, clearNote, isNoteEmpty };
}
