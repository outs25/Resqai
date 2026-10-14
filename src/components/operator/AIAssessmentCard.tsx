'use client';

import React, { useState } from 'react';
import { AIAssessment } from '@/types/incident';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Edit2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { getSeverityBadgeColor } from '@/lib/utils';

interface AIAssessmentCardProps {
  assessment: AIAssessment | null;
  onApprove?: () => void;
  onModify?: (updatedSummary: string) => void;
}

export const AIAssessmentCard: React.FC<AIAssessmentCardProps> = ({
  assessment,
  onApprove,
  onModify,
}) => {
  const [approved, setApproved] = useState(assessment?.human_approved || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(assessment?.summary || '');

  if (!assessment) {
    return (
      <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 text-center text-xs text-slate-400">
        AI assessment triage processing in progress...
      </div>
    );
  }

  const sevColors = getSeverityBadgeColor(assessment.severity);

  const handleApproveClick = () => {
    setApproved(true);
    onApprove?.();
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    onModify?.(editedSummary);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#181c23] border border-purple-500/30 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Subtle AI Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner: Clearly marked human-in-the-loop */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-extrabold text-purple-300 uppercase tracking-wider">
              AI Triage Recommendation
            </h4>
            <span className="text-[10px] text-amber-400 font-bold font-mono">
              HUMAN REVIEW REQUIRED • NEVER AUTO-DISPATCHED
            </span>
          </div>
        </div>

        {approved ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Review
          </span>
        )}
      </div>

      {/* Key Metric Gauges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Severity */}
        <div className="p-3 rounded-xl bg-[#12151a] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Assessed Severity</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-extrabold border ${sevColors.bg} ${sevColors.text} ${sevColors.border}`}
            >
              {assessment.severity}
            </span>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="p-3 rounded-xl bg-[#12151a] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Confidence</span>
          <p className="text-sm font-bold font-mono text-purple-300">
            {(assessment.confidence * 100).toFixed(0)}%
          </p>
        </div>

        {/* Casualties / Affected */}
        <div className="p-3 rounded-xl bg-[#12151a] border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Est. Casualties</span>
          <p className="text-sm font-bold font-mono text-amber-300 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>~{assessment.affected_estimate} Persons</span>
          </p>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      {assessment.risk_factors && assessment.risk_factors.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Identified Hazard & Risk Factors
          </span>
          <div className="flex flex-wrap gap-1.5">
            {assessment.risk_factors.map((risk, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>{risk}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary Text & Human Edit */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Tactical Situation Summary
          </span>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Modify</span>
            </button>
          )}
        </div>

        {!isEditing ? (
          <p className="text-xs text-slate-300 bg-[#12151a] p-3 rounded-xl border border-white/5 leading-relaxed italic">
            &ldquo;{assessment.summary}&rdquo;
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              rows={3}
              className="w-full bg-[#12151a] border border-blue-500/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Save Modification
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Approval Buttons */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleApproveClick}
          disabled={approved}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
            approved
              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{approved ? 'AI Recommendation Approved' : 'Approve AI Assessment'}</span>
        </button>
      </div>
    </div>
  );
};
