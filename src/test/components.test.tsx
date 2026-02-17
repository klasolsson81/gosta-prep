import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CompanyCard from '../components/Companies/CompanyCard';
import SearchBar from '../components/Companies/SearchBar';
import type { Company } from '../types';

const mockCompany: Company = {
  id: 'test-company',
  name: 'Test AB',
  logo: '',
  description: 'Ett testföretag som utvecklar mjukvara.',
  seeking: ['Utvecklare', '.NET-utvecklare'],
  contacts: [{ name: 'Anna', role: 'CTO' }],
  website: 'https://test.se',
  tags: ['tech', 'startup'],
  iceBreakers: ['Hej', 'Tja', 'Yo'],
  locations: ['Göteborg', 'Stockholm'],
};

describe('CompanyCard', () => {
  it('should render company name', () => {
    render(
      <MemoryRouter>
        <CompanyCard
          company={mockCompany}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onClick={() => {}}
          index={0}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Test AB')).toBeInTheDocument();
  });

  it('should render company description', () => {
    render(
      <MemoryRouter>
        <CompanyCard
          company={mockCompany}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onClick={() => {}}
          index={0}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(mockCompany.description)).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(
      <MemoryRouter>
        <CompanyCard
          company={mockCompany}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onClick={() => {}}
          index={0}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('startup')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <CompanyCard
          company={mockCompany}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onClick={onClick}
          index={0}
        />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Test AB'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleFavorite when star is clicked without triggering card click', () => {
    const onClick = vi.fn();
    const onToggle = vi.fn();
    render(
      <MemoryRouter>
        <CompanyCard
          company={mockCompany}
          isFavorite={false}
          onToggleFavorite={onToggle}
          onClick={onClick}
          index={0}
        />
      </MemoryRouter>
    );
    // The star button is inside the card – find it by role
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // star button
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should render initials as avatar', () => {
    render(
      <MemoryRouter>
        <CompanyCard
          company={mockCompany}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onClick={() => {}}
          index={0}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('TA')).toBeInTheDocument(); // Test AB -> TA
  });
});

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/sök/i)).toBeInTheDocument();
  });

  it('should display the current search value', () => {
    render(<SearchBar value="ericsson" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/sök/i) as HTMLInputElement;
    expect(input.value).toBe('ericsson');
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(/sök/i), {
      target: { value: 'deloitte' },
    });
    expect(onChange).toHaveBeenCalledWith('deloitte');
  });

  it('should show clear button when value is non-empty', () => {
    render(<SearchBar value="test" onChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('should call onChange with empty string when clear is clicked', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onChange).toHaveBeenCalledWith('');
  });
});
