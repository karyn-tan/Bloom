'use client';

import { useRef, useState } from 'react';

type ImageUploaderProps = {
  onSubmit: (file: File) => void;
  isUploading: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

const UploadIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
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

const FileIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

/**
 * ImageUploader — file picker with preview, type/size validation, and submit with electric styling
 */
export function ImageUploader({ onSubmit, isUploading }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG or PNG photo');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Photo must be under 10 MB');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File input area */}
      <div
        className="border-[3px] border-dashed border-border p-8 text-center cursor-pointer hover:bg-cyan/5 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          data-testid="file-input"
        />
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Flower preview"
              className="max-h-64 mx-auto border-[3px] border-border"
            />
            {!isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-pink border-[2px] border-border flex items-center justify-center hover:bg-pink-dark transition-colors"
              >
                <svg
                  className="w-4 h-4 text-surface"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-lime/20 border-[3px] border-border flex items-center justify-center">
              <CameraIcon className="w-8 h-8 text-lime" />
            </div>
            <p className="text-lg font-black text-ink uppercase tracking-tight mb-1">
              Upload your flower photo
            </p>
            <p className="text-sm text-ink/50 font-medium">
              JPEG or PNG, up to 10 MB
            </p>
          </div>
        )}
      </div>

      {/* File info */}
      {selectedFile && !isUploading && (
        <div className="flex items-center gap-3 p-3 bg-lime/10 border-[2px] border-border">
          <FileIcon className="w-5 h-5 text-lime" />
          <span className="text-sm font-medium text-ink flex-1 truncate">
            {selectedFile.name}
          </span>
          <span className="text-xs font-bold text-ink/50 uppercase">
            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-pink/20 border-[2px] border-border flex items-center gap-3">
          <svg
            className="w-5 h-5 text-pink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-bold text-pink">{error}</p>
        </div>
      )}

      {/* Submit button */}
      {selectedFile && !isUploading && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-full bg-pink text-surface text-lg font-black py-4 px-6 border-[3px] border-border shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
        >
          Identify Flowers
        </button>
      )}
    </div>
  );
}
