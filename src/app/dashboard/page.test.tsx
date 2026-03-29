import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

describe('DashboardPage', () => {
  it('renders without crashing', () => {
    render(<DashboardPage />);
    expect(document.body).toBeTruthy();
  });

  it('renders a heading containing Dashboard or Bloom', () => {
    render(<DashboardPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/dashboard|bloom/i);
  });
});
