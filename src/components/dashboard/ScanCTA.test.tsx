import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScanCTA } from './ScanCTA';

describe('ScanCTA', () => {
  it('renders a link with text "Scan Your First Bouquet"', () => {
    render(<ScanCTA />);
    const link = screen.getByRole('link', {
      name: /scan your first bouquet/i,
    });
    expect(link).toBeTruthy();
  });

  it('links to /scan', () => {
    render(<ScanCTA />);
    const link = screen.getByRole('link', {
      name: /scan your first bouquet/i,
    });
    expect(link.getAttribute('href')).toBe('/scan');
  });
});
