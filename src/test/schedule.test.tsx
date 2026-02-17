import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Timeline from '../components/Schedule/Timeline';

describe('Timeline', () => {
  it('should render the schedule heading', () => {
    render(
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    );
    expect(screen.getByText(/schema/i)).toBeInTheDocument();
    expect(screen.getByText(/19 feb 2026/i)).toBeInTheDocument();
  });

  it('should render all schedule events', () => {
    render(
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    );
    expect(screen.getByText(/frukostföreläsning/i)).toBeInTheDocument();
    expect(screen.getByText(/^mässan öppnar$/i)).toBeInTheDocument();
    expect(screen.getByText(/lotteri: första 200/i)).toBeInTheDocument();
    expect(screen.getByText(/lunchföreläsning/i)).toBeInTheDocument();
    expect(screen.getByText(/^lotteridragning$/i)).toBeInTheDocument();
    expect(screen.getByText(/mässan stänger/i)).toBeInTheDocument();
    expect(screen.getByText(/göstas mingel/i)).toBeInTheDocument();
  });

  it('should show times for all events', () => {
    render(
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/08:30/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/10:00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/12:00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/15:00/).length).toBeGreaterThanOrEqual(1);
  });

  it('should show locations where provided', () => {
    render(
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/lindholmen conference center/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/torg grön/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should display language tags', () => {
    render(
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Engelska').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Svenska').length).toBeGreaterThanOrEqual(1);
  });

  it('should mention SLUTSÅLT for the mingle', () => {
    render(
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    );
    expect(screen.getByText(/slutsålt/i)).toBeInTheDocument();
  });
});
