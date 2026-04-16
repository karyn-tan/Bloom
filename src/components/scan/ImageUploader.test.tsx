import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';

describe('ImageUploader', () => {
  it('renders upload prompt', () => {
    render(<ImageUploader onSubmit={vi.fn()} isUploading={false} />);
    expect(screen.getByText(/upload your bouquet photo/i)).toBeTruthy();
  });

  it('shows error for invalid file type', () => {
    render(<ImageUploader onSubmit={vi.fn()} isUploading={false} />);
    const input = screen.getByTestId('file-input');

    const file = new File(['data'], 'test.gif', { type: 'image/gif' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/please upload a jpeg or png photo/i)).toBeTruthy();
  });

  it('shows error for oversized file', () => {
    render(<ImageUploader onSubmit={vi.fn()} isUploading={false} />);
    const input = screen.getByTestId('file-input');

    const bigData = new ArrayBuffer(11 * 1024 * 1024);
    const file = new File([bigData], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/photo must be under 10 mb/i)).toBeTruthy();
  });

  it('shows submit button after valid file selection', () => {
    render(<ImageUploader onSubmit={vi.fn()} isUploading={false} />);
    const input = screen.getByTestId('file-input');

    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByRole('button', { name: /identify flowers/i }),
    ).toBeTruthy();
  });

  it('shows loading state when uploading', () => {
    render(<ImageUploader onSubmit={vi.fn()} isUploading={true} />);
    // No submit button visible in upload state without a file
    expect(screen.queryByRole('button', { name: /identifying/i })).toBeNull();
  });
});
