'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Incident, Resource, Hospital } from '@/types/incident';

interface LiveIncidentMapProps {
  incidents: Incident[];
  resources?: Resource[];
  hospitals?: Hospital[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
}

export const LiveIncidentMap: React.FC<LiveIncidentMapProps> = ({
  incidents,
  resources = [],
  hospitals = [],
  selectedIncident,
  onSelectIncident,
  center = [12.9716, 77.5946],
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const fallbackLayerRef = useRef<any>(null);
  const baseLayersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'INCIDENTS' | 'FLEET' | 'HOSPITALS'>('ALL');
  const [basemapStyle, setBasemapStyle] = useState<'dark' | 'satellite' | 'streets'>('dark');

  const applyBasemap = (type: 'dark' | 'satellite' | 'streets', map: any, L: any) => {
    if (!map) return;
    // Remove previous base layers cleanly
    baseLayersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch {}
    });
    baseLayersRef.current = [];

    const newLayers: any[] = [];
    if (type === 'dark') {
      // 100% Free, zero-API-key ESRI World Dark Gray Canvas with high-contrast labels
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxNativeZoom: 16,
          maxZoom: 19,
        }
      );
      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 16,
          maxZoom: 19,
        }
      );

      // Resilient fallback to OpenStreetMap with dark invert filter if ArcGIS ever has network hiccups
      base.on('tileerror', () => {
        if (!fallbackLayerRef.current) {
          console.warn('[LiveIncidentMap] Activating backup dark tile provider');
          const fallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
            className: 'dark-tiles-filter',
          });
          fallback.addTo(map);
          fallbackLayerRef.current = fallback;
        }
      });

      base.addTo(map);
      labels.addTo(map);
      newLayers.push(base, labels);
    } else if (type === 'satellite') {
      // High-resolution ESRI satellite imagery with boundaries & places overlay
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
          maxNativeZoom: 18,
          maxZoom: 19,
        }
      );
      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 18,
          maxZoom: 19,
        }
      );
      sat.addTo(map);
      labels.addTo(map);
      newLayers.push(sat, labels);
    } else {
      // Standard clean OpenStreetMap street view
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });
      osm.addTo(map);
      newLayers.push(osm);
    }

    baseLayersRef.current = newLayers;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists on container
      if ((mapContainerRef.current as any)._leaflet_id) {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch {}
          mapInstanceRef.current = null;
        }
      }

      if (!mapInstanceRef.current) {
        // Fix Leaflet's default icon paths in webpack/production bundles
        try {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        } catch {}

        const initialCenter = selectedIncident && selectedIncident.latitude && selectedIncident.longitude
          ? [selectedIncident.latitude, selectedIncident.longitude]
          : center;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter as [number, number],
          zoom,
          zoomControl: false,
          trackResize: true,
        });

        // 1. Primary Tile Layer: ESRI Tactical Dark Canvas (100% Free, Zero API Key Required)
        applyBasemap(basemapStyle, map, L);

        L.control.zoom({ position: 'topright' }).addTo(map);
        mapInstanceRef.current = map;
        setMapReady(true);

        // Force viewport recalculation for Next.js production flex/grid layouts
        const invalidate = () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        };

        setTimeout(invalidate, 100);
        setTimeout(invalidate, 300);
        setTimeout(invalidate, 800);

        // Watch container resize events
        if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            invalidate();
          });
          resizeObserver.observe(mapContainerRef.current);
        }
      }
    });

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      baseLayersRef.current = [];
    };
  }, []);

  // Watch basemapStyle changes and switch tiles dynamically
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        applyBasemap(basemapStyle, mapInstanceRef.current, L);
      }
    });
  }, [basemapStyle, mapReady]);

  const lastFlownIncidentIdRef = useRef<string | null>(null);
  const hasInitialFittedRef = useRef<boolean>(false);

  // Update Markers when incidents, resources, or hospitals change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Invalidate size in case parent container size updated
      map.invalidateSize();

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      // 1. Plot Incidents
      if (activeLayer === 'ALL' || activeLayer === 'INCIDENTS') {
        incidents.forEach((inc) => {
          if (!inc.latitude || !inc.longitude) return;

          const isCritical = inc.severity === 'CRITICAL';
          const isHigh = inc.severity === 'HIGH';
          const markerColor = isCritical ? '#D93829' : isHigh ? '#F59E0B' : '#3B82F6';

          const pulseHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group" style="width: 36px; height: 36px;">
              ${
                isCritical
                  ? `<span class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${markerColor};"></span>`
                  : ''
              }
              <div class="relative w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/80" style="background-color: ${markerColor};">
                <span style="font-size: 13px; font-weight: 800;">${inc.type === 'FIRE' ? '🔥' : inc.type === 'ACCIDENT' ? '🚗' : inc.type === 'MEDICAL' ? '🚑' : '⚠️'}</span>
              </div>
              <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-mono font-bold flex items-center justify-center border border-white/20">
                ${inc.report_count || 1}
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: pulseHtml,
            className: 'custom-emergency-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon }).addTo(map);

          const popupContent = `
            <div style="font-family: inherit; min-width: 220px; padding: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 12px; color: #fff;">#${inc.public_id}</span>
                <span style="background: ${markerColor}33; color: ${markerColor}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid ${markerColor}66;">
                  ${inc.severity}
                </span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.3;">
                ${inc.address}
              </div>
              <div style="font-size: 10px; color: #94a3b8; font-family: monospace; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
                <span>Reports: <b>${inc.report_count || 1}</b></span>
                <span>Affected: <b>~${inc.estimated_affected || 1}</b></span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('click', () => {
            onSelectIncident?.(inc);
          });

          markersRef.current[`inc-${inc.id}`] = marker;
        });
      }

      // 2. Plot Resources / Emergency Units
      if (activeLayer === 'ALL' || activeLayer === 'FLEET') {
        resources.forEach((res) => {
          if (!res.latitude || !res.longitude) return;

          const isEnRoute = res.status === 'EN_ROUTE';
          const iconEmoji = res.type === 'AMBULANCE' ? '🚑' : res.type === 'FIRE_UNIT' ? '🚒' : res.type === 'POLICE_UNIT' ? '🚓' : '🚙';

          const resHtml = `
            <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
              <div class="w-7 h-7 rounded-lg ${isEnRoute ? 'bg-purple-600 animate-pulse' : 'bg-emerald-600'} flex items-center justify-center text-white shadow-lg border border-white/40">
                <span style="font-size: 13px;">${iconEmoji}</span>
              </div>
            </div>
          `;

          const resIcon = L.divIcon({
            html: resHtml,
            className: 'custom-resource-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([res.latitude, res.longitude], { icon: resIcon }).addTo(map);
          marker.bindPopup(`
            <div style="min-width: 180px; padding: 4px;">
              <div style="font-weight: 700; font-size: 12px; color: #fff;">${res.name}</div>
              <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">${res.type} • ${res.status}</div>
              <div style="font-size: 10px; color: #60a5fa; margin-top: 4px;">${res.organization}</div>
            </div>
          `);
          markersRef.current[`res-${res.id}`] = marker;
        });
      }

      // 3. Plot Hospitals
      if (activeLayer === 'ALL' || activeLayer === 'HOSPITALS') {
        hospitals.forEach((hosp) => {
          if (!hosp.latitude || !hosp.longitude) return;

          const hospHtml = `
            <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
              <div class="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white shadow-lg border-2 border-white/60">
                <span style="font-size: 12px; font-weight: 900;">🏥</span>
              </div>
              <div class="absolute -bottom-1 px-1 rounded bg-black/80 text-[8px] text-emerald-400 font-mono font-bold">
                ${hosp.available_capacity} beds
              </div>
            </div>
          `;

          const hospIcon = L.divIcon({
            html: hospHtml,
            className: 'custom-hospital-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([hosp.latitude, hosp.longitude], { icon: hospIcon }).addTo(map);
          marker.bindPopup(`
            <div style="min-width: 200px; padding: 4px;">
              <div style="font-weight: 700; font-size: 12px; color: #fff;">${hosp.name}</div>
              <div style="font-size: 10px; color: #10b981; font-weight: bold; margin-top: 2px;">
                ${hosp.available_capacity} of ${hosp.emergency_capacity} Emergency Beds Free
              </div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${hosp.address}</div>
            </div>
          `);
          markersRef.current[`hosp-${hosp.id}`] = marker;
        });
      }

      // 4. Smooth Pan only when user selects a different incident
      if (selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
        if (lastFlownIncidentIdRef.current !== selectedIncident.id) {
          lastFlownIncidentIdRef.current = selectedIncident.id;
          map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 15, { duration: 1.0 });
        }
      } else if (!hasInitialFittedRef.current && incidents.length > 0) {
        // Initial fit on page load only
        hasInitialFittedRef.current = true;
        const validIncidents = incidents.filter((i) => i.latitude && i.longitude);
        if (validIncidents.length === 1) {
          map.setView([validIncidents[0].latitude, validIncidents[0].longitude], 14);
        } else if (validIncidents.length > 1) {
          try {
            const bounds = L.latLngBounds(validIncidents.map((i) => [i.latitude, i.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          } catch (e) {}
        }
      }
    });
  }, [mapReady, incidents, resources, hospitals, selectedIncident, activeLayer]);

  const recenterMap = () => {
    if (!mapReady || !mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      map.invalidateSize();
      const validIncidents = incidents.filter((i) => i.latitude && i.longitude);
      if (validIncidents.length > 0) {
        const bounds = L.latLngBounds(validIncidents.map((i) => [i.latitude, i.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else {
        map.setView(center, zoom);
      }
    });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d0f12]">
      {/* Map Container: absolute inset-0 guarantees positive height in all CSS flex/grid contexts */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />

      {/* Layer Filter Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#12151a]/90 backdrop-blur-md border border-white/10 shadow-xl flex-wrap">
        <button
          type="button"
          onClick={() => setActiveLayer('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            activeLayer === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Layers
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('INCIDENTS')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            activeLayer === 'INCIDENTS' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Incidents ({incidents.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('FLEET')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            activeLayer === 'FLEET' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Fleet ({resources.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('HOSPITALS')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            activeLayer === 'HOSPITALS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Hospitals ({hospitals.length})
        </button>

        <button
          type="button"
          onClick={recenterMap}
          className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-white/10 hover:bg-white/20 text-amber-300 transition-colors flex items-center gap-1"
          title="Recenter map on active incidents"
        >
          <span>🎯 Focus View</span>
        </button>
      </div>

      {/* Basemap Style Switcher (Zero-Key ESRI Tactical & OpenStreetMap) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-[#12151a]/90 backdrop-blur-md border border-white/10 shadow-xl">
        <span className="px-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
          Basemap
        </span>
        <button
          type="button"
          onClick={() => setBasemapStyle('dark')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            basemapStyle === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Tactical Dark Canvas (ESRI ArcGIS - Zero API key required)"
        >
          🌑 Dark
        </button>
        <button
          type="button"
          onClick={() => setBasemapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            basemapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Satellite Imagery (ESRI World Imagery - Zero API key required)"
        >
          🛰️ Satellite
        </button>
        <button
          type="button"
          onClick={() => setBasemapStyle('streets')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
            basemapStyle === 'streets' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Street Map (OpenStreetMap - Zero API key required)"
        >
          🗺️ Street
        </button>
      </div>

      {/* Map Legend Bar */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#12151a]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-critical animate-ping"></span>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>En Route</span>
        </div>
      </div>
    </div>
  );
};
