import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveBouquetForm } from './SaveBouquetForm';

const mockPush = vi.fn();
const mockFetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SaveBouquetForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bouquet: { id: 'bouq-1' } }),
    });
  });

  it("should render name input with today's date as default value", () => {
    render(<SaveBouquetForm scanId="scan-123" />);
    const expectedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const input = screen.getByRole('textbox');
    expect((input as HTMLInputElement).value).toBe(expectedDate);
  });

  it('should render reminder opt-in checkbox unchecked by default', () => {
    render(<SaveBouquetForm scanId="scan-123" />);
    const checkbox = screen.getByRole('checkbox');
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });

  it('should render a Save Bouquet submit button', () => {
    render(<SaveBouquetForm scanId="scan-123" />);
    expect(screen.getByRole('button', { name: /save bouquet/i })).toBeTruthy();
  });

  it('should POST to /api/bouquets with correct body on submit', async () => {
    render(<SaveBouquetForm scanId="scan-123" />);
    fireEvent.click(screen.getByRole('button', { name: /save bouquet/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/bouquets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"scan_id":"scan-123"'),
        }),
      );
      const callBody = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(callBody.reminder_opt_in).toBe(false);
    });
  });

  it('should redirect to /dashboard on success', async () => {
    render(<SaveBouquetForm scanId="scan-123" />);
    fireEvent.click(screen.getByRole('button', { name: /save bouquet/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message when POST fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Scan not found' }),
    });
    render(<SaveBouquetForm scanId="scan-123" />);
    fireEvent.click(screen.getByRole('button', { name: /save bouquet/i }));
    await waitFor(() => {
      expect(screen.getByText(/scan not found/i)).toBeTruthy();
    });
  });

  it('should disable submit button while submitting', async () => {
    let resolveFetch!: () => void;
    mockFetch.mockReturnValue(
      new Promise<{
        ok: boolean;
        json: () => Promise<{ bouquet: { id: string } }>;
      }>((resolve) => {
        resolveFetch = () =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ bouquet: { id: 'b1' } }),
          });
      }),
    );
    render(<SaveBouquetForm scanId="scan-123" />);
    fireEvent.click(screen.getByRole('button', { name: /save bouquet/i }));
    // Button text changes to "Saving…" when submitting — match by type instead
    await waitFor(() => {
      const btn = screen.getByRole('button');
      expect(btn).toHaveProperty('disabled', true);
    });
    resolveFetch();
  });

  it('should include reminder_opt_in: true when checkbox is checked before submit', async () => {
    render(<SaveBouquetForm scanId="scan-123" />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /save bouquet/i }));
    await waitFor(() => {
      const callBody = JSON.parse(
        (mockFetch.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(callBody.reminder_opt_in).toBe(true);
    });
  });
});
