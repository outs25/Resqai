'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SubmissionModalProps {
  isOpen: boolean;
  stage: 'SUBMITTING' | 'ANALYZING' | 'CLUSTERING' | 'SUCCESS';
  reportData: {
    report_id: string;
    public_id?: string;
    incident_id?: string;
    emergency_type: string;
    address: string;
    is_clustered?: boolean;
    cluster_reasons?: string[];
  } | null;
  onClose: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  stage,
  reportData,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (reportData?.report_id) {
      navigator.clipboard.writeText(reportData.report_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-lowest border border-surface-container rounded-2xl p-6 shadow-2xl space-y-6 text-center">
        {/* Pipeline Transmitting Stages */}
        {stage !== 'SUCCESS' ? (
          <div className="py-6 space-y-6">
            {/* Pulsing Radar Ring */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-status-critical/15 animate-ping"></span>
              <span className="absolute -inset-2 rounded-full border border-status-critical/30 animate-spin"></span>
              <div className="w-16 h-16 rounded-full bg-status-critical flex items-center justify-center shadow-lg shadow-red-500/30">
                <span className="material-symbols-outlined text-[32px] text-white animate-pulse">
                  crisis_alert
                </span>
              </div>
            </div>

            {/* Dynamic Stage Text */}
            <div className="space-y-1.5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {stage === 'SUBMITTING' && 'Transmitting Encrypted Signal...'}
                {stage === 'ANALYZING' && 'AI Classifying Severity & Triage...'}
                {stage === 'CLUSTERING' && 'Correlating Nearby Incidents & Radar...'}
              </h3>
              <p className="font-body-sm text-body-sm text-text-citizen-muted">
                Connecting directly to Bengaluru Emergency Control (112 Grid)
              </p>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stage === 'SUBMITTING' ? 'bg-status-critical w-6' : 'bg-status-operational'
                }`}
              />
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stage === 'ANALYZING'
                    ? 'bg-ai-recommendation w-6'
                    : stage === 'CLUSTERING'
                    ? 'bg-status-operational'
                    : 'bg-surface-container-highest'
                }`}
              />
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stage === 'CLUSTERING' ? 'bg-primary-container w-6' : 'bg-surface-container-highest'
                }`}
              />
            </div>
          </div>
        ) : (
          /* SUCCESS STAGE */
          <div className="space-y-5 animate-scaleUp">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-status-operational-soft text-status-operational flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[36px] font-bold">
                check_circle
              </span>
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-operational-soft text-status-operational font-label-sm text-label-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-status-operational animate-ping"></span>
                DISPATCH ACKNOWLEDGED
              </span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight pt-1">
                Emergency Signal Confirmed
              </h3>
              <p className="font-body-sm text-body-sm text-text-citizen-muted">
                First responder dispatch units have registered your telemetry.
              </p>
            </div>

            {/* Report Reference Card */}
            <div className="bg-surface-container-low border border-surface-container rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
                  Emergency Reference ID
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline font-medium"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-surface-container-lowest px-3.5 py-2.5 rounded-lg border border-surface-container">
                <span className="text-xl font-mono font-bold text-primary tracking-wider">
                  {reportData?.report_id || 'RQ-8921'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container text-white font-mono font-semibold">
                  Zero-Login ID
                </span>
              </div>

              <div className="flex items-start gap-2 pt-1 text-xs text-on-surface">
                <span className="material-symbols-outlined text-status-critical text-[16px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="line-clamp-2 font-medium">
                  {reportData?.address}
                </span>
              </div>

              {/* Clustering Notification Banner */}
              {reportData?.is_clustered && (
                <div className="p-2.5 rounded-lg bg-ai-recommendation-soft/30 border border-ai-recommendation/20 text-xs text-on-surface flex items-start gap-2">
                  <span className="material-symbols-outlined text-ai-recommendation text-[18px] shrink-0 mt-0.5">
                    auto_awesome
                  </span>
                  <div>
                    <span className="font-bold block text-ai-recommendation">AI Incident Cluster Active</span>
                    <span className="text-on-surface-variant text-[11px]">
                      Correlated with ongoing Incident #{reportData.public_id}. Emergency teams are already mobilizing to this sector.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link
                href={`/track?id=${reportData?.report_id || ''}`}
                className="w-full min-h-[48px] px-4 rounded-xl bg-primary text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <span>Track Live Response Status</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <Link
                href="/operator/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Operator Command Grid (Demo)</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
