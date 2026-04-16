import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyDashboard } from './EmptyDashboard';

describe('EmptyDashboard', () => {
  it('renders the welcome header', () => {
    render(<EmptyDashboard />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders the how-it-works steps', () => {
    render(<EmptyDashboard />);
    expect(screen.getByText('Upload')).toBeTruthy();
    expect(screen.getByText('Identify')).toBeTruthy();
    expect(screen.getByText('Care Tips')).toBeTruthy();
  });

  it('renders the scan CTA', () => {
    render(<EmptyDashboard />);
    expect(
      screen.getByRole('link', { name: /scan your first bouquet/i }),
    ).toBeTruthy();
  });

  it('renders the seasonal teaser', () => {
    render(<EmptyDashboard />);
    expect(screen.getByText(/what's in season/i)).toBeTruthy();
  });
});
