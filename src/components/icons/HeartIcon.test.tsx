import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HeartIcon } from './HeartIcon';

describe('HeartIcon', () => {
  it('renders filled heart with accent-red fill', () => {
    const { container } = render(<HeartIcon filled />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('var(--color-accent-red)');
  });

  it('renders empty heart with surface fill', () => {
    const { container } = render(<HeartIcon filled={false} />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('var(--color-surface)');
  });
});
