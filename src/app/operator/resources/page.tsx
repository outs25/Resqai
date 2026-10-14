'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { OperatorNavbar } from '@/components/operator/OperatorNavbar';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';
import { DemoController } from '@/components/operator/DemoController';
import { Resource } from '@/types/incident';

const LiveIncidentMap = dynamic(
  () => import('@/components/operator/LiveIncidentMap').then((mod) => mod.LiveIncidentMap),
  { ssr: false }
);
import {
  Truck,
  Flame,
  Car,
  HeartPulse,
  Waves,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Plus,
} from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/resources?type=${typeFilter}&status=${statusFilter}`);
      const data = await res.json();
      if (data.resources) setResources(data.resources);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [typeFilter, statusFilter]);

  const filteredResources = resources.filter((r) =>
    searchQuery
      ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.organization.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EN_ROUTE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse';
      case 'ON_SCENE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-zinc-700/50 text-zinc-400 border-zinc-600';
    }
  };

  const handleStatusToggle = async (resourceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      await fetch('/api/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId, status: nextStatus }),
      });
      fetchResources();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col selection:bg-blue-500">
      <OperatorNavbar />

      <div className="flex-1 flex overflow-hidden">
        <OperatorSidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto pb-28">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-400" />
                <span>Emergency Fleet & Unit Management</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live GPS telemetry, status transitions, and active resource coordination.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                {resources.filter((r) => r.status === 'AVAILABLE').length} Units Ready
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                {resources.filter((r) => r.status === 'EN_ROUTE').length} En Route
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#181c23] border border-white/10 shadow-md">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit by name or organization..."
                className="w-full bg-[#12151a] border border-white/10 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 bg-[#12151a] p-1 rounded-xl border border-white/5">
                {['ALL', 'AMBULANCE', 'FIRE_UNIT', 'RESCUE_UNIT', 'POLICE_UNIT'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      typeFilter === t
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#12151a] p-1 rounded-xl border border-white/5">
                {['ALL', 'AVAILABLE', 'EN_ROUTE', 'ON_SCENE'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchResources}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Resources Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-[#181c23] border border-white/10 shadow-lg space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{res.name}</h4>
                    <p className="text-xs text-slate-400">{res.organization}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${getStatusBadge(
                      res.status
                    )}`}
                  >
                    {res.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#12151a] border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Category:</span>
                    <strong className="text-white">{res.type.replace('_', ' ')}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Capacity / Crew:</span>
                    <strong className="text-white">{res.capacity} Personnel</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>GPS Telemetry:</span>
                    <strong className="text-blue-400">
                      {res.latitude.toFixed(4)}, {res.longitude.toFixed(4)}
                    </strong>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {res.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(res.id, res.status)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <DemoController onRefresh={fetchResources} />
    </div>
  );
}
