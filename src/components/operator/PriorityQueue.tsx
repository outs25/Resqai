'use client';

import React from 'react';
import Link from 'next/link';
import { Incident } from '@/types/incident';
import {
  Flame,
  Car,
  HeartPulse,
  Waves,
  Building2,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { formatTimeAgo, getSeverityBadgeColor, getStatusBadgeColor } from '@/lib/utils';

interface PriorityQueueProps {
  incidents: Incident[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (incident: Incident) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FIRE':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'ACCIDENT':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'MEDICAL':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'FLOOD':
        return <Waves className="w-4 h-4 text-blue-400" />;
      case 'BUILDING_DAMAGE':
        return <Building2 className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-critical animate-ping"></span>
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Live Priority Queue ({incidents.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">AI SCORING ENGINE</span>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {incidents.length === 0 ? (
          <div className="p-8 text-center bg-[#181c23]/60 rounded-2xl border border-white/5 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-slate-300">All Sectors Clear</p>
            <p className="text-[11px] text-slate-500">No active priority emergencies pending triage.</p>
          </div>
        ) : (
          incidents.map((incident) => {
            const isSelected = selectedIncidentId === incident.id;
            const sevColors = getSeverityBadgeColor(incident.severity);
            const statusColors = getStatusBadgeColor(incident.status);

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident?.(incident)}
                className={`relative group p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e232d] border-blue-500 shadow-xl ring-1 ring-blue-500/50'
                    : 'bg-[#181c23]/80 hover:bg-[#1c2028] border-white/10'
                }`}
              >
                {/* Top Row: Public ID, Severity, Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                      {getTypeIcon(incident.type)}
                    </div>
                    <span className="font-mono font-bold text-xs text-white">
                      #{incident.public_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Severity Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold border ${sevColors.bg} ${sevColors.text} ${sevColors.border}`}
                    >
                      {incident.severity}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${statusColors.bg} ${statusColors.text}`}
                    >
                      {incident.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <p className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{incident.address}</span>
                </p>

                {/* AI Brief Summary */}
                {incident.ai_summary && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 italic">
                    &ldquo;{incident.ai_summary}&rdquo;
                  </p>
                )}

                {/* Metrics Row: Reports, Affected, Confidence, Time */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-blue-400">
                      <Layers className="w-3 h-3" />
                      <strong>{incident.report_count || 1}</strong> reports
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Users className="w-3 h-3" />
                      <strong>~{incident.estimated_affected || 1}</strong> affected
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Sparkles className="w-3 h-3" />
                      <strong>{(incident.ai_confidence * 100).toFixed(0)}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(incident.created_at)}</span>
                  </div>
                </div>

                {/* Direct Detail Link Button */}
                <div className="mt-3 pt-2 flex items-center justify-end">
                  <Link
                    href={`/operator/incidents/${incident.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Open Tactical Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
