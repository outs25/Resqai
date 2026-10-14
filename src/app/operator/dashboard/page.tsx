'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { OperatorNavbar } from '@/components/operator/OperatorNavbar';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';
import { PriorityQueue } from '@/components/operator/PriorityQueue';
import { DemoController } from '@/components/operator/DemoController';
import { Incident, Resource, Hospital } from '@/types/incident';

const LiveIncidentMap = dynamic(
  () => import('@/components/operator/LiveIncidentMap').then((mod) => mod.LiveIncidentMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d0f12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Tactical GIS Telemetry...</span>
        </div>
      </div>
    ),
  }
);
import {
  ShieldAlert,
  Flame,
  Truck,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function OperatorDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ACTIVE_ONLY');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      // Fetch incidents
      const incRes = await fetch(
        `/api/incidents?status=${statusFilter}&severity=${severityFilter}&search=${encodeURIComponent(
          searchQuery
        )}`
      );
      const incData = await incRes.json();
      if (incData.incidents) setIncidents(incData.incidents);

      // Fetch resources
      const resRes = await fetch('/api/resources');
      const resData = await resRes.json();
      if (resData.resources) setResources(resData.resources);

      // Fetch hospitals
      const hospRes = await fetch('/api/hospitals');
      const hospData = await hospRes.json();
      if (hospData.hospitals) setHospitals(hospData.hospitals);
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, severityFilter, searchQuery]);

  // Connect to live SSE event stream for real-time live synchronization
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (
            payload.type === 'INCIDENT_CREATED' ||
            payload.type === 'INCIDENT_UPDATED' ||
            payload.type === 'REPORT_CREATED' ||
            payload.type === 'RESOURCE_ASSIGNED' ||
            payload.type === 'RESOURCE_UPDATED' ||
            payload.type === 'DATABASE_RESEEDED'
          ) {
            fetchData();
          }
        } catch (err) {}
      };
    } catch (err) {
      console.warn('SSE connection unavailable, falling back to interval:', err);
    }

    const interval = setInterval(fetchData, 8000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const activeCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  ).length;

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col selection:bg-blue-500">
      {/* Tactical Navbar */}
      <OperatorNavbar
        activeIncidentsCount={activeCount}
        criticalCount={criticalCount}
        onTriggerDemo={fetchData}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <OperatorSidebar />

        {/* Main Command Workspace */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-4 max-w-[1600px] w-full mx-auto pb-24">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#181c23] border border-red-500/20 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-red-400 font-mono font-bold">
                <span>CRITICAL INCIDENTS</span>
                <ShieldAlert className="w-4 h-4 text-status-critical" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono">{criticalCount}</p>
              <p className="text-[10px] text-slate-400">Requires immediate commander action</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c23] border border-blue-500/20 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-blue-400 font-mono font-bold">
                <span>ACTIVE RESPONSES</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono">{activeCount}</p>
              <p className="text-[10px] text-slate-400">Field response operations underway</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c23] border border-emerald-500/20 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
                <span>AVAILABLE FLEET</span>
                <Truck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono">
                {resources.filter((r) => r.status === 'AVAILABLE').length} / {resources.length}
              </p>
              <p className="text-[10px] text-slate-400">Emergency units ready for dispatch</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c23] border border-purple-500/20 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-purple-400 font-mono font-bold">
                <span>AI CLUSTERING RATE</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono">38% Load Reduced</p>
              <p className="text-[10px] text-slate-400">Multi-reports merged into incidents</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#181c23] border border-white/10 shadow-md">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Public ID, location, or keyword..."
                className="w-full bg-[#12151a] border border-white/10 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 bg-[#12151a] p-1 rounded-xl border border-white/5">
                {['ACTIVE_ONLY', 'ALL', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'ACTIVE_ONLY' ? 'Active Only' : st === 'ALL' ? 'All Statuses' : 'Resolved'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#12151a] p-1 rounded-xl border border-white/5">
                {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      severityFilter === sev
                        ? 'bg-status-critical text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchData}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                title="Refresh Live Telemetry"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main Tactical Split Layout: Left Priority Queue, Right Live Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[580px]">
            {/* Left Col: Priority Queue (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full bg-[#181c23]/60 border border-white/10 rounded-2xl p-4 shadow-xl">
              <PriorityQueue
                incidents={incidents}
                selectedIncidentId={selectedIncident?.id}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            </div>

            {/* Right Col: Live Map (7/8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-[480px]">
              <LiveIncidentMap
                incidents={incidents}
                resources={resources}
                hospitals={hospitals}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Demo Simulation Controller */}
      <DemoController onRefresh={fetchData} />
    </div>
  );
}
