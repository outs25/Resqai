'use client';

import React from 'react';
import { IncidentTimeline } from '@/types/incident';
import {
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface IncidentTimelineViewProps {
  timeline: IncidentTimeline[];
}

export const IncidentTimelineView: React.FC<IncidentTimelineViewProps> = ({ timeline }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'REPORT_RECEIVED':
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      case 'AI_ANALYSIS_COMPLETED':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'INCIDENT_CLUSTERED':
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      case 'SEVERITY_ESCALATED':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'RESPONSE_APPROVED':
      case 'RESOURCE_ASSIGNED':
      case 'RESPONDER_EN_ROUTE':
        return <Truck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'INCIDENT_RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Live Operational Timeline ({timeline.length} Events)
        </h4>
        <span className="text-[10px] font-mono text-slate-500">AUDIT VERIFIED</span>
      </div>

      <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {timeline.map((event) => (
          <div key={event.id} className="relative flex items-start gap-3 group">
            {/* Dot Node */}
            <div className="absolute -left-4 p-1 rounded-full bg-[#181c23] border border-white/20">
              {getEventIcon(event.event_type)}
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#12151a] p-3 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-slate-300">
                  {event.event_type.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-500 font-mono">
                  {formatTimeAgo(event.created_at)}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
              <p className="text-[10px] font-mono text-slate-500">
                Author: <strong className="text-slate-400">{event.created_by}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
