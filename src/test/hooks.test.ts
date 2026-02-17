import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should store and retrieve a string value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));
    act(() => {
      result.current[1]('hello');
    });
    expect(result.current[0]).toBe('hello');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('hello');
  });

  it('should store and retrieve an object value', () => {
    const { result } = renderHook(() => useLocalStorage('test-obj', { name: '' }));
    act(() => {
      result.current[1]({ name: 'Klas' });
    });
    expect(result.current[0]).toEqual({ name: 'Klas' });
  });

  it('should support updater function', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(1);
    act(() => {
      result.current[1](prev => prev + 5);
    });
    expect(result.current[0]).toBe(6);
  });

  it('should read existing localStorage data on mount', () => {
    localStorage.setItem('existing', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('existing', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool', false));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
  });
});
