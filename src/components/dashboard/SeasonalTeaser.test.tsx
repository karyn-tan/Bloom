import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeasonalTeaser } from './SeasonalTeaser';

describe('SeasonalTeaser', () => {
  it('renders a heading with "What\'s in Season"', () => {
    render(<SeasonalTeaser />);
    expect(screen.getByText(/what's in season/i)).toBeTruthy();
  });

  it('renders seasonal flower names', () => {
    render(<SeasonalTeaser />);
    expect(screen.getByText('Tulips')).toBeTruthy();
    expect(screen.getByText('Peonies')).toBeTruthy();
    expect(screen.getByText('Ranunculus')).toBeTruthy();
    expect(screen.getByText('Daffodils')).toBeTruthy();
  });

  it('renders care notes for each flower', () => {
    render(<SeasonalTeaser />);
    expect(
      screen.getByText(/keep stems trimmed at an angle/i),
    ).toBeTruthy();
  });
});
