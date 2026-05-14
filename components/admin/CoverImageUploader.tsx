'use client';

import React, { useState } from 'react';

interface CoverImageUploaderProps {
  coverUrl: string;
  coverFile: File | null;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
}

export default function CoverImageUploader({
  coverUrl,
  coverFile,
  onUrlChange,
  onFileChange,
}: CoverImageUploaderProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Get preview image - priority: file > url
  const getPreviewImage = () => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    return coverUrl || '';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setShowUrlInput(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    onUrlChange(url);
    if (url) {
      setPreviewUrl(url);
    }
  };

  const handleRemove = () => {
    onFileChange(null);
    onUrlChange('');
    setPreviewUrl('');
    setShowUrlInput(false);
  };

  const preview = getPreviewImage();

  return (
    <div className="rounded-xl border border-amber-200 p-4">
      <label className="mb-3 block text-sm font-medium text-gray-700">Cover Image</label>

      {/* Preview */}
      {preview && (
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-24 rounded-lg border border-amber-100 object-cover"
              onError={() => setPreviewUrl('')}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Upload section */}
      <div className="space-y-2">
        {/* File upload */}
        <label className="block cursor-pointer rounded-lg border-2 border-dashed border-amber-200 px-4 py-3 text-center transition hover:border-amber-400">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-amber-600">Upload file</span> or drag and drop
          </div>
          <div className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB</div>
        </label>

        {/* URL input toggle */}
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-center text-sm text-amber-600 transition hover:bg-amber-50"
          >
            Or paste image URL
          </button>
        ) : (
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={coverUrl}
            onChange={handleUrlChange}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
          />
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        If both provided, uploaded file has priority
      </div>
    </div>
  );
}
