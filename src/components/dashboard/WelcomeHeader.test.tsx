import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WelcomeHeader } from './WelcomeHeader';

describe('WelcomeHeader', () => {
  it('renders a heading with "Welcome to Bloom!"', () => {
    render(<WelcomeHeader />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Welcome to Bloom!');
  });

  it('renders a subtitle about flower care', () => {
    render(<WelcomeHeader />);
    expect(screen.getByText(/help your flowers last longer/i)).toBeTruthy();
  });
});
