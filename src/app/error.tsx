'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled ResQAI Runtime Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-surface-container-high rounded-2xl p-space-lg shadow-xl border border-surface-container space-y-space-md">
        <div className="w-16 h-16 rounded-full bg-status-critical-soft text-status-critical flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-[32px] font-bold">
            crisis_alert
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-headline-md text-xl font-bold text-on-surface">
            System Alert Encountered
          </h2>
          <p className="font-body-sm text-body-sm text-text-citizen-muted">
            The emergency portal encountered an unexpected issue, but your access to emergency services remains available.
          </p>
        </div>

        {/* Emergency Call Fallback Card */}
        <div className="bg-status-critical-soft/40 border border-status-critical/30 rounded-xl p-3.5 text-left flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm font-bold text-status-critical block">
              Immediate Danger?
            </span>
            <span className="font-caption text-[11px] text-text-citizen-muted">
              Do not wait. Dial direct dispatch line:
            </span>
          </div>
          <a
            href="tel:112"
            className="px-4 py-2 rounded-lg bg-status-critical text-white font-label-md text-label-md font-bold shadow-md hover:bg-status-critical/90 active:scale-95 transition-all"
          >
            Call 112
          </a>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold active:scale-95 transition-transform shadow-sm"
          >
            Retry Portal
          </button>
          <Link
            href="/"
            className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center transition-colors"
          >
            Return to Emergency Home
          </Link>
        </div>
      </div>
    </div>
  );
}
