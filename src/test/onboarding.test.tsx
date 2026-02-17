import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Onboarding from '../components/Onboarding/Onboarding';

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
  };
});

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  );
}

describe('Onboarding', () => {
  it('should show welcome screen on first render', () => {
    renderOnboarding();
    expect(screen.getByText('GÖSTA Prep 2026')).toBeInTheDocument();
    expect(screen.getByText(/kom igång/i)).toBeInTheDocument();
  });

  it('should navigate to name step when clicking Kom igång', () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/kom igång/i));
    expect(screen.getByText(/vad heter du/i)).toBeInTheDocument();
  });

  it('should disable Nästa button when name is empty', () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/kom igång/i));
    const nextBtn = screen.getByText(/nästa/i);
    expect(nextBtn).toBeDisabled();
  });

  it('should enable Nästa button when name is filled in', () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/kom igång/i));
    fireEvent.change(screen.getByPlaceholderText(/förnamn/i), {
      target: { value: 'Klas' },
    });
    expect(screen.getByText(/nästa/i)).not.toBeDisabled();
  });

  it('should navigate to LinkedIn step after entering name', () => {
    renderOnboarding();
    fireEvent.click(screen.getByText(/kom igång/i));
    fireEvent.change(screen.getByPlaceholderText(/förnamn/i), {
      target: { value: 'Klas' },
    });
    fireEvent.click(screen.getByText(/nästa/i));
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('should allow skipping all optional steps to reach done', () => {
    renderOnboarding();

    // Welcome -> Name
    fireEvent.click(screen.getByText(/kom igång/i));

    // Enter name
    fireEvent.change(screen.getByPlaceholderText(/förnamn/i), {
      target: { value: 'Test' },
    });
    fireEvent.click(screen.getByText(/nästa/i));

    // LinkedIn - skip
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/hoppa över/i));

    // Portfolio - skip
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/hoppa över/i));

    // GitHub - skip
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/hoppa över/i));

    // CV - skip
    expect(screen.getByText('CV')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/hoppa över/i));

    // Done screen
    expect(screen.getByText(/du är redo/i)).toBeInTheDocument();
  });

  it('should show summary with name on done screen', () => {
    renderOnboarding();

    fireEvent.click(screen.getByText(/kom igång/i));
    fireEvent.change(screen.getByPlaceholderText(/förnamn/i), {
      target: { value: 'Anna' },
    });
    fireEvent.click(screen.getByText(/nästa/i));

    // Skip all optional
    fireEvent.click(screen.getByText(/hoppa över/i)); // LinkedIn
    fireEvent.click(screen.getByText(/hoppa över/i)); // Portfolio
    fireEvent.click(screen.getByText(/hoppa över/i)); // GitHub
    fireEvent.click(screen.getByText(/hoppa över/i)); // CV

    expect(screen.getByText(/du är redo, anna/i)).toBeInTheDocument();
    expect(screen.getByText(/starta appen/i)).toBeInTheDocument();
  });
});
