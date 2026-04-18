import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RescanButton } from './RescanButton';

const mockFetch = vi.fn();

describe('RescanButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ scan_id: 'new-scan-1' }),
    });
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  it('renders full button by default', () => {
    render(<RescanButton />);
    expect(screen.getByText('📷 Rescan with New Photo')).toBeTruthy();
  });

  it('renders compact button when compact=true', () => {
    render(<RescanButton compact />);
    expect(screen.getByText('Rescan')).toBeTruthy();
  });

  it('renders hidden file input', () => {
    render(<RescanButton />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('accept')).toBe('image/jpeg,image/png');
  });

  it('shows error for invalid file type', async () => {
    render(<RescanButton />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['test'], 'test.gif', { type: 'image/gif' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(
        screen.getByText('Please upload a JPEG or PNG photo'),
      ).toBeTruthy();
    });
  });

  it('shows error for oversized file', async () => {
    render(<RescanButton />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('Photo must be under 10 MB')).toBeTruthy();
    });
  });

  it('shows error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'ID failed' }),
    });
    render(<RescanButton />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['test'], 'flower.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('ID failed')).toBeTruthy();
    });
  });

  it('includes existing_scan_id in form data for rescans', async () => {
    render(<RescanButton scanId="existing-scan" />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['test'], 'flower.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const [, opts] = mockFetch.mock.calls[0];
      const formData = opts.body as FormData;
      expect(formData.get('existing_scan_id')).toBe('existing-scan');
    });
  });

  it('dismisses error when dismiss button clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Oops' }),
    });
    render(<RescanButton />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['test'], 'flower.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('Oops')).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Oops')).toBeNull();
  });
});
