import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DropletIcon } from './DropletIcon';

describe('DropletIcon', () => {
  it('renders filled droplet with accent-gold fill', () => {
    const { container } = render(<DropletIcon filled />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('var(--color-accent-gold)');
  });

  it('renders empty droplet with surface fill', () => {
    const { container } = render(<DropletIcon filled={false} />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('var(--color-surface)');
  });
});
