'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OperatorNavbar } from '@/components/operator/OperatorNavbar';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';
import { AIAssessmentCard } from '@/components/operator/AIAssessmentCard';
import { ResourceDispatchModal } from '@/components/operator/ResourceDispatchModal';
import { HospitalRecommendationCard } from '@/components/operator/HospitalRecommendationCard';
import { IncidentTimelineView } from '@/components/operator/IncidentTimelineView';
import { ResolveIncidentModal } from '@/components/operator/ResolveIncidentModal';
import { LiveIncidentMap } from '@/components/operator/LiveIncidentMap';
import { DemoController } from '@/components/operator/DemoController';
import { Incident, Report } from '@/types/incident';
import { getSeverityBadgeColor, getStatusBadgeColor, formatTimeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  ShieldAlert,
  MapPin,
  Clock,
  Users,
  Layers,
  Sparkles,
  Truck,
  Building,
  CheckCircle2,
  AlertOctagon,
  Image,
  Video,
  Volume2,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params?.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showSeverityBreakdown, setShowSeverityBreakdown] = useState(false);

  const fetchIncidentDetail = async () => {
    if (!incidentId) return;
    try {
      const res = await fetch(`/api/incidents/${incidentId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Incident not found');
      setIncident(json.incident);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetail();
  }, [incidentId]);

  // Live event updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (
            payload.type === 'INCIDENT_UPDATED' ||
            payload.type === 'RESOURCE_ASSIGNED' ||
            payload.type === 'TIMELINE_EVENT' ||
            payload.type === 'REPORT_CREATED'
          ) {
            fetchIncidentDetail();
          }
        } catch (err) {}
      };
    } catch (err) {}

    const interval = setInterval(fetchIncidentDetail, 7000);
    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [incidentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading Tactical Incident Dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center p-4">
        <div className="p-6 rounded-3xl bg-[#181c23] border border-red-500/30 text-center space-y-4 max-w-md">
          <AlertOctagon className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Incident Dossier Error</h3>
          <p className="text-xs text-slate-400">{error || 'Incident record not found.'}</p>
          <Link
            href="/operator/dashboard"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
          >
            Return to Command Hub
          </Link>
        </div>
      </div>
    );
  }

  const sevColors = getSeverityBadgeColor(incident.severity);
  const statusColors = getStatusBadgeColor(incident.status);
  const isResolved = incident.status === 'RESOLVED' || incident.status === 'CLOSED';

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col selection:bg-blue-500">
      <OperatorNavbar activeIncidentsCount={1} criticalCount={incident.severity === 'CRITICAL' ? 1 : 0} />

      <div className="flex-1 flex overflow-hidden">
        <OperatorSidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto pb-28">
          {/* Header Back & Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Link
                href="/operator/dashboard"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-wide">
                    Incident #{incident.public_id}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-extrabold border ${sevColors.bg} ${sevColors.text} ${sevColors.border}`}
                  >
                    {incident.severity}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold ${statusColors.bg} ${statusColors.text}`}
                  >
                    {incident.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{incident.address}</span>
                  <span className="text-slate-600">•</span>
                  <span>Reported {formatTimeAgo(incident.created_at)}</span>
                </p>
              </div>
            </div>

            {/* Operator Main Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!isResolved && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-status-critical hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Assign & Dispatch Units</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResolveModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                </>
              )}

              {isResolved && (
                <div className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono font-bold border border-zinc-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RESOLVED at {new Date(incident.resolved_at || incident.updated_at).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#181c23] border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Emergency Category</span>
              <p className="text-sm font-bold text-white">{incident.type}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181c23] border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Correlated Reports</span>
              <p className="text-sm font-bold text-blue-400 font-mono flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{incident.report_count || 1} Citizen Submissions</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181c23] border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Est. People Impacted</span>
              <p className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>~{incident.estimated_affected || 1} Persons</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#181c23] border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Dispatched Units</span>
              <p className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>{incident.assigned_resources?.length || 0} Units Deployed</span>
              </p>
            </div>
          </div>

          {/* Main 2-Column Tactical Dossier Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: AI Assessment, Citizen Reports & Evidence (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* 1. AI Assessment Panel */}
              <AIAssessmentCard
                assessment={incident.ai_assessment || null}
                onApprove={() => alert('AI Assessment confirmed and locked by Commander.')}
              />

              {/* 2. Clustered Citizen Reports & Evidence */}
              <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Correlated Citizen Submissions ({incident.reports?.length || 1})
                  </h4>
                  <span className="text-[10px] font-mono text-purple-400">ZERO-LOGIN TELEMETRY</span>
                </div>

                <div className="space-y-3">
                  {incident.reports?.map((rep, idx) => (
                    <div
                      key={rep.id || idx}
                      className="p-3.5 rounded-xl bg-[#12151a] border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-white">#{rep.report_id}</span>
                        <div className="flex items-center gap-2">
                          {rep.in_danger && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                              DANGER: {rep.people_count || 1} people
                            </span>
                          )}
                          <span className="text-slate-500">{formatTimeAgo(rep.created_at)}</span>
                        </div>
                      </div>

                      <p className="text-slate-300 leading-relaxed">
                        {rep.description || 'No additional text provided.'}
                      </p>

                      {rep.voice_transcript && (
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 italic flex items-start gap-1.5 text-[11px]">
                          <Volume2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>&ldquo;{rep.voice_transcript}&rdquo;</span>
                        </div>
                      )}

                      {/* Evidence attached */}
                      {rep.evidence && rep.evidence.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {rep.evidence.map((ev: any) => (
                            <div key={ev.id} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                              <img src={ev.storage_url} alt="Field evidence" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Hospital Trauma Recommendations */}
              <HospitalRecommendationCard
                incidentLat={incident.latitude}
                incidentLon={incident.longitude}
              />
            </div>

            {/* Right Column: Tactical Map, Assigned Fleet & Live Timeline (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* 1. Interactive Tactical Map */}
              <div className="h-[320px]">
                <LiveIncidentMap
                  incidents={[incident]}
                  resources={incident.assigned_resources || []}
                  selectedIncident={incident}
                />
              </div>

              {/* 2. Currently Assigned Fleet */}
              <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    Assigned Response Units ({incident.assigned_resources?.length || 0})
                  </h4>
                  {!isResolved && (
                    <button
                      type="button"
                      onClick={() => setShowDispatchModal(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      + Add / Modify Units
                    </button>
                  )}
                </div>

                {incident.assigned_resources && incident.assigned_resources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {incident.assigned_resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-[#12151a] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{res.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {res.type.replace('_', ' ')} • {res.organization}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#12151a] border border-white/5 text-center text-xs text-slate-400 space-y-2">
                    <p>No units currently assigned to this incident scene.</p>
                    <button
                      type="button"
                      onClick={() => setShowDispatchModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                    >
                      Open Dispatch Coordinator
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Live Chronological Timeline */}
              <IncidentTimelineView timeline={incident.timeline || []} />
            </div>
          </div>
        </main>
      </div>

      {/* Dispatch Modal */}
      <ResourceDispatchModal
        isOpen={showDispatchModal}
        incident={incident}
        onClose={() => setShowDispatchModal(false)}
        onDispatchSuccess={() => fetchIncidentDetail()}
      />

      {/* Resolve Modal */}
      <ResolveIncidentModal
        isOpen={showResolveModal}
        incident={incident}
        onClose={() => setShowResolveModal(false)}
        onResolveSuccess={() => fetchIncidentDetail()}
      />

      {/* Demo Controller */}
      <DemoController onRefresh={fetchIncidentDetail} />
    </div>
  );
}
