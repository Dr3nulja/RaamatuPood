'use client';

import Button from '@/components/ui/Button';

type ProfileHeaderProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  onEdit: () => void;
};

function getInitial(name: string, email: string) {
  const source = name.trim() || email.trim() || 'U';
  return source.charAt(0).toUpperCase();
}

export default function ProfileHeader({ name, email, avatarUrl, onEdit }: ProfileHeaderProps) {
  const initial = getInitial(name, email);

  return (
    <header className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-5 text-center md:flex-row md:items-center md:text-left">
        <Button
          type="button"
          variant="ghost"
          onClick={onEdit}
          className="group relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-white text-2xl font-bold text-amber-800 shadow-md ring-4 ring-amber-50 transition hover:scale-[1.02] md:mx-0 md:h-24 md:w-24"
          aria-label="Edit profile avatar"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
          <span className="absolute hidden rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700 shadow-sm group-hover:block">
            Edit
          </span>
        </Button>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Profile</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">{name}</h1>
          <p className="text-sm text-zinc-500 md:text-base">{email}</p>
        </div>

        <div className="flex justify-center md:justify-end">
          <Button type="button" variant="outline" onClick={onEdit} className="rounded-full px-4 py-2 text-sm">
            Edit Profile
          </Button>
        </div>
      </div>
    </header>
  );
}