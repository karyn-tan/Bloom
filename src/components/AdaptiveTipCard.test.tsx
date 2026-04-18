import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdaptiveTipCard } from './AdaptiveTipCard';
import type { CareLogStatus } from '@/lib/careLog';

describe('AdaptiveTipCard', () => {
  it('renders the "HOW\'S IT GOING?" label', () => {
    render(<AdaptiveTipCard tip="Looking good!" status="all_good" />);
    expect(screen.getByText("HOW'S IT GOING?")).toBeInTheDocument();
  });

  it('renders the tip text', () => {
    render(
      <AdaptiveTipCard
        tip="Your roses may be thirsty. Top up the water now."
        status="missed_watering"
      />,
    );
    expect(
      screen.getByText('Your roses may be thirsty. Top up the water now.'),
    ).toBeInTheDocument();
  });

  it('applies teal background for all_good status', () => {
    const { container } = render(
      <AdaptiveTipCard tip="Keep it up!" status="all_good" />,
    );
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('bg-accent-teal');
  });

  it('applies gold background for missed_watering status', () => {
    const { container } = render(
      <AdaptiveTipCard
        tip="You missed watering yesterday."
        status="missed_watering"
      />,
    );
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('bg-accent-gold');
  });

  it('applies gold background for missed_trim status', () => {
    const { container } = render(
      <AdaptiveTipCard tip="Trim your stems today." status="missed_trim" />,
    );
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('bg-accent-gold');
  });

  it('applies muted background for no_data status', () => {
    const { container } = render(
      <AdaptiveTipCard
        tip="Start logging your care actions."
        status="no_data"
      />,
    );
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('bg-muted');
  });

  it('renders all statuses without crashing', () => {
    const statuses: CareLogStatus[] = [
      'all_good',
      'missed_watering',
      'missed_trim',
      'no_data',
    ];
    statuses.forEach((status) => {
      const { unmount } = render(
        <AdaptiveTipCard tip="A tip." status={status} />,
      );
      unmount();
    });
  });
});
