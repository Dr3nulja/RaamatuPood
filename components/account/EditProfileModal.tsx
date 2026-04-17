'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AvatarUploader from '@/components/account/AvatarUploader';

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatarUrl: string | null;
  onSave: (payload: { username: string; avatar: File | null }) => Promise<void>;
};

export default function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentAvatarUrl,
  onSave,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUsername(currentName);
      setAvatarFile(null);
      setPreviewUrl(null);
    }
  }, [currentName, isOpen]);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const canSave = useMemo(() => {
    return username.trim().length > 0 || Boolean(avatarFile);
  }, [avatarFile, username]);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ username: username.trim(), avatar: avatarFile });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit profile"
      size="lg"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" loading={isSaving} disabled={!canSave} onClick={() => void handleSave()}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <AvatarUploader
          name={username || currentName}
          currentAvatarUrl={currentAvatarUrl}
          previewUrl={previewUrl}
          onPickFile={setAvatarFile}
        />

        <label className="block text-sm font-semibold text-zinc-800">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="Enter username"
          />
        </label>
      </div>
    </Modal>
  );
}