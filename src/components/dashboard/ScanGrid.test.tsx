import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScanGrid } from './ScanGrid';
import type { ScanSummary } from '@/lib/dashboard';

function makeScan(overrides: Partial<ScanSummary> = {}): ScanSummary {
  return {
    id: 'scan-1',
    flowerName: 'Sunflower',
    scientificName: 'Helianthus annuus',
    imageUrl: 'https://example.com/flower.jpg',
    createdAt: '2026-04-15T10:00:00Z',
    lifespanMin: 7,
    lifespanMax: 10,
    ...overrides,
  };
}

describe('ScanGrid', () => {
  it('renders the section heading', () => {
    render(<ScanGrid scans={[]} />);
    expect(screen.getByText('Your Scans')).toBeTruthy();
  });

  it('renders scan tiles with flower name and scientific name', () => {
    render(<ScanGrid scans={[makeScan()]} />);
    expect(screen.getByText('Sunflower')).toBeTruthy();
    expect(screen.getByText('Helianthus annuus')).toBeTruthy();
  });

  it('renders lifespan badge when available', () => {
    render(<ScanGrid scans={[makeScan()]} />);
    expect(screen.getByText('7–10d')).toBeTruthy();
  });

  it('does not render lifespan badge when null', () => {
    render(
      <ScanGrid scans={[makeScan({ lifespanMin: null, lifespanMax: null })]} />,
    );
    expect(screen.queryByText(/\d+–\d+d/)).toBeNull();
  });

  it('renders "No image" placeholder when imageUrl is null', () => {
    render(<ScanGrid scans={[makeScan({ imageUrl: null })]} />);
    expect(screen.getByText('No image')).toBeTruthy();
  });

  it('links to scan detail page', () => {
    render(<ScanGrid scans={[makeScan({ id: 'scan-42' })]} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/dashboard/scan/scan-42');
  });

  it('renders multiple scans with cycling colors', () => {
    const scans = [
      makeScan({ id: '1', flowerName: 'Rose' }),
      makeScan({ id: '2', flowerName: 'Tulip' }),
      makeScan({ id: '3', flowerName: 'Lily' }),
    ];
    render(<ScanGrid scans={scans} />);
    expect(screen.getByText('Rose')).toBeTruthy();
    expect(screen.getByText('Tulip')).toBeTruthy();
    expect(screen.getByText('Lily')).toBeTruthy();
  });
});
