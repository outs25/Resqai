'use client';

import React from 'react';
import { EmergencyType } from '@/types/incident';

interface EmergencyTypeSelectorProps {
  selectedType: EmergencyType;
  onSelect: (type: EmergencyType) => void;
}

interface TypeOption {
  id: EmergencyType;
  label: string;
  sublabel: string;
  icon: string;
  badgeBg: string;
}

const EMERGENCY_OPTIONS: TypeOption[] = [
  {
    id: 'FIRE',
    label: 'Fire Emergency',
    sublabel: 'Smoke, flames, chemical',
    icon: 'local_fire_department',
    badgeBg: 'bg-status-critical',
  },
  {
    id: 'ACCIDENT',
    label: 'Road Accident',
    sublabel: 'Collision, rollover, trapped',
    icon: 'car_crash',
    badgeBg: 'bg-status-high',
  },
  {
    id: 'MEDICAL',
    label: 'Medical Crisis',
    sublabel: 'Cardiac, breathing, trauma',
    icon: 'cardiology',
    badgeBg: 'bg-status-critical',
  },
  {
    id: 'FLOOD',
    label: 'Flood / Water',
    sublabel: 'Rising water, submerged',
    icon: 'flood',
    badgeBg: 'bg-primary',
  },
  {
    id: 'BUILDING_DAMAGE',
    label: 'Structural Collapse',
    sublabel: 'Debris, gas leak, tremor',
    icon: 'domain_disabled',
    badgeBg: 'bg-tertiary',
  },
  {
    id: 'OTHER',
    label: 'Other Danger',
    sublabel: 'Hazard, security crisis',
    icon: 'warning',
    badgeBg: 'bg-secondary',
  },
];

export const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  return (
    <div className="bg-surface-container-high rounded-xl p-space-md shadow-md space-y-space-sm">
      <div className="flex items-center justify-between">
        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">category</span>
          Emergency Category
        </label>
        <span className="font-caption text-caption text-error font-medium">Required</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EMERGENCY_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all active:scale-95 ${
                isSelected
                  ? 'bg-surface-container-lowest border-primary shadow-md ring-2 ring-primary/20'
                  : 'bg-surface-container-lowest hover:bg-surface-bright border-surface-container text-on-surface'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-transform ${
                  isSelected
                    ? `${opt.badgeBg} text-white scale-105 shadow-sm`
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
              </div>

              {/* Label */}
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {opt.label}
              </span>
              <span className="font-caption text-[10px] text-text-citizen-muted mt-0.5 line-clamp-1">
                {opt.sublabel}
              </span>

              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
