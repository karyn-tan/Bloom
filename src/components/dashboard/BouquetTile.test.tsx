import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BouquetTile } from './BouquetTile';
import type { BouquetSummary } from '@/lib/dashboard';

const mockRefresh = vi.fn();
const mockFetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

function makeBouquet(overrides: Partial<BouquetSummary> = {}): BouquetSummary {
  return {
    id: 'bouq-1',
    name: 'Kitchen table',
    scanId: 'scan-1',
    addedAt: new Date().toISOString(),
    ageInDays: 3,
    daysRemaining: 4,
    isPastPeak: false,
    lifespanMin: 7,
    imageUrl: 'https://example.com/img.jpg',
    flowerName: 'Tulip',
    ...overrides,
  };
}

describe('BouquetTile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    mockFetch.mockResolvedValue({ ok: true });
  });

  it('should render the flower name', () => {
    render(<BouquetTile bouquet={makeBouquet()} />);
    expect(screen.getByText('Tulip')).toBeTruthy();
  });

  it('should render age in days', () => {
    render(<BouquetTile bouquet={makeBouquet({ ageInDays: 3 })} />);
    expect(screen.getByText(/3 days? old/i)).toBeTruthy();
  });

  it('should render days remaining when not past peak', () => {
    render(
      <BouquetTile
        bouquet={makeBouquet({ daysRemaining: 4, isPastPeak: false })}
      />,
    );
    expect(screen.getByText(/4 days? left/i)).toBeTruthy();
  });

  it('should render "Likely past peak" badge and not render countdown when isPastPeak is true', () => {
    render(
      <BouquetTile
        bouquet={makeBouquet({ isPastPeak: true, daysRemaining: -1 })}
      />,
    );
    expect(screen.getByTestId('past-peak-badge')).toBeTruthy();
    expect(screen.queryByText(/days? left/i)).toBeNull();
  });

  it('should render image when imageUrl is provided', () => {
    render(
      <BouquetTile
        bouquet={makeBouquet({ imageUrl: 'https://example.com/img.jpg' })}
      />,
    );
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('should not crash when imageUrl is null', () => {
    render(<BouquetTile bouquet={makeBouquet({ imageUrl: null })} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Tulip')).toBeTruthy();
  });

  it('should call window.confirm, then fetch DELETE, then router.refresh on delete button click', async () => {
    render(<BouquetTile bouquet={makeBouquet({ id: 'bouq-99' })} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/bouquets/bouq-99',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('should disable the delete button while deletion is in progress', async () => {
    let resolveFetch!: () => void;
    mockFetch.mockReturnValue(
      new Promise<{ ok: boolean }>((resolve) => {
        resolveFetch = () => resolve({ ok: true });
      }),
    );
    render(<BouquetTile bouquet={makeBouquet()} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    // Button text changes to "Deleting…" — match by role without name filter
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveProperty('disabled', true);
    });
    resolveFetch();
  });
});
