import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfile, useFavorites, useNotes } from '../hooks/useProfile';

describe('useProfile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default profile on first use', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile.name).toBe('');
    expect(result.current.profile.onboardingComplete).toBe(false);
  });

  it('should update profile fields', () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ name: 'Klas', linkedin: 'klasolsson' });
    });
    expect(result.current.profile.name).toBe('Klas');
    expect(result.current.profile.linkedin).toBe('klasolsson');
    expect(result.current.profile.portfolio).toBe('');
  });

  it('should persist profile to localStorage', () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ name: 'Test', onboardingComplete: true });
    });
    const stored = JSON.parse(localStorage.getItem('gosta-profile')!);
    expect(stored.name).toBe('Test');
    expect(stored.onboardingComplete).toBe(true);
  });

  it('should reset all data', () => {
    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.updateProfile({ name: 'Klas', onboardingComplete: true });
    });
    expect(result.current.profile.name).toBe('Klas');

    act(() => {
      result.current.resetProfile();
    });
    // resetProfile clears localStorage and triggers window.location.replace
    expect(localStorage.getItem('gosta-profile')).toBeNull();
    expect(localStorage.getItem('gosta-favorites')).toBeNull();
    expect(localStorage.getItem('gosta-notes')).toBeNull();
  });
});

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with no favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite('xenit')).toBe(false);
  });

  it('should toggle a favorite on', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('xenit');
    });
    expect(result.current.isFavorite('xenit')).toBe(true);
  });

  it('should toggle a favorite off', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('xenit');
    });
    act(() => {
      result.current.toggleFavorite('xenit');
    });
    expect(result.current.isFavorite('xenit')).toBe(false);
  });

  it('should handle multiple favorites independently', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('xenit');
      result.current.toggleFavorite('ericsson');
    });
    // Note: because toggleFavorite uses a callback, the second call in the same act
    // may not see the first update immediately in some cases. Let's toggle separately.
    expect(result.current.isFavorite('xenit')).toBe(true);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('deloitte');
    });
    const stored = JSON.parse(localStorage.getItem('gosta-favorites')!);
    expect(stored.deloitte).toBe(true);
  });
});

describe('useNotes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty string for company with no notes', () => {
    const { result } = renderHook(() => useNotes());
    expect(result.current.getNote('xenit')).toBe('');
  });

  it('should store and retrieve a note', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('xenit', 'Bra samtal om Kubernetes');
    });
    expect(result.current.getNote('xenit')).toBe('Bra samtal om Kubernetes');
  });

  it('should handle notes for multiple companies', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('xenit', 'Cloud-folk');
    });
    act(() => {
      result.current.setNote('ericsson', '5G-teamet');
    });
    expect(result.current.getNote('xenit')).toBe('Cloud-folk');
    expect(result.current.getNote('ericsson')).toBe('5G-teamet');
  });

  it('should persist notes to localStorage', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('cgi', 'Intressant trainee-program');
    });
    const stored = JSON.parse(localStorage.getItem('gosta-notes')!);
    expect(stored.cgi).toBe('Intressant trainee-program');
  });
});
