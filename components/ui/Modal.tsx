'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 bg-white/20 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`modal-surface relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-2xl border border-white/45 bg-white/90 shadow-[0_20px_60px_rgba(34,24,16,0.14)] backdrop-blur-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100/70 px-6 py-4">
          <h2 className="font-serif text-xl font-bold text-secondary">{title}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="small"
            className="rounded-full bg-white/70 p-1 text-zinc-500 transition-colors hover:bg-white hover:text-zinc-700"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[62vh] overflow-y-auto px-6 py-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-amber-100/70 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
