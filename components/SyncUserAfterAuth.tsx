'use client';

import { useEffect, useRef } from 'react';

type SyncUserAfterAuthProps = {
  isAuthenticated: boolean;
};

export default function SyncUserAfterAuth({ isAuthenticated }: SyncUserAfterAuthProps) {
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || hasSyncedRef.current) {
      return;
    }

    const sync = async () => {
      try {
        const response = await fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (isMounted && response.ok) {
          hasSyncedRef.current = true;
        }
      } catch {
        // silent retry on next navigation/reload
      }
    };

    void sync();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return null;
}
