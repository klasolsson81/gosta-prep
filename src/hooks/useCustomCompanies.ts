import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Company } from '../types';

export function useCustomCompanies() {
  const [companies, setCompanies] = useLocalStorage<Company[]>('gosta-custom-companies', []);

  const addCompany = useCallback((data: Omit<Company, 'id' | 'isCustom'>) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const company: Company = { ...data, id, isCustom: true };
    setCompanies(prev => [...prev, company]);
    return company;
  }, [setCompanies]);

  const removeCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  }, [setCompanies]);

  return { customCompanies: companies, addCompany, removeCompany };
}
