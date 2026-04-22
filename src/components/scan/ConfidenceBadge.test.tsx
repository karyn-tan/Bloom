import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceBadge } from './ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('renders percentage from confidence score', () => {
    render(<ConfidenceBadge confidence={0.85} />);
    expect(screen.getByText('85%')).toBeTruthy();
  });

  it('shows warning text when confidence is below 50%', () => {
    render(<ConfidenceBadge confidence={0.35} />);
    expect(screen.getByText(/not sure about this one/i)).toBeTruthy();
  });

  it('does not show warning when confidence is 50% or above', () => {
    render(<ConfidenceBadge confidence={0.5} />);
    expect(screen.queryByText(/not sure about this one/i)).toBeNull();
  });
});
