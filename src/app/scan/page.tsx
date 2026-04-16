'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/scan/ImageUploader';
import Link from 'next/link';

const ArrowLeftIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const SparklesIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const SunIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const FocusIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const CameraIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ExpandIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
);

type ScanState =
  | { step: 'upload' }
  | { step: 'identifying' }
  | { step: 'error'; message: string };

/**
 * ScanPage — upload a bouquet photo, identify the top flower, redirect to detail
 */
export default function ScanPage() {
  const [state, setState] = useState<ScanState>({ step: 'upload' });
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setState({ step: 'identifying' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setState({
          step: 'error',
          message:
            data.error ??
            "We couldn't identify your flowers. Try a photo in natural light with the flowers clearly visible.",
        });
        return;
      }

      const data = (await res.json()) as { scan_id: string };
      router.push(`/dashboard/scan/${data.scan_id}?new=1`);
    } catch {
      setState({
        step: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <main className="min-h-screen bg-bg">
      {/* Top accent bar */}
      <div className="w-full h-3 bg-sage" />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-ink font-bold mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage border-[3px] border-border mb-4 shadow-[3px_3px_0px_0px_var(--color-border)]">
            <SparklesIcon className="w-4 h-4 text-ink" />
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              AI-Powered
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-ink uppercase tracking-tight">
            Scan Your Flower
          </h1>
          <p className="text-muted mt-2 font-medium">
            Upload a clear photo and we&apos;ll identify your flowers instantly
          </p>
        </div>

        {/* Content */}
        {state.step === 'upload' && (
          <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_#7CB97A] p-6">
            <ImageUploader onSubmit={handleUpload} isUploading={false} />
          </div>
        )}

        {state.step === 'identifying' && (
          <div className="space-y-6">
            <div className="bg-surface border-[3px] border-border shadow-[6px_6px_0px_0px_#90D4C5] p-6">
              <ImageUploader onSubmit={handleUpload} isUploading={true} />
            </div>
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-coral border-t-transparent animate-spin" />
                <p className="text-xl font-black text-ink uppercase tracking-wider animate-pulse">
                  Identifying flowers...
                </p>
              </div>
              <p className="text-muted mt-2 font-medium">
                Our AI is analyzing your photo
              </p>
            </div>
          </div>
        )}

        {state.step === 'error' && (
          <div className="space-y-4">
            <div className="bg-surface border-[3px] border-border shadow-[4px_4px_0px_0px_#FF6B6B] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-coral/20 border-[3px] border-border flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-coral"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-ink uppercase text-sm tracking-wider mb-1">
                    Oops!
                  </p>
                  <p className="text-muted font-medium">{state.message}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setState({ step: 'upload' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-mint text-ink font-black border-[3px] border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try again
            </button>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border-[3px] border-border p-4 shadow-[4px_4px_0px_0px_#FFD966]">
            <div className="flex items-center gap-2 mb-2">
              <SunIcon className="w-4 h-4 text-butter" />
              <p className="font-black text-ink uppercase text-xs tracking-wider">
                Good Lighting
              </p>
            </div>
            <p className="text-sm text-muted font-medium">
              Use natural light, avoid harsh shadows
            </p>
          </div>
          <div className="bg-surface border-[3px] border-border p-4 shadow-[4px_4px_0px_0px_#74C0FC]">
            <div className="flex items-center gap-2 mb-2">
              <FocusIcon className="w-4 h-4 text-sky" />
              <p className="font-black text-ink uppercase text-xs tracking-wider">
                Clear View
              </p>
            </div>
            <p className="text-sm text-muted font-medium">
              Make sure flowers are in focus
            </p>
          </div>
          <div className="bg-surface border-[3px] border-border p-4 shadow-[4px_4px_0px_0px_#7CB97A]">
            <div className="flex items-center gap-2 mb-2">
              <CameraIcon className="w-4 h-4 text-sage" />
              <p className="font-black text-ink uppercase text-xs tracking-wider">
                Single Flower
              </p>
            </div>
            <p className="text-sm text-muted font-medium">
              Focus on one flower at a time
            </p>
          </div>
          <div className="bg-surface border-[3px] border-border p-4 shadow-[4px_4px_0px_0px_#FF6B6B]">
            <div className="flex items-center gap-2 mb-2">
              <ExpandIcon className="w-4 h-4 text-coral" />
              <p className="font-black text-ink uppercase text-xs tracking-wider">
                Close Up
              </p>
            </div>
            <p className="text-sm text-muted font-medium">
              Get close enough to see petals clearly
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
