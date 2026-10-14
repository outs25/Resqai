'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const [showFirstAid, setShowFirstAid] = useState(false);

  const FIRST_AID_TIPS = [
    {
      title: 'Bleeding / Hemorrhage',
      icon: 'bloodtype',
      steps: [
        'Apply firm, direct pressure with a clean cloth or sterile dressing.',
        'Do NOT remove soaked dressings; layer additional cloths on top.',
        'Keep the injured limb elevated above heart level if no fracture.',
      ],
    },
    {
      title: 'CPR (Adult)',
      icon: 'cardiology',
      steps: [
        'Check responsiveness and breathing (max 10 seconds).',
        'Place hands centered on chest: push hard and fast (100–120 bpm).',
        'Allow full chest recoil between compressions; do not interrupt.',
      ],
    },
    {
      title: 'Choking',
      icon: 'air',
      steps: [
        'Stand behind victim, wrap arms around waist.',
        'Make a fist just above navel, grasp with other hand.',
        'Deliver quick, upward abdominal thrusts until airway clears.',
      ],
    },
    {
      title: 'Burns & Scalds',
      icon: 'local_fire_department',
      steps: [
        'Cool immediately under running clean water for 20 minutes.',
        'Never apply ice, butter, or ointments to fresh burns.',
        'Cover loosely with sterile plastic cling film or clean dry sheet.',
      ],
    },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface-container-low/95 backdrop-blur-xl border-t border-surface-container-high shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
        aria-label="Citizen bottom navigation"
      >
        <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-space-xs">
          {/* Report Tab */}
          <Link
            href="/report"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] w-16 transition-colors ${
              pathname === '/report'
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">report</span>
            <span className="font-label-sm text-[11px]">Report</span>
          </Link>

          {/* Safety Map Tab */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] w-16 transition-colors ${
              pathname === '/'
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">near_me</span>
            <span className="font-label-sm text-[11px]">Safety Map</span>
          </Link>

          {/* First Aid Guidance Tab */}
          <button
            type="button"
            onClick={() => setShowFirstAid(true)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] w-16 transition-colors ${
              showFirstAid
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
            <span className="font-label-sm text-[11px]">First Aid</span>
          </button>

          {/* My Signal Tab */}
          <Link
            href="/track"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] w-16 transition-colors ${
              pathname.startsWith('/track')
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">track_changes</span>
            <span className="font-label-sm text-[11px]">My Signal</span>
          </Link>
        </div>
      </nav>

      {/* First Aid Quick Guidance Modal */}
      {showFirstAid && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-on-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-md bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl p-space-md shadow-2xl border border-surface-container-high space-y-space-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  health_and_safety
                </span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Emergency First Aid Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFirstAid(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-caption text-caption text-text-citizen-muted">
              Immediate stabilization actions while emergency dispatch units are en route.
            </p>

            <div className="space-y-space-sm">
              {FIRST_AID_TIPS.map((tip) => (
                <div
                  key={tip.title}
                  className="bg-surface-container-low rounded-xl p-space-sm space-y-1.5 border border-surface-container"
                >
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <span className="material-symbols-outlined text-[18px]">{tip.icon}</span>
                    <span>{tip.title}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-on-surface-variant pl-1">
                    {tip.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFirstAid(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold active:scale-95 transition-transform"
            >
              Close Guidance
            </button>
          </div>
        </div>
      )}
    </>
  );
};
