'use client';

import { useEffect } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-5 py-3 text-sm font-semibold shadow-[0_18px_45px_rgba(241,143,188,0.22)] transition-all ${
      type === 'success'
        ? 'border-pink-200/80 bg-[rgba(255,250,253,0.95)] text-rose-700'
        : 'border-red-200 bg-white text-red-600'
    }`}>
      {message}
    </div>
  );
}
