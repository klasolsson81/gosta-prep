import { useState, useCallback, useEffect } from 'react';

// In-memory fallback for private browsing / quota exceeded
const memoryStorage = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memoryStorage.get(key) ?? null;
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = safeGetItem(key);
    if (item) {
      try { return JSON.parse(item); } catch { /* ignore */ }
    }
    return initialValue;
  });

  // Sync across components: listen for custom storage events on same page
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        setStoredValue(detail.value);
      }
    };
    window.addEventListener('local-storage-sync', handler);
    return () => window.removeEventListener('local-storage-sync', handler);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      safeSetItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key, value: valueToStore } }));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}
