import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowerCard } from './FlowerCard';
import type { CareTip } from '@/lib/gemini';

const mockCareTip: CareTip = {
  common_name: 'Rose',
  lifespan_days: { min: 7, max: 12 },
  care: {
    water: 'Change water every 2 days.',
    light: 'Indirect sunlight.',
    temperature: 'Room temperature.',
    trim: 'Cut stems at angle.',
  },
  fun_facts: ['Roses are ancient.'],
};

describe('FlowerCard', () => {
  it('renders flower name', () => {
    render(
      <FlowerCard
        commonName="Rose"
        scientificName="Rosa gallica"
        confidence={0.85}
        care={null}
        careLoading={false}
        careError={null}
        onRetryCare={vi.fn()}
      />,
    );
    expect(screen.getByText('Rose')).toBeTruthy();
  });

  it('shows loading skeleton when care is loading', () => {
    const { container } = render(
      <FlowerCard
        commonName="Rose"
        scientificName="Rosa gallica"
        confidence={0.85}
        care={null}
        careLoading={true}
        careError={null}
        onRetryCare={vi.fn()}
      />,
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  it('shows care tips when loaded', () => {
    render(
      <FlowerCard
        commonName="Rose"
        scientificName="Rosa gallica"
        confidence={0.85}
        care={mockCareTip}
        careLoading={false}
        careError={null}
        onRetryCare={vi.fn()}
      />,
    );
    expect(screen.getByText('Change water every 2 days.')).toBeTruthy();
    expect(screen.getByText(/7.*12 days/)).toBeTruthy();
  });

  it('shows error with retry button', () => {
    const onRetry = vi.fn();
    render(
      <FlowerCard
        commonName="Rose"
        scientificName="Rosa gallica"
        confidence={0.85}
        care={null}
        careLoading={false}
        careError="Care tips unavailable"
        onRetryCare={onRetry}
      />,
    );
    expect(screen.getByText('Care tips unavailable')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });
});
