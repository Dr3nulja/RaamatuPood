'use client';

import { useRef } from 'react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

type AvatarUploaderProps = {
  name: string;
  currentAvatarUrl: string | null;
  previewUrl: string | null;
  onPickFile: (file: File | null) => void;
};

function getInitial(name: string) {
  return (name.trim().charAt(0) || 'U').toUpperCase();
}

export default function AvatarUploader({ name, currentAvatarUrl, previewUrl, onPickFile }: AvatarUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleUrl = previewUrl || currentAvatarUrl;
  const initial = getInitial(name);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-white text-3xl font-bold text-amber-800 shadow-md ring-4 ring-amber-50 transition hover:scale-[1.02]"
      >
        {visibleUrl ? (
          <img src={visibleUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-white/0 text-sm font-semibold text-zinc-700 opacity-0 transition group-hover:bg-white/55 group-hover:opacity-100">
          {t('profile.changeAvatar')}
        </span>
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onPickFile(event.target.files?.[0] || null)}
      />

      <p className="text-xs text-zinc-500">{t('profile.avatarHint')}</p>
    </div>
  );
}