'use client';

import { useEffect, useRef, useCallback } from 'react';

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export default function SessionTimeout() {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('raamatupood-cart');
      document.cookie = 'raamatupood-cart-sync=; Path=/; Max-Age=0; SameSite=Lax';
      sessionStorage.clear();
    } catch {
      // ignore browser storage errors
    }

    window.location.assign('/api/auth/logout');
  }, []);

  const resetTimeout = useCallback(() => {
    // Clear existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set new timeout
    timeoutIdRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimeout();
    };

    // Set initial timeout
    resetTimeout();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [resetTimeout]);

  return null;
}
