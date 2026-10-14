'use client';

import React from 'react';

interface DangerCheckProps {
  inDanger: boolean;
  peopleCount: number;
  onDangerChange: (inDanger: boolean) => void;
  onPeopleCountChange: (count: number) => void;
}

export const DangerCheck: React.FC<DangerCheckProps> = ({
  inDanger,
  peopleCount,
  onDangerChange,
  onPeopleCountChange,
}) => {
  return (
    <div className="bg-surface-container-high rounded-xl p-space-md shadow-md space-y-space-md">
      {/* Section Header */}
      <div className="flex items-start gap-space-sm">
        <div className="w-8 h-8 rounded-full bg-status-critical-soft flex-shrink-0 flex items-center justify-center text-status-critical">
          <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
        </div>
        <div>
          <h3 className="font-title-md text-title-md text-on-surface font-bold">
            Are you currently in immediate danger?
          </h3>
          <p className="font-body-sm text-body-sm text-text-citizen-muted mt-0.5">
            This prioritizes field triage and initiates satellite rescue ping.
          </p>
        </div>
      </div>

      {/* Toggle Selector Grid */}
      <div className="grid grid-cols-1 gap-space-xs">
        {/* Option 1: YES */}
        <button
          type="button"
          onClick={() => onDangerChange(true)}
          className={`relative flex items-center justify-between p-space-md rounded-xl transition-all text-left active:scale-[0.98] ${
            inDanger
              ? 'bg-status-critical/15 text-on-surface shadow-sm ring-1 ring-status-critical/30'
              : 'bg-surface-container-low text-on-surface opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
              {inDanger && (
                <span className="absolute w-5 h-5 rounded-full bg-status-critical animate-ping opacity-60"></span>
              )}
              <span
                className={`relative w-3.5 h-3.5 rounded-full ${
                  inDanger ? 'bg-status-critical shadow-sm' : 'bg-outline-variant'
                }`}
              ></span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md tracking-wide font-bold text-error uppercase">
                YES — I NEED IMMEDIATE HELP
              </span>
              <span className="font-caption text-caption text-text-citizen-muted truncate">
                Sends tactical ping directly to primary dispatch units
              </span>
            </div>
          </div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0 ${
              inDanger
                ? 'bg-status-critical text-white'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] font-bold">
              {inDanger ? 'check' : 'radio_button_unchecked'}
            </span>
          </div>
        </button>

        {/* Option 2: NO */}
        <button
          type="button"
          onClick={() => onDangerChange(false)}
          className={`relative flex items-center justify-between p-space-md rounded-xl transition-all text-left active:scale-[0.98] ${
            !inDanger
              ? 'bg-status-operational-soft/30 text-on-surface shadow-sm ring-1 ring-status-operational/30'
              : 'bg-surface-container-low text-on-surface opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  !inDanger ? 'bg-status-operational' : 'bg-outline-variant'
                }`}
              ></span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface font-bold">
                NO — Reporting for someone else / Safe distance
              </span>
              <span className="font-caption text-caption text-text-citizen-muted truncate">
                Standard priority dispatch queue
              </span>
            </div>
          </div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0 ${
              !inDanger
                ? 'bg-status-operational text-white'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {!inDanger ? 'check' : 'radio_button_unchecked'}
            </span>
          </div>
        </button>
      </div>

      {/* Conditional Sub-prompt: Number of People (Active when YES is selected) */}
      {inDanger && (
        <div className="bg-surface-container-lowest rounded-xl p-space-sm space-y-space-sm transition-all duration-300 ease-out">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">group</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Approximate people with you
              </span>
            </div>
            <span className="font-caption text-caption text-primary font-medium">
              Helps ambulance capacity
            </span>
          </div>

          {/* Stepper Controls & Display */}
          <div className="flex items-center justify-between bg-surface-container px-space-md py-space-xs rounded-xl">
            <button
              type="button"
              onClick={() => onPeopleCountChange(Math.max(1, peopleCount - 1))}
              className="w-11 h-11 rounded-full bg-surface-bright flex items-center justify-center text-on-surface active:scale-90 active:bg-surface-variant transition-transform shadow-sm"
              aria-label="Decrease people count"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
                {peopleCount >= 5 ? '5+ People' : peopleCount === 1 ? '1 Person' : `${peopleCount} People`}
              </span>
              <span className="font-caption text-caption text-text-citizen-muted">
                Including yourself
              </span>
            </div>
            <button
              type="button"
              onClick={() => onPeopleCountChange(Math.min(10, peopleCount + 1))}
              className="w-11 h-11 rounded-full bg-surface-bright flex items-center justify-center text-on-surface active:scale-90 active:bg-surface-variant transition-transform shadow-sm"
              aria-label="Increase people count"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          {/* Quick Pill Preset Chips */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = num === 5 ? peopleCount >= 5 : peopleCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onPeopleCountChange(num)}
                  className={`pill-chip flex-1 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold active:scale-95 transition-all ${
                    isSelected
                      ? 'bg-primary-container text-white shadow-sm'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {num === 5 ? '5+' : num}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
