'use client';

import React, { useState, useEffect } from 'react';
import { OperatorNavbar } from '@/components/operator/OperatorNavbar';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';
import { DemoController } from '@/components/operator/DemoController';
import { AnalyticsSummary } from '@/types/incident';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  ShieldAlert,
  Users,
  Truck,
  Activity,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.analytics) setData(json.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const SEVERITY_COLORS = ['#3B82F6', '#EAB308', '#F59E0B', '#D93829'];

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col selection:bg-blue-500">
      <OperatorNavbar />

      <div className="flex-1 flex overflow-hidden">
        <OperatorSidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-28">
          {/* Header */}
          <div className="pb-2 border-b border-white/10">
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <span>Operational Analytics & AI Insights</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive emergency response metrics, clustering efficiency, and automated predictive insights.
            </p>
          </div>

          {/* Key KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#181c23] border border-blue-500/20 shadow-lg space-y-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Total Incidents</span>
              <p className="text-3xl font-extrabold font-mono text-white">{data?.total_incidents || 0}</p>
              <p className="text-[10px] text-slate-400">{data?.total_reports_processed || 0} citizen reports triaged</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c23] border border-purple-500/20 shadow-lg space-y-1">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">AI Clustering Efficiency</span>
              <p className="text-3xl font-extrabold font-mono text-purple-300">
                {data?.clustering_efficiency_pct || 38}%
              </p>
              <p className="text-[10px] text-slate-400">{data?.duplicate_reports_merged || 0} duplicate calls collapsed</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c23] border border-emerald-500/20 shadow-lg space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Avg. Response Time</span>
              <p className="text-3xl font-extrabold font-mono text-emerald-300">5.8 min</p>
              <p className="text-[10px] text-slate-400">Turnout to on-scene arrival</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181c23] border border-amber-500/20 shadow-lg space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Fleet Utilization</span>
              <p className="text-3xl font-extrabold font-mono text-amber-300">
                {data?.resource_utilization_pct || 65}%
              </p>
              <p className="text-[10px] text-slate-400">Active emergency unit workload</p>
            </div>
          </div>

          {/* AI Operational Insights Panel */}
          {data?.ai_insights && data.ai_insights.length > 0 && (
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold tracking-tight uppercase font-mono">
                  AI-Assisted Operational Insights & Recommendations
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.ai_insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#12151a]/80 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row 1: Incidents by Type & Severity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Incidents by Type */}
            <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Incidents by Emergency Category
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.incidents_by_type || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" />
                    <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#181c23', borderColor: '#334155', borderRadius: '0.75rem' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Incidents by Severity */}
            <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Severity Level Distribution
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.incidents_by_severity || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" />
                    <XAxis dataKey="severity" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#181c23', borderColor: '#334155', borderRadius: '0.75rem' }}
                    />
                    <Bar dataKey="count" fill="#D93829" radius={[6, 6, 0, 0]}>
                      {data?.incidents_by_severity?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Peak Hours & Response Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Peak Emergency Volume */}
            <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Peak Hourly Emergency Volume
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.hourly_distribution || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#181c23', borderColor: '#334155', borderRadius: '0.75rem' }} />
                    <Area type="monotone" dataKey="count" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 7-Day Response Trends */}
            <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                7-Day Average Response Time (Minutes)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.response_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#181c23', borderColor: '#334155', borderRadius: '0.75rem' }} />
                    <Line type="monotone" dataKey="avg_response_min" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>

      <DemoController onRefresh={fetchAnalytics} />
    </div>
  );
}
