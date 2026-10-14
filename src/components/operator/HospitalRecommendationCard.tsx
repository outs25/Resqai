'use client';

import React, { useState, useEffect } from 'react';
import { HospitalWithRecommendation } from '@/services/hospital-service';
import { Building, Sparkles, CheckCircle2, Clock, MapPin, Bed, Navigation } from 'lucide-react';

interface HospitalRecommendationCardProps {
  incidentLat: number;
  incidentLon: number;
}

export const HospitalRecommendationCard: React.FC<HospitalRecommendationCardProps> = ({
  incidentLat,
  incidentLon,
}) => {
  const [hospitals, setHospitals] = useState<HospitalWithRecommendation[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/hospitals?lat=${incidentLat}&lon=${incidentLon}`);
        const json = await res.json();
        if (json.hospitals) {
          setHospitals(json.hospitals);
          const rec = json.hospitals.find((h: any) => h.is_recommended);
          if (rec) setSelectedHospitalId(rec.id);
        }
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [incidentLat, incidentLon]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-[#181c23] border border-white/10 text-xs text-slate-400">
        Loading nearest trauma facilities & surge bed capacities...
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[#181c23] border border-white/10 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Hospital & Trauma Facility Routing
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">LIVE BED TELEMETRY</span>
      </div>

      <div className="space-y-2.5">
        {hospitals.map((hosp) => {
          const isSelected = selectedHospitalId === hosp.id;
          const isFull = hosp.available_capacity === 0;

          return (
            <div
              key={hosp.id}
              onClick={() => !isFull && setSelectedHospitalId(hosp.id)}
              className={`p-3.5 rounded-2xl border transition-all ${
                isFull
                  ? 'opacity-40 bg-[#12151a] border-white/5 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/50 cursor-pointer'
                  : 'bg-[#12151a] hover:bg-[#1a1e26] border-white/10 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{hosp.name}</span>
                    {hosp.is_recommended && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Sparkles className="w-2.5 h-2.5" /> Best Capacity
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{hosp.address}</p>

                  {hosp.is_recommended && hosp.recommendation_reason && (
                    <p className="text-[10px] text-emerald-400/90 mt-1 font-mono">
                      💡 {hosp.recommendation_reason}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 font-mono text-xs">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      hosp.available_capacity > 10
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : hosp.available_capacity > 0
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {hosp.available_capacity} / {hosp.emergency_capacity} Beds Free
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {hosp.eta_minutes} min ({hosp.distance_km} km)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
