import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CorrectFlowerForm } from './CorrectFlowerForm';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockFetch = vi.fn();

describe('CorrectFlowerForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  it('renders edit button in closed state', () => {
    render(<CorrectFlowerForm scanId="scan-1" currentCommonName="Tulip" />);
    expect(screen.getByText('Not right? Edit')).toBeTruthy();
  });

  it('opens form when edit button clicked', () => {
    render(<CorrectFlowerForm scanId="scan-1" currentCommonName="Tulip" />);
    fireEvent.click(screen.getByText('Not right? Edit'));
    expect(screen.getByText('What flower is this?')).toBeTruthy();
    expect(screen.getByDisplayValue('Tulip')).toBeTruthy();
  });

  it('submits correction and refreshes router', async () => {
    render(<CorrectFlowerForm scanId="scan-1" currentCommonName="Tulip" />);
    fireEvent.click(screen.getByText('Not right? Edit'));

    const input = screen.getByDisplayValue('Tulip');
    fireEvent.change(input, { target: { value: 'Rose' } });
    fireEvent.click(screen.getByText('Update & Regenerate'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/scans/scan-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ common_name: 'Rose', scientific_name: 'Rose' }),
      });
    });
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it('shows error on failed submission', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
    render(<CorrectFlowerForm scanId="scan-1" currentCommonName="Tulip" />);
    fireEvent.click(screen.getByText('Not right? Edit'));
    fireEvent.click(screen.getByText('Update & Regenerate'));

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeTruthy();
    });
  });

  it('closes form on cancel', () => {
    render(<CorrectFlowerForm scanId="scan-1" currentCommonName="Tulip" />);
    fireEvent.click(screen.getByText('Not right? Edit'));
    expect(screen.getByText('What flower is this?')).toBeTruthy();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Not right? Edit')).toBeTruthy();
  });

  it('shows spinner during submission', async () => {
    let resolveSubmit: (value: unknown) => void;
    mockFetch.mockReturnValue(
      new Promise((r) => {
        resolveSubmit = r;
      }),
    );
    render(<CorrectFlowerForm scanId="scan-1" currentCommonName="Tulip" />);
    fireEvent.click(screen.getByText('Not right? Edit'));
    fireEvent.click(screen.getByText('Update & Regenerate'));

    await waitFor(() => {
      expect(screen.getByText(/Regenerating care tips/)).toBeTruthy();
    });

    resolveSubmit!({ ok: true, json: () => Promise.resolve({}) });
  });
});
