import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from './HowItWorks';

describe('HowItWorks', () => {
  it('renders three step cards', () => {
    render(<HowItWorks />);
    const steps = screen.getAllByRole('heading', { level: 3 });
    expect(steps).toHaveLength(3);
  });

  it('renders the correct step titles', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Upload')).toBeTruthy();
    expect(screen.getByText('Identify')).toBeTruthy();
    expect(screen.getByText('Care Tips')).toBeTruthy();
  });

  it('renders step numbers', () => {
    render(<HowItWorks />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});
