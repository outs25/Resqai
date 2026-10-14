'use client';

import React, { useState, useEffect } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineReports();
    };
    const handleOffline = () => {
      setIsOffline(true);
      checkQueuedReports();
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      checkQueuedReports();
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const checkQueuedReports = () => {
    try {
      const stored = localStorage.getItem('resqai_offline_queue');
      if (stored) {
        const list = JSON.parse(stored);
        setQueuedCount(list.length);
      }
    } catch (e) {}
  };

  const syncOfflineReports = async () => {
    try {
      const stored = localStorage.getItem('resqai_offline_queue');
      if (!stored) return;
      const list = JSON.parse(stored);
      if (list.length === 0) return;

      for (const item of list) {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      localStorage.removeItem('resqai_offline_queue');
      setQueuedCount(0);
    } catch (e) {
      console.warn('Failed to sync offline queue:', e);
    }
  };

  if (!isOffline && queuedCount === 0) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-40 bg-status-high text-white px-4 py-2 shadow-md flex items-center justify-between text-xs backdrop-blur-md">
      <div className="flex items-center gap-2 max-w-2xl mx-auto w-full">
        <span className="material-symbols-outlined text-[18px] shrink-0 animate-pulse">
          {isOffline ? 'wifi_off' : 'cloud_sync'}
        </span>
        <div className="flex-1 font-body-sm text-body-sm text-white">
          {isOffline ? (
            <span>
              <strong>Offline Resiliency Active:</strong> Weak signal. Report cached locally and synced instantly upon reconnection.
            </span>
          ) : (
            <span>
              <strong>Online:</strong> Synchronizing {queuedCount} cached emergency report(s)...
            </span>
          )}
        </div>
        {queuedCount > 0 && (
          <button
            onClick={syncOfflineReports}
            className="px-2.5 py-1 rounded-full bg-black/20 hover:bg-black/30 text-caption font-bold shrink-0 transition-colors"
          >
            Sync Now ({queuedCount})
          </button>
        )}
      </div>
    </div>
  );
};
