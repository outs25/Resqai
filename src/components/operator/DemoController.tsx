'use client';

import React, { useState } from 'react';
import { PlayCircle, Sparkles, Truck, RotateCcw, Radio } from 'lucide-react';

interface DemoControllerProps {
  onRefresh?: () => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({ onRefresh }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const triggerSimulation = async (scenario: string, label: string) => {
    setLoadingAction(scenario);
    setNotification(null);

    try {
      const res = await fetch('/api/demo/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();

      if (res.ok) {
        setNotification({
          message: data.message || `Scenario ${scenario} triggered!`,
          type: 'success',
        });
        onRefresh?.();
      } else {
        throw new Error(data.error || 'Failed to simulate');
      }
    } catch (err: any) {
      setNotification({
        message: err.message || 'Simulation error',
        type: 'info',
      });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleClearZero = async () => {
    setLoadingAction('CLEAR');
    setNotification(null);

    try {
      const res = await fetch('/api/demo/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      const data = await res.json();
      setNotification({
        message: data.message || 'Database cleared to 0 incidents & reports!',
        type: 'success',
      });
      onRefresh?.();
    } catch (err: any) {
      setNotification({
        message: err.message || 'Error clearing database',
        type: 'info',
      });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleReseed = async () => {
    setLoadingAction('SEED');
    setNotification(null);

    try {
      const res = await fetch('/api/demo/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      setNotification({
        message: data.message || 'Database reseeded with demo scenarios!',
        type: 'success',
      });
      onRefresh?.();
    } catch (err: any) {
      setNotification({
        message: err.message || 'Reseed error',
        type: 'info',
      });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="mb-2 p-3 rounded-2xl bg-[#1f201e]/95 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center justify-between backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#A0A19C] hover:text-white text-xs font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Tactical Simulation Control Bar */}
      <div className="p-2.5 rounded-3xl bg-[#131412]/95 backdrop-blur-xl border border-white/15 shadow-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 pl-2">
          <span className="w-2 h-2 rounded-full bg-[#f5b72f] animate-ping"></span>
          <span className="text-xs font-bold text-[#e4e2df] font-mono hidden sm:inline">
            DEMO SIMULATOR
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Action 1: Single Report */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => triggerSimulation('SINGLE_REPORT', 'Single Incident')}
            className="px-3.5 py-1.5 rounded-full bg-[#f5b72f] hover:bg-amber-400 text-[#20211F] text-xs font-bold font-mono active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>+ 1 Report</span>
          </button>

          {/* Action 2: 3-Report Cluster Burst */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => triggerSimulation('CLUSTER_BURST', 'Cluster Burst')}
            className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            title="Simulates 3 reports in 200m radius to trigger AI auto-clustering & severity escalation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Cluster Burst (3x)</span>
          </button>

          {/* Action 3: Telemetry Move */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => triggerSimulation('DISPATCH_MOVE', 'Advance Vehicle')}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[#e4e2df] text-xs font-semibold font-mono active:scale-95 transition-all flex items-center gap-1"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Move Fleet</span>
          </button>

          {/* Action 4: Clear to 0 */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={handleClearZero}
            className="px-2.5 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 text-xs font-mono font-bold active:scale-95 transition-all flex items-center gap-1"
            title="Wipe database to 0 incidents & reports"
          >
            <span>🗑️ Clear (0)</span>
          </button>

          {/* Action 5: Reseed */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={handleReseed}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Load Sample Demo Incidents"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'SEED' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
