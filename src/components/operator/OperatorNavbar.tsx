'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  User,
} from 'lucide-react';

interface OperatorNavbarProps {
  activeIncidentsCount?: number;
  criticalCount?: number;
  onTriggerDemo?: () => void;
}

export const OperatorNavbar: React.FC<OperatorNavbarProps> = ({
  activeIncidentsCount = 0,
  criticalCount = 0,
  onTriggerDemo,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);

  return (
    <header className="h-16 bg-[#131412] border-b border-white/10 px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-xl">
      {/* Left: Brand & Tactical Indicator */}
      <div className="flex items-center gap-4">
        <Link href="/operator/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-status-critical flex items-center justify-center shadow-md shadow-red-500/20">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">
              ResQ<span className="text-[#f5b72f]">AI</span>
            </span>
            <span className="text-[10px] text-[#A0A19C] font-mono ml-2 uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
              Command v2.4
            </span>
          </div>
        </Link>

        {/* Live System Telemetry Chip */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f201e] border border-white/5 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse"></span>
          <span className="text-[#e4e2df]">REALTIME DISPATCH FEED</span>
        </div>
      </div>

      {/* Center: Live Tactical Stat Badges */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs">
          <span className="w-2 h-2 rounded-full bg-status-critical animate-ping"></span>
          <span className="font-bold text-red-400 font-mono">{criticalCount} Critical</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5b72f]/10 border border-[#f5b72f]/20 text-xs">
          <span className="font-bold text-[#f5b72f] font-mono">{activeIncidentsCount} Active Responses</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Audio Siren Chime Toggle */}
        <button
          type="button"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          title={audioEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Switch to Citizen Reporting Portal */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-status-critical/15 hover:bg-status-critical/25 border border-status-critical/30 text-red-300 text-xs font-bold transition-colors shadow-sm"
        >
          <span>Citizen SOS View</span>
        </Link>

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#f5b72f] flex items-center justify-center text-xs font-bold text-[#20211F] shadow-md">
            SC
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-white leading-tight">Cmdr. Sarah Chen</p>
            <p className="text-[10px] text-[#A0A19C] font-mono">Sector 4 Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
};
