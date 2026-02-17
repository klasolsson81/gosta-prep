import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should show onboarding when no profile exists', () => {
    render(<App />);
    expect(screen.getByText(/gösta/i)).toBeInTheDocument();
    expect(screen.getByText(/kom igång/i)).toBeInTheDocument();
  });

  it('should show main app when onboarding is complete', () => {
    localStorage.setItem('gosta-profile', JSON.stringify({
      name: 'Test',
      linkedin: '',
      portfolio: '',
      github: '',
      cvUrl: '',
      onboardingComplete: true,
    }));
    render(<App />);
    // Multiple elements contain "företag" – use getAllByText and check at least one
    const matches = screen.getAllByText(/företag/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should show bottom navigation after onboarding', () => {
    localStorage.setItem('gosta-profile', JSON.stringify({
      name: 'Test',
      linkedin: '',
      portfolio: '',
      github: '',
      cvUrl: '',
      onboardingComplete: true,
    }));
    render(<App />);
    // Nav items appear in both desktop and mobile navs, so use getAllByText
    expect(screen.getAllByText('Favoriter').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('QR-koder').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Schema').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Profil').length).toBeGreaterThanOrEqual(1);
  });
});
