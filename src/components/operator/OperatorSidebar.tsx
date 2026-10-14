'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Building,
  BarChart3,
  History,
  ShieldAlert,
  Sparkles,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const OperatorSidebar: React.FC = () => {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: 'Command Hub',
      href: '/operator/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Fleet & Units',
      href: '/operator/resources',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      label: 'Analytics & AI Insights',
      href: '/operator/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: 'Audit & Archives',
      href: '/operator/history',
      icon: <History className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#12151a] border-r border-white/10 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Sections */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold mb-2">
            Operations
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/operator/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* AI System Badge Box */}
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Triage Pipeline</span>
          </div>
          <p className="text-[11px] text-purple-200/80 leading-relaxed">
            Autonomous clustering, multi-factor scoring & resource recommendations active. Human operator in the loop.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-purple-400">
            <span>Model: GPT-4o / Heuristic</span>
            <span className="text-emerald-400 font-bold">READY</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <div className="px-2 text-[10px] text-slate-500 font-mono">
          <p>Sector: Central Grid 112</p>
          <p>Latency: 24ms • Encryption: TLS 1.3</p>
        </div>
      </div>
    </aside>
  );
};
