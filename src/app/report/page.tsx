'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmergencyHeader } from '@/components/citizen/EmergencyHeader';
import { OfflineBanner } from '@/components/citizen/OfflineBanner';
import { EmergencyTypeSelector } from '@/components/citizen/EmergencyTypeSelector';
import { LocationPicker } from '@/components/citizen/LocationPicker';
import { DangerCheck } from '@/components/citizen/DangerCheck';
import { EvidenceUploader } from '@/components/citizen/EvidenceUploader';
import { SubmissionModal } from '@/components/citizen/SubmissionModal';
import { BottomNavigation } from '@/components/citizen/BottomNavigation';
import { EmergencyType } from '@/types/incident';

export default function CitizenReportPage() {
  const router = useRouter();

  // Form states
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('ACCIDENT');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [inDanger, setInDanger] = useState<boolean>(true);
  const [peopleCount, setPeopleCount] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([]);
  const [anonymousSessionId, setAnonymousSessionId] = useState<string>('');

  // Submission pipeline modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<
    'SUBMITTING' | 'ANALYZING' | 'CLUSTERING' | 'SUCCESS'
  >('SUBMITTING');
  const [submittedReportData, setSubmittedReportData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize anonymous session
  useEffect(() => {
    let sess = localStorage.getItem('resqai_anon_session');
    if (!sess) {
      sess =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `anon-${Date.now()}`;
      localStorage.setItem('resqai_anon_session', sess);
    }
    setAnonymousSessionId(sess);
  }, []);

  const handleLocationChange = (lat: number, lon: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setAddress(addr);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetLat = latitude || 12.9716;
    const targetLon = longitude || 77.5946;
    const targetAddr = address || 'Bengaluru Central Emergency Grid';

    const payload = {
      emergencyType,
      description,
      latitude: targetLat,
      longitude: targetLon,
      address: targetAddr,
      inDanger,
      peopleCount,
      voiceTranscript,
      anonymousSessionId: anonymousSessionId || `anon-${Date.now()}`,
      evidence: evidenceFiles,
    };

    // Offline caching check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const stored = localStorage.getItem('resqai_offline_queue') || '[]';
        const list = JSON.parse(stored);
        list.push(payload);
        localStorage.setItem('resqai_offline_queue', JSON.stringify(list));
        alert(
          'Offline Mode: Your emergency report has been saved locally and will auto-submit the moment network is restored.'
        );
      } catch (err) {}
      return;
    }

    setIsSubmitting(true);
    setSubmissionStage('SUBMITTING');

    try {
      setTimeout(() => setSubmissionStage('ANALYZING'), 600);
      setTimeout(() => setSubmissionStage('CLUSTERING'), 1300);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit emergency report');
      }

      setTimeout(() => {
        setSubmittedReportData({
          report_id: data.report_id,
          public_id: data.public_id,
          incident_id: data.incident_id,
          emergency_type: emergencyType,
          address: targetAddr,
          is_clustered: data.is_clustered,
          cluster_reasons: data.cluster_reasons,
        });
        setSubmissionStage('SUCCESS');
      }, 1900);
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setErrorMessage(
        err.message || 'Error transmitting report. Please try again or dial 112 directly.'
      );
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <EmergencyHeader />
      <OfflineBanner />

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface max-w-2xl mx-auto">
        <form onSubmit={handleSubmitReport} className="flex flex-col w-full px-gutter py-space-sm space-y-space-md">
          {/* Step Progress & AI Triage Micro-Badge */}
          <div className="flex items-center justify-between pt-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-container text-white font-label-sm text-label-sm font-semibold">
                3
              </span>
              <span className="font-label-sm text-label-sm text-primary tracking-wide uppercase font-semibold">
                Step 3 of 3 • Details &amp; Danger
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-ai-recommendation-soft/30 text-ai-recommendation">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span className="font-label-sm text-label-sm font-medium">Telemetry Linked</span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full w-full transition-all duration-500 ease-out"></div>
          </div>

          {/* Header Banner */}
          <div className="space-y-space-xs">
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile font-bold text-on-surface tracking-tight">
              Tell us a little more
            </h2>
            <p className="font-body-sm text-body-sm text-text-citizen-muted">
              All fields are strictly optional. Skip if you need to submit immediately.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-body-sm font-medium border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-error">warning</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Emergency Category */}
          <EmergencyTypeSelector
            selectedType={emergencyType}
            onSelect={(type) => setEmergencyType(type)}
          />

          {/* Step 2: Incident Location */}
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            onLocationChange={handleLocationChange}
          />

          {/* Step 3: Critical Danger Check & Approximate People */}
          <DangerCheck
            inDanger={inDanger}
            peopleCount={peopleCount}
            onDangerChange={setInDanger}
            onPeopleCountChange={setPeopleCount}
          />

          {/* Step 4: Incident Notes & Media Uploader */}
          <EvidenceUploader
            description={description}
            voiceTranscript={voiceTranscript}
            onDescriptionChange={setDescription}
            onVoiceTranscriptChange={setVoiceTranscript}
            evidenceFiles={evidenceFiles}
            onEvidenceFilesChange={setEvidenceFiles}
          />

          {/* Dispatch Reassurance & Signal Quality Micro-Banner */}
          <div className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg bg-surface-container-low text-text-citizen-muted border border-surface-container">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container flex-shrink-0 text-status-operational">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-caption text-caption text-on-surface font-medium truncate">
                Anonymous submission • Zero login required
              </p>
              <p className="font-caption text-[10px] text-text-citizen-muted truncate">
                Dispatched instantly to Bengaluru Emergency Control (112 Grid)
              </p>
            </div>
          </div>

          {/* Primary Bottom CTA Section */}
          <div className="pt-space-xs pb-space-lg space-y-space-sm">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[58px] py-space-sm px-space-md rounded-xl bg-status-critical hover:bg-status-critical/90 text-white font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-70"
              id="submit-report-btn"
            >
              <span className="material-symbols-outlined text-[24px] animate-pulse">crisis_alert</span>
              <span>{isSubmitting ? 'TRANSMITTING SOS...' : 'SEND REPORT NOW'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            {/* Fallback Emergency Call Trigger */}
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-status-operational"></span>
              <span className="font-caption text-caption text-text-citizen-muted">
                Direct line backup available:
              </span>
              <a
                className="font-caption text-caption font-semibold text-primary underline underline-offset-2"
                href="tel:112"
              >
                Call 112 directly
              </a>
            </div>
          </div>
        </form>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Submission Progress & Confirmation Modal */}
      <SubmissionModal
        isOpen={isSubmitting}
        stage={submissionStage}
        reportData={submittedReportData}
        onClose={() => setIsSubmitting(false)}
      />
    </div>
  );
}
