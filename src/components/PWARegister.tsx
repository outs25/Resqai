'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[ResQAI PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[ResQAI PWA] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
