import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-surface-container-high rounded-2xl p-space-lg shadow-xl border border-surface-container space-y-space-md">
        <div className="w-16 h-16 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">
            search_off
          </span>
        </div>

        <div className="space-y-1">
          <span className="font-caption text-caption text-primary font-mono font-bold uppercase">
            Error 404 • Resource Not Found
          </span>
          <h2 className="font-headline-md text-xl font-bold text-on-surface">
            Page Not Located
          </h2>
          <p className="font-body-sm text-body-sm text-text-citizen-muted">
            The requested page does not exist or has been relocated within the emergency grid.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/report"
            className="w-full py-3 rounded-xl bg-status-critical text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">crisis_alert</span>
            <span>Report an Emergency</span>
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center transition-colors"
          >
            Back to Home Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
