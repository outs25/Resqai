'use client';

import React, { useState, useEffect } from 'react';
import { Incident, Resource, ResourceType } from '@/types/incident';
import {
  Truck,
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Car,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

interface ResourceDispatchModalProps {
  isOpen: boolean;
  incident: Incident;
  onClose: () => void;
  onDispatchSuccess: (assignedUnits: string[]) => void;
}

export const ResourceDispatchModal: React.FC<ResourceDispatchModalProps> = ({
  isOpen,
  incident,
  onClose,
  onDispatchSuccess,
}) => {
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCandidateResources = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/resources?lat=${incident.latitude}&lon=${incident.longitude}`
        );
        const json = await res.json();
        if (json.resources) {
          setResources(json.resources);

          // Auto-select AI recommended units
          const recommendedTypes: ResourceType[] =
            incident.ai_assessment?.recommended_resources || ['AMBULANCE', 'FIRE_UNIT'];

          const autoSelected: string[] = [];
          for (const reqType of recommendedTypes) {
            const match = json.resources.find(
              (r: any) => r.type === reqType && r.status === 'AVAILABLE'
            );
            if (match && !autoSelected.includes(match.id)) {
              autoSelected.push(match.id);
            }
          }
          setSelectedResourceIds(autoSelected);
        }
      } catch (err) {
        console.error('Error fetching candidate units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateResources();
  }, [isOpen, incident]);

  if (!isOpen) return null;

  const toggleResource = (id: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleConfirmDispatch = async () => {
    if (selectedResourceIds.length === 0) return;
    setDispatching(true);

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          resourceIds: selectedResourceIds,
          operatorName: 'Cmdr. Sarah Chen',
          operatorId: 'op-001',
        }),
      });

      if (!res.ok) {
        throw new Error('Dispatch failed');
      }

      onDispatchSuccess(selectedResourceIds);
      setShowConfirmModal(false);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch resources');
    } finally {
      setDispatching(false);
    }
  };

  const selectedUnits = resources.filter((r) => selectedResourceIds.includes(r.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#181c23] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 text-left max-h-[90vh] flex flex-col justify-between">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Resource Coordination & Dispatch
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Incident #{incident.public_id} • {incident.type} • {incident.address}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Units List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">
              Available Fleet ({resources.filter((r) => r.status === 'AVAILABLE').length} Units Free)
            </span>
            <span className="text-[11px] text-blue-400 font-mono">
              {selectedResourceIds.length} Selected
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Querying live GPS fleet telemetry & ETA vectors...
            </div>
          ) : (
            resources.map((res) => {
              const isSelected = selectedResourceIds.includes(res.id);
              const isAvailable = res.status === 'AVAILABLE';
              const isRecommended = incident.ai_assessment?.recommended_resources?.includes(res.type);

              return (
                <div
                  key={res.id}
                  onClick={() => isAvailable && toggleResource(res.id)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    !isAvailable
                      ? 'opacity-40 bg-[#12151a] border-white/5 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/50 cursor-pointer'
                      : 'bg-[#12151a] hover:bg-[#1a1e26] border-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isAvailable}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{res.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                            {res.type.replace('_', ' ')}
                          </span>
                          {isRecommended && isAvailable && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <Sparkles className="w-2.5 h-2.5" /> AI Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{res.organization}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <p className="font-bold text-emerald-400">{res.calculated_eta || 4} min ETA</p>
                      <p className="text-[10px] text-slate-400">{res.distance_km || 1.8} km away</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom CTA */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            <span>{selectedUnits.length} Unit(s) ready to deploy</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedResourceIds.length === 0}
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 rounded-xl bg-status-critical hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/30 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Review & Confirm Dispatch</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-scaleUp">
            <div className="w-full max-w-md bg-[#181c23] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-status-critical flex items-center justify-center mx-auto border border-red-500/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">
                  Confirm Emergency Response Dispatch
                </h4>
                <p className="text-xs text-slate-400">
                  Target: Incident #{incident.public_id} ({incident.address})
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12151a] border border-white/10 text-left space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Units Mobilizing:
                </span>
                <ul className="space-y-1 text-xs text-slate-200">
                  {selectedUnits.map((u) => (
                    <li key={u.id} className="flex items-center justify-between font-mono">
                      <span>• {u.name} ({u.type.replace('_', ' ')})</span>
                      <span className="text-emerald-400 font-bold">{u.calculated_eta || 4}m ETA</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={dispatching}
                  onClick={handleConfirmDispatch}
                  className="flex-1 py-2.5 rounded-xl bg-status-critical hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/30 flex items-center justify-center gap-1.5"
                >
                  {dispatching ? 'Mobilizing...' : 'CONFIRM DISPATCH'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
