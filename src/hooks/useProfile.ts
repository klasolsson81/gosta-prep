import { useLocalStorage } from './useLocalStorage';
import { haptic } from '../utils/haptic';
import type { UserProfile, Favorites, CompanyNotes, StructuredNote } from '../types';

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

const emptyNote: StructuredNote = {
  talkedTo: '',
  role: '',
  about: '',
  nextStep: '',
  followUp: '',
  extra: '',
};

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<CompanyNotes>('gosta-notes', {});

  const getNote = (companyId: string): StructuredNote => {
    const n = notes[companyId];
    if (!n) return { ...emptyNote };
    // Migration: if old string format, put it in 'extra'
    if (typeof n === 'string') return { ...emptyNote, extra: n as unknown as string };
    return { ...emptyNote, ...n };
  };

  const updateNote = (companyId: string, field: keyof StructuredNote, value: string) => {
    setNotes(prev => ({
      ...prev,
      [companyId]: { ...emptyNote, ...prev[companyId], [field]: value },
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
    const n = getNote(companyId);
    return !n.talkedTo && !n.role && !n.about && !n.nextStep && !n.followUp && !n.extra;
  };

  return { notes, getNote, updateNote, clearNote, isNoteEmpty };
}
