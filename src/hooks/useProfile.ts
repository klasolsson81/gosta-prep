import { useLocalStorage } from './useLocalStorage';
import type { UserProfile, Favorites, CompanyNotes } from '../types';

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
    window.localStorage.removeItem('gosta-profile');
    window.localStorage.removeItem('gosta-favorites');
    window.localStorage.removeItem('gosta-notes');
    window.location.replace('/');
  };

  return { profile, updateProfile, resetProfile };
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Favorites>('gosta-favorites', {});

  const toggleFavorite = (companyId: string) => {
    setFavorites(prev => ({
      ...prev,
      [companyId]: !prev[companyId],
    }));
  };

  const isFavorite = (companyId: string) => !!favorites[companyId];

  return { favorites, toggleFavorite, isFavorite };
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<CompanyNotes>('gosta-notes', {});

  const setNote = (companyId: string, note: string) => {
    setNotes(prev => ({ ...prev, [companyId]: note }));
  };

  const getNote = (companyId: string) => notes[companyId] || '';

  return { notes, setNote, getNote };
}
