/**
 * Geographic calculation utilities for ResQAI Emergency Coordination
 */

// Calculate great-circle distance between two points in Kilometers using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 2 decimal precision
}

// Estimate emergency vehicle ETA in minutes based on distance and average urban speed (35 km/h with siren)
export function estimateEmergencyEtaMinutes(distanceKm: number): number {
  const averageSpeedKmH = 35; // Urban emergency response speed
  const baseMinutes = (distanceKm / averageSpeedKmH) * 60;
  const dispatchDelay = 1.5; // Turnout time
  return Math.max(1, Math.round(baseMinutes + dispatchDelay));
}

// Generate realistic intermediate route waypoints between origin and destination
export function generateRouteWaypoints(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  numSteps = 8
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= numSteps; i++) {
    const fraction = i / numSteps;
    // Add subtle realistic road jitter
    const jitterLat = i > 0 && i < numSteps ? (Math.sin(i * 1.5) * 0.001) : 0;
    const jitterLon = i > 0 && i < numSteps ? (Math.cos(i * 1.5) * 0.001) : 0;

    const lat = startLat + (endLat - startLat) * fraction + jitterLat;
    const lon = startLon + (endLon - startLon) * fraction + jitterLon;
    points.push([Number(lat.toFixed(6)), Number(lon.toFixed(6))]);
  }
  return points;
}

// High-Precision Reverse geocoding helper with Mapbox & Nominatim fallback
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  // 1. Try Mapbox High-Precision Geocoding if token is available
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}&types=address,poi,neighborhood,locality&limit=1`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          return data.features[0].place_name || data.features[0].text;
        }
      }
    } catch (e) {
      console.warn('Mapbox reverse geocoding notice:', e);
    }
  }

  // 2. OpenStreetMap Nominatim with Building-level precision (zoom 18)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: { 'User-Agent': 'ResQAI-Emergency-System/1.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(', ').trim();
      }
    }
  } catch (err) {
    // Fallback to coordinates
  }

  // 3. Fallback coordinates format
  return `Sector Location (${lat.toFixed(5)}, ${lon.toFixed(5)})`;
}
