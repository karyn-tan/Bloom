import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CareActionButtons } from './CareActionButtons';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

const BOUQUET_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('CareActionButtons', () => {
  it('renders the refresh button', () => {
    render(<CareActionButtons bouquetId={BOUQUET_ID} />);
    expect(
      screen.getByRole('button', { name: /change water & trim/i }),
    ).toBeInTheDocument();
  });

  it('calls fetch with correct body when refresh button is clicked', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CareActionButtons bouquetId={BOUQUET_ID} />);

    fireEvent.click(
      screen.getByRole('button', { name: /change water & trim/i }),
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/care-log');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual({
      bouquet_id: BOUQUET_ID,
      action: 'refresh',
    });
  });

  it('disables button while fetch is in-flight', async () => {
    // Never resolves during the test — keeps loading state active
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<CareActionButtons bouquetId={BOUQUET_ID} />);

    fireEvent.click(
      screen.getByRole('button', { name: /change water & trim/i }),
    );

    // Button should be disabled while loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging/i })).toBeDisabled();
    });
  });

  it('calls router.refresh() on successful fetch response', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CareActionButtons bouquetId={BOUQUET_ID} />);

    fireEvent.click(
      screen.getByRole('button', { name: /change water & trim/i }),
    );

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledOnce());
  });

  it('does not call router.refresh() when fetch returns non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    render(<CareActionButtons bouquetId={BOUQUET_ID} />);

    fireEvent.click(
      screen.getByRole('button', { name: /change water & trim/i }),
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('re-enables button after fetch completes (success)', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CareActionButtons bouquetId={BOUQUET_ID} />);

    fireEvent.click(
      screen.getByRole('button', { name: /change water & trim/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /change water & trim/i }),
      ).not.toBeDisabled(),
    );
  });
});
