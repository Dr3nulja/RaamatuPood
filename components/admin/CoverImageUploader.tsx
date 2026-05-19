'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
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
      <label className="mb-3 block text-sm font-medium text-gray-700">{t('admin.coverUploader.title')}</label>

      {/* Preview */}
      {preview && (
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <img
              src={preview}
              alt={t('admin.coverUploader.previewAlt')}
              className="h-32 w-24 rounded-lg border border-amber-100 object-cover"
              onError={() => setPreviewUrl('')}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
            >
              <span>{t('admin.common.remove')}</span>
              <span aria-hidden="true"> ✕</span>
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
            <span className="font-medium text-amber-600">{t('admin.coverUploader.uploadFile')}</span> {t('admin.coverUploader.orDragDrop')}
          </div>
          <div className="text-xs text-gray-400">{t('admin.coverUploader.fileHint')}</div>
        </label>

        {/* URL input toggle */}
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-center text-sm text-amber-600 transition hover:bg-amber-50"
          >
            {t('admin.coverUploader.pasteUrl')}
          </button>
        ) : (
          <input
            type="url"
            placeholder={t('admin.coverUploader.urlPlaceholder')}
            value={coverUrl}
            onChange={handleUrlChange}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
          />
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        {t('admin.coverUploader.priorityHint')}
      </div>
    </div>
  );
}
