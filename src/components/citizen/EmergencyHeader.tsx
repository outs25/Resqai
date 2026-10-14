'use client';

import React from 'react';
import Link from 'next/link';

interface EmergencyHeaderProps {
  showSOSCall?: boolean;
}

export const EmergencyHeader: React.FC<EmergencyHeaderProps> = ({ showSOSCall = true }) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-surface-container">
      <div className="max-w-2xl mx-auto h-16 px-gutter flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-space-sm group">
          <div className="w-9 h-9 rounded-full bg-status-critical flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-surface font-bold text-[20px]">
              e911_emergency
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                ResQ<span className="text-primary font-bold">AI</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse"></span>
            </div>
            <span className="font-caption text-caption text-text-citizen-muted">
              Zero-login Emergency Portal
            </span>
          </div>
        </Link>

        {/* Right CTA */}
        <div className="flex items-center gap-space-xs">
          {showSOSCall && (
            <a
              href="tel:112"
              className="min-h-[44px] px-space-sm flex items-center justify-center rounded-full bg-status-critical-soft text-status-critical font-label-md text-label-md gap-1 active:scale-95 transition-transform shadow-sm hover:bg-status-critical-soft/80"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span className="font-semibold">SOS (112)</span>
            </a>
          )}
          <Link
            href="/operator/dashboard"
            className="w-8 h-8 rounded-full bg-primary hover:bg-primary-container flex items-center justify-center transition-colors shadow-sm"
            title="Operator Command Center"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
