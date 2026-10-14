'use client';

import React, { useState } from 'react';
import { Incident } from '@/types/incident';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ResolveIncidentModalProps {
  isOpen: boolean;
  incident: Incident;
  onClose: () => void;
  onResolveSuccess: () => void;
}

export const ResolveIncidentModal: React.FC<ResolveIncidentModalProps> = ({
  isOpen,
  incident,
  onClose,
  onResolveSuccess,
}) => {
  const [notes, setNotes] = useState('All active hazards suppressed. Civilian casualties stabilized. Scene secured by field responders.');
  const [resolving, setResolving] = useState(false);

  if (!isOpen) return null;

  const handleConfirmResolve = async () => {
    setResolving(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          operatorName: 'Cmdr. Sarah Chen',
          operatorId: 'op-001',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to resolve incident');
      }

      onResolveSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error marking incident as resolved');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#181c23] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h4 className="text-xl font-bold text-white tracking-tight">
            Mark Incident as Resolved?
          </h4>
          <p className="text-xs text-slate-400">
            Incident #{incident.public_id} • {incident.type} ({incident.address})
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#12151a] border border-white/10 text-left space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Resolution Summary & Scene Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-400 font-mono">
            ⚠️ Resolving will automatically release all assigned emergency units back to AVAILABLE status.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={resolving}
            onClick={handleConfirmResolve}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5"
          >
            {resolving ? 'Resolving...' : 'CONFIRM RESOLUTION'}
          </button>
        </div>
      </div>
    </div>
  );
};
