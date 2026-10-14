'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OperatorNavbar } from '@/components/operator/OperatorNavbar';
import { OperatorSidebar } from '@/components/operator/OperatorSidebar';
import { DemoController } from '@/components/operator/DemoController';
import { Incident, AuditLog } from '@/types/incident';
import { History, ShieldCheck, Clock, FileText, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export default function HistoryPage() {
  const [resolvedIncidents, setResolvedIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResolved = async () => {
    try {
      const res = await fetch('/api/incidents?status=RESOLVED');
      const json = await res.json();
      if (json.incidents) setResolvedIncidents(json.incidents);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolved();
  }, []);

  const filtered = resolvedIncidents.filter((i) =>
    search
      ? i.public_id.toLowerCase().includes(search.toLowerCase()) ||
        i.address.toLowerCase().includes(search.toLowerCase()) ||
        i.type.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col selection:bg-blue-500">
      <OperatorNavbar />

      <div className="flex-1 flex overflow-hidden">
        <OperatorSidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto pb-28">
          <div className="pb-2 border-b border-white/10">
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <History className="w-6 h-6 text-blue-400" />
              <span>Resolved Incident Archive & Audit History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical emergency records, post-incident summaries, and operator audit trail.
            </p>
          </div>

          {/* Search */}
          <div className="p-3.5 rounded-2xl bg-[#181c23] border border-white/10 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archived incidents..."
                className="w-full bg-[#12151a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#181c23] border border-white/10 text-center text-xs text-slate-400">
                No resolved incidents matching criteria.
              </div>
            ) : (
              filtered.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-2xl bg-[#181c23] border border-white/10 hover:border-white/20 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">#{inc.public_id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {inc.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> RESOLVED
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200">{inc.address}</p>
                    <p className="text-[11px] text-slate-400 italic">&ldquo;{inc.description}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                    <div className="text-right">
                      <p className="text-slate-400">Reports: <strong>{inc.report_count || 1}</strong></p>
                      <p className="text-[10px] text-slate-500">{formatTimeAgo(inc.created_at)}</p>
                    </div>
                    <Link
                      href={`/operator/incidents/${inc.id}`}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-blue-400 flex items-center gap-1 border border-white/5 transition-colors"
                    >
                      <span>Review Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <DemoController onRefresh={fetchResolved} />
    </div>
  );
}
