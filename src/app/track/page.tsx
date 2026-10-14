'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmergencyHeader } from '@/components/citizen/EmergencyHeader';
import { BottomNavigation } from '@/components/citizen/BottomNavigation';

function CitizenTrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReportStatus = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(id.trim().toUpperCase())}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Report not found');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve report. Please verify the ID.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchReportStatus(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/track?id=${encodeURIComponent(searchId.trim().toUpperCase())}`);
      fetchReportStatus(searchId);
    }
  };

  const getSafetyTips = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'FIRE':
        return [
          'Stay low under smoke to avoid inhaling toxic gases.',
          'Check closed doors with the back of your hand before opening.',
          'Never use elevators during a structural fire.',
          'If clothes catch fire: Stop, Drop, and Roll.',
        ];
      case 'MEDICAL':
        return [
          'Keep the patient calm and still unless in immediate physical danger.',
          'If unresponsive and not breathing normally, begin continuous chest compressions.',
          'Do not administer oral fluids to an unconscious person.',
          'Clear a safe pathway for arriving paramedics.',
        ];
      case 'ACCIDENT':
        return [
          'Turn off vehicle ignitions if safely accessible.',
          'Do not move severely injured victims unless immediate fire risk exists.',
          'Set hazard warning markers safely away from the roadway.',
          'Keep bystanders clear of active traffic.',
        ];
      case 'FLOOD':
        return [
          'Move to the highest structural level; do not shelter in closed attics without roof exits.',
          'Never attempt to walk or drive through moving flood waters.',
          'Avoid touching electrical equipment or downed power lines.',
        ];
      default:
        return [
          'Stay in a safe, visible location for arriving first responders.',
          'Keep your phone line open for emergency coordination.',
          'Avoid taking unnecessary risks.',
        ];
    }
  };

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-gutter pt-20 pb-28 space-y-space-md">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between pt-space-xs">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Home</span>
        </button>
        <span className="font-caption text-caption text-primary font-mono font-semibold">
          Live Tracking Uplink
        </span>
      </div>

      {/* Search Bar Card */}
      <div className="bg-surface-container-high border border-surface-container rounded-xl p-space-md shadow-md space-y-space-xs">
        <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">track_changes</span>
          Lookup Emergency Status
        </label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. RQ-8921"
            className="flex-1 bg-surface-container-lowest border border-surface-container rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-sm text-label-sm font-semibold shrink-0 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-start gap-2.5 border border-error/20">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <p className="font-bold">Report Not Found</p>
            <p className="font-caption text-caption mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Report Result Dossier */}
      {data && data.report && (
        <div className="space-y-space-md animate-fadeIn">
          {/* Status Header Banner */}
          <div className="bg-surface-container-high border border-surface-container rounded-xl p-5 shadow-md space-y-space-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-citizen-muted font-semibold uppercase">
                  Report ID
                </span>
                <h3 className="font-headline-md text-2xl font-bold font-mono text-primary tracking-wider">
                  {data.report.report_id}
                </h3>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                    data.incident?.status === 'RESOLVED'
                      ? 'bg-surface-container text-on-surface-variant'
                      : data.incident?.status === 'RESPONDERS_EN_ROUTE' || data.incident?.status === 'ON_SCENE'
                      ? 'bg-status-critical-soft text-status-critical animate-pulse'
                      : 'bg-status-operational-soft text-status-operational'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                  {data.incident?.status?.replace(/_/g, ' ') || 'DISPATCH QUEUED'}
                </span>
              </div>
            </div>

            {/* Location & Details */}
            <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container space-y-2">
              <div className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface">
                <span className="material-symbols-outlined text-status-critical text-[18px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="font-medium">{data.report.address}</span>
              </div>
              <div className="flex items-center gap-4 font-caption text-caption text-text-citizen-muted font-mono pt-1">
                <span>
                  Type: <strong className="text-on-surface">{data.report.emergency_type}</strong>
                </span>
                {data.incident?.report_count && (
                  <span>
                    Cluster Signals: <strong className="text-primary">{data.incident.report_count}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Progress Milestones Tracker */}
            <div className="space-y-3 pt-2">
              <p className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
                Dispatch Lifecycle
              </p>

              <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
                {/* Step 1 */}
                <div className="relative flex items-center gap-3">
                  <span className="absolute -left-4 w-3.5 h-3.5 rounded-full bg-status-operational border-2 border-surface" />
                  <div className="text-xs">
                    <p className="font-bold text-on-surface">1. Report Received & AI Triaged</p>
                    <p className="font-caption text-caption text-text-citizen-muted">
                      Telemetry parsed and assigned priority
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center gap-3">
                  <span
                    className={`absolute -left-4 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                      data.incident ? 'bg-status-operational' : 'bg-surface-container-highest'
                    }`}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-on-surface">2. Operator Verified & Assigned</p>
                    <p className="font-caption text-caption text-text-citizen-muted">
                      Emergency units coordinated by dispatch control
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center gap-3">
                  <span
                    className={`absolute -left-4 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                      data.incident?.has_responders_en_route ? 'bg-status-critical animate-ping' : 'bg-surface-container-highest'
                    }`}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-on-surface">3. Responders En Route / On Scene</p>
                    <p className="font-caption text-caption text-text-citizen-muted">
                      {data.incident?.assigned_resources_count > 0
                        ? `${data.incident.assigned_resources_count} dedicated emergency unit(s) responding to this sector`
                        : 'Units staging for tactical deployment'}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-center gap-3">
                  <span
                    className={`absolute -left-4 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                      data.incident?.status === 'RESOLVED' ? 'bg-status-operational' : 'bg-surface-container-highest'
                    }`}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-on-surface">4. Incident Secured & Resolved</p>
                    <p className="font-caption text-caption text-text-citizen-muted">
                      Scene stabilized and safety restored
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Field Safety Protocol Card */}
          <div className="bg-surface-container-high border border-surface-container rounded-xl p-5 shadow-md space-y-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                health_and_safety
              </span>
              <h4 className="font-title-md text-title-md font-bold text-on-surface">
                Field Safety Protocol ({data.report.emergency_type})
              </h4>
            </div>

            <div className="space-y-2">
              {getSafetyTips(data.report.emergency_type).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-caption text-caption font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CitizenTrackPage() {
  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <EmergencyHeader />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center pt-24">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
              progress_activity
            </span>
          </div>
        }
      >
        <CitizenTrackContent />
      </Suspense>
      <BottomNavigation />
    </div>
  );
}
