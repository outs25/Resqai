'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EmergencyHeader } from '@/components/citizen/EmergencyHeader';
import { BottomNavigation } from '@/components/citizen/BottomNavigation';

export default function CitizenLandingPage() {
  const router = useRouter();
  const [trackId, setTrackId] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      router.push(`/track?id=${encodeURIComponent(trackId.trim().toUpperCase())}`);
    }
  };

  const CATEGORIES = [
    { label: 'Fire', icon: 'local_fire_department', color: 'text-status-critical', bg: 'bg-status-critical-soft' },
    { label: 'Accident', icon: 'car_crash', color: 'text-status-high', bg: 'bg-status-high-soft' },
    { label: 'Medical', icon: 'cardiology', color: 'text-status-critical', bg: 'bg-status-critical-soft' },
    { label: 'Flood', icon: 'flood', color: 'text-primary', bg: 'bg-primary-fixed' },
    { label: 'Damage', icon: 'domain_disabled', color: 'text-tertiary', bg: 'bg-tertiary-fixed' },
    { label: 'Other', icon: 'warning', color: 'text-secondary', bg: 'bg-secondary-fixed' },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <EmergencyHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-gutter pt-20 pb-28 max-w-xl mx-auto w-full text-center space-y-space-md">
        {/* Live Grid Status Badge */}
        <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-status-operational-soft text-status-operational font-label-sm text-label-sm font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-status-operational animate-ping"></span>
          <span>112 EMERGENCY GRID ACTIVE • ZERO LOGIN</span>
        </div>

        {/* Hero Title & Subtext */}
        <div className="space-y-space-xs">
          <h1 className="font-headline-xl text-3xl sm:text-4xl font-bold tracking-tight text-on-surface leading-tight">
            Report an <span className="text-status-critical">Emergency</span>
          </h1>
          <p className="font-body-md text-body-md text-text-citizen-muted max-w-md mx-auto">
            Zero registration required. Instant encrypted telemetry connects you directly to primary dispatch units.
          </p>
        </div>

        {/* Primary Giant Call-To-Action Button */}
        <div className="w-full max-w-md pt-space-xs">
          <Link
            href="/report"
            className="group relative w-full min-h-[64px] py-space-sm px-space-md rounded-xl bg-status-critical hover:bg-status-critical/90 text-white font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm shadow-xl active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[28px] animate-pulse">crisis_alert</span>
            <span className="tracking-wide">REPORT EMERGENCY NOW</span>
            <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
          <p className="font-caption text-caption text-text-citizen-muted mt-2">
            100% Anonymous • 3-Tap Direct Dispatch • Satellite Telemetry
          </p>
        </div>

        {/* Quick Emergency Category Highlights */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-md pt-space-xs">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href="/report"
              className="p-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-surface-container flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-sm group"
            >
              <div className={`w-8 h-8 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
              </div>
              <span className="font-label-sm text-[11px] font-semibold text-on-surface">{cat.label}</span>
            </Link>
          ))}
        </div>

        {/* Track Existing Report Card */}
        <div className="w-full max-w-md bg-surface-container-high border border-surface-container rounded-xl p-space-md text-left shadow-md space-y-space-sm">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">search</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Track an Existing Report
            </span>
          </div>

          <form onSubmit={handleTrackSubmit} className="flex gap-2">
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Enter Report ID (e.g. RQ-8921)"
              className="flex-1 bg-surface-container-lowest border border-surface-container rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-text-citizen-muted font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-sm text-label-sm font-semibold shrink-0 active:scale-95 transition-all shadow-sm"
            >
              Track
            </button>
          </form>
        </div>

        {/* Reassurance Footer */}
        <div className="pt-space-xs text-center font-caption text-caption text-text-citizen-muted space-y-1">
          <p>
            Immediate life-threatening danger? Call emergency line:{' '}
            <a href="tel:112" className="text-status-critical font-bold underline underline-offset-2">
              112
            </a>
          </p>
          <p className="text-[10px]">
            Bengaluru Emergency Command • Tactical Calm Human-in-the-Loop Grid
          </p>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation />
    </div>
  );
}
