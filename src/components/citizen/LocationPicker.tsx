'use client';

import React, { useState, useEffect, useRef } from 'react';
import { reverseGeocode } from '@/lib/geo';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onLocationChange: (lat: number, lon: number, addr: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState(address || '');
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<any>(null);
  const miniMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const requestGeolocation = () => {
    setLoading(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported. Please type your location.');
      setLoading(false);
      setManualMode(true);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    let samplesCount = 0;
    const maxSamples = 3;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        samplesCount++;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 10);
        setAccuracyMeters(acc);

        if (acc <= 15 || samplesCount >= maxSamples) {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setLoading(false);
        }

        try {
          const readable = await reverseGeocode(lat, lon);
          if (!manualAddressInput || manualAddressInput === address) {
            onLocationChange(lat, lon, readable);
            setManualAddressInput(readable);
          } else {
            onLocationChange(lat, lon, manualAddressInput);
          }
        } catch (e) {
          const fallbackAddr = `GPS Zone (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          if (!manualAddressInput) {
            onLocationChange(lat, lon, fallbackAddr);
            setManualAddressInput(fallbackAddr);
          }
        }
      },
      (err) => {
        console.warn('Geolocation notice:', err.message);
        setLoading(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (!address && !manualAddressInput) {
          const defaultLat = 12.9716;
          const defaultLon = 77.5946;
          const defaultAddress = 'Bengaluru Central District (112 Grid)';
          onLocationChange(defaultLat, defaultLon, defaultAddress);
          setManualAddressInput(defaultAddress);
          setErrorMsg('GPS prompt dismissed. Using grid sector; adjust landmark below if needed.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!latitude || !longitude) {
      requestGeolocation();
    }
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Sync Leaflet map when interactive preview is opened
  useEffect(() => {
    if (!showInteractiveMap || !miniMapContainerRef.current) return;

    const currentLat = latitude || 12.9716;
    const currentLon = longitude || 77.5946;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !miniMapContainerRef.current) return;

      if (!miniMapInstanceRef.current) {
        const map = L.map(miniMapContainerRef.current, {
          center: [currentLat, currentLon],
          zoom: 15,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-emergency-pin',
          html: `
            <div style="background-color: #D93829; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <span class="material-symbols-outlined" style="font-size: 16px;">near_me</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([currentLat, currentLon], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          const newLat = pos.lat;
          const newLon = pos.lng;
          try {
            const readable = await reverseGeocode(newLat, newLon);
            onLocationChange(newLat, newLon, readable);
            setManualAddressInput(readable);
          } catch {
            onLocationChange(newLat, newLon, `Pin (${newLat.toFixed(4)}, ${newLon.toFixed(4)})`);
          }
        });

        miniMapInstanceRef.current = map;
        miniMarkerRef.current = marker;

        setTimeout(() => {
          if (miniMapInstanceRef.current) {
            miniMapInstanceRef.current.invalidateSize();
          }
        }, 150);
      } else {
        miniMapInstanceRef.current.setView([currentLat, currentLon], 15);
        miniMapInstanceRef.current.invalidateSize();
        if (miniMarkerRef.current) {
          miniMarkerRef.current.setLatLng([currentLat, currentLon]);
        }
      }
    });

    return () => {
      isMounted = false;
      if (miniMapInstanceRef.current) {
        try {
          miniMapInstanceRef.current.remove();
        } catch {}
        miniMapInstanceRef.current = null;
      }
    };
  }, [showInteractiveMap, latitude, longitude]);

  return (
    <div className="bg-surface-container-high rounded-xl p-space-md shadow-md space-y-space-sm">
      <div className="flex items-center justify-between">
        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
          Incident Location
        </label>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
              <span className="material-symbols-outlined text-[14px] animate-spin">
                sync
              </span>
              Locking GPS...
            </span>
          ) : accuracyMeters ? (
            <span className="font-caption text-[11px] text-status-operational font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-operational animate-pulse"></span>
              GPS ±{accuracyMeters}m
            </span>
          ) : (
            <button
              type="button"
              onClick={requestGeolocation}
              className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              Detect GPS
            </button>
          )}
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-sm space-y-2 border border-surface-container">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-status-critical-soft text-status-critical flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">pin_drop</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm font-semibold text-on-surface line-clamp-2">
                {address || manualAddressInput || 'Detecting satellite telemetry...'}
              </p>
              {latitude && longitude && (
                <p className="font-caption text-[11px] text-text-citizen-muted font-mono mt-0.5">
                  {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="px-2 py-1 rounded-lg bg-surface-container text-on-surface font-caption text-caption hover:bg-surface-variant transition-colors shrink-0 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>{manualMode ? 'Done' : 'Edit'}</span>
          </button>
        </div>

        {/* Manual Address Input */}
        {manualMode && (
          <div className="pt-1 space-y-1">
            <input
              type="text"
              value={manualAddressInput}
              onChange={(e) => {
                setManualAddressInput(e.target.value);
                onLocationChange(latitude || 12.9716, longitude || 77.5946, e.target.value);
              }}
              placeholder="Enter building name, intersection, or landmark"
              className="w-full bg-surface-container text-on-surface placeholder:text-text-citizen-muted font-body-sm text-body-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
            />
            <p className="font-caption text-[10px] text-text-citizen-muted">
              Add landmark or floor (e.g. Near Gate 3, 2nd Floor)
            </p>
          </div>
        )}

        {/* Map Preview Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-container">
          <button
            type="button"
            onClick={() => setShowInteractiveMap(!showInteractiveMap)}
            className="text-primary font-label-sm text-[11px] font-semibold flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>{showInteractiveMap ? 'Hide Map Preview' : 'Show Pin on Map'}</span>
          </button>
          <span className="font-caption text-[10px] text-text-citizen-muted">
            Drag pin to adjust
          </span>
        </div>

        {/* Interactive Leaflet Mini-Map */}
        {showInteractiveMap && (
          <div className="w-full h-44 rounded-lg overflow-hidden border border-surface-container-highest mt-2 relative light-map">
            <div ref={miniMapContainerRef} className="w-full h-full" />
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="font-caption text-caption text-error bg-error-container/40 p-2 rounded-lg">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
