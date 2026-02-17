import { describe, it, expect } from 'vitest';
import companies from '../data/companies.json';
import type { Company } from '../types';

const data = companies as Company[];

describe('companies.json data validation', () => {
  it('should contain exactly 30 companies', () => {
    expect(data).toHaveLength(30);
  });

  it('every company should have a unique id', () => {
    const ids = data.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every company should have a non-empty name', () => {
    for (const company of data) {
      expect(company.name.length).toBeGreaterThan(0);
    }
  });

  it('every company should have a non-empty description', () => {
    for (const company of data) {
      expect(company.description.length).toBeGreaterThan(20);
    }
  });

  it('every company should have at least 1 tag', () => {
    for (const company of data) {
      expect(company.tags.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every company should have at least 1 seeking entry', () => {
    for (const company of data) {
      expect(company.seeking.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every company should have exactly 3 ice-breakers', () => {
    for (const company of data) {
      expect(company.iceBreakers).toHaveLength(3);
      for (const ib of company.iceBreakers) {
        expect(ib.length).toBeGreaterThan(20);
      }
    }
  });

  it('every company should have a website URL', () => {
    for (const company of data) {
      expect(company.website).toMatch(/^https?:\/\//);
    }
  });

  it('every company should have a contacts array', () => {
    for (const company of data) {
      expect(Array.isArray(company.contacts)).toBe(true);
    }
  });

  it('should contain all expected companies from the exhibitor list', () => {
    const names = data.map(c => c.name.toLowerCase());
    const expected = [
      'xenit', 'new minds', 'enqore', 'trafikverket', 'sopra steria',
      'bots', 'evidi', 'stretch evolve', 'centiro', 'security solution',
      'tullverket', 'lime technologies', 'exsitec', 'ericsson', 'kpmg',
      'dirsys', 'akavia', 'capgemini', 'hogia', 'unionen student',
      'skatteverket', 'webbhuset', 'länsstyrelserna', 'redeploy', 'twoday',
      'deloitte', 'peab', 'sendify', 'cgi', 'st',
    ];
    for (const name of expected) {
      expect(names).toContain(name);
    }
  });

  it('ids should be lowercase kebab-case', () => {
    for (const company of data) {
      expect(company.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
