import { Incident, Report } from '@/types/incident';
import { calculateDistanceKm } from '@/lib/geo';

export interface ClusterMatchResult {
  isMatch: boolean;
  incident: Incident | null;
  matchScore: number; // 0 to 1
  reasons: string[];
}

// Configurable clustering parameters
export const CLUSTERING_CONFIG = {
  MAX_RADIUS_KM: 1.5, // 1.5 km geographic radius
  MAX_TIME_WINDOW_MINUTES: 45, // 45 minutes recent time window
  MATCH_THRESHOLD: 0.60, // 60% similarity threshold to cluster
};

/**
 * Calculates semantic similarity (Jaccard + keyword token overlap)
 * between report text and incident context
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0.2;

  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 || set2.size === 0) return 0.2;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return intersection / union;
}

/**
 * Evaluates candidate incidents to find duplicate/overlapping reports
 */
export function findClusteredIncident(
  newReport: Report,
  activeIncidents: Incident[]
): ClusterMatchResult {
  let bestIncident: Incident | null = null;
  let highestScore = 0;
  let bestReasons: string[] = [];

  const now = new Date(newReport.created_at || new Date()).getTime();

  for (const incident of activeIncidents) {
    // Only cluster into non-closed/non-resolved incidents
    if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') {
      continue;
    }

    // 1. Time Window Check
    const incidentTime = new Date(incident.created_at).getTime();
    const ageMinutes = (now - incidentTime) / (1000 * 60);
    if (ageMinutes > CLUSTERING_CONFIG.MAX_TIME_WINDOW_MINUTES) {
      continue;
    }

    // 2. Geographic Distance Check
    const distanceKm = calculateDistanceKm(
      newReport.latitude,
      newReport.longitude,
      incident.latitude,
      incident.longitude
    );

    if (distanceKm > CLUSTERING_CONFIG.MAX_RADIUS_KM) {
      continue;
    }

    // Proximity factor (1.0 at 0km down to 0.0 at MAX_RADIUS)
    const proximityScore = Math.max(
      0,
      1 - distanceKm / CLUSTERING_CONFIG.MAX_RADIUS_KM
    );

    // 3. Emergency Type Compatibility
    let typeScore = 0;
    if (newReport.emergency_type === incident.type) {
      typeScore = 1.0;
    } else if (
      (newReport.emergency_type === 'MEDICAL' && incident.type === 'ACCIDENT') ||
      (newReport.emergency_type === 'ACCIDENT' && incident.type === 'MEDICAL') ||
      (newReport.emergency_type === 'FIRE' && incident.type === 'BUILDING_DAMAGE')
    ) {
      typeScore = 0.7; // Related cross-hazard
    } else {
      typeScore = 0.3;
    }

    // 4. Text & Semantic Overlap
    const fullIncidentText = `${incident.address} ${incident.description} ${incident.ai_summary || ''}`;
    const reportText = `${newReport.address} ${newReport.description} ${newReport.voice_transcript || ''}`;
    const semanticScore = calculateTextSimilarity(reportText, fullIncidentText);

    // Weighted composite match score
    // 50% spatial proximity, 30% emergency type match, 20% semantic overlap
    const compositeScore =
      proximityScore * 0.5 + typeScore * 0.3 + semanticScore * 0.2;

    const reasons: string[] = [];
    if (distanceKm <= 0.3) {
      reasons.push(`Direct spatial convergence (${(distanceKm * 1000).toFixed(0)}m apart)`);
    } else {
      reasons.push(`Within sector radius (${distanceKm.toFixed(2)} km)`);
    }

    if (typeScore === 1.0) {
      reasons.push(`Matching emergency type [${incident.type}]`);
    } else if (typeScore > 0.5) {
      reasons.push(`Related emergency category [${newReport.emergency_type} -> ${incident.type}]`);
    }

    if (ageMinutes < 15) {
      reasons.push(`High velocity: reported within ${Math.round(ageMinutes)} mins`);
    }

    if (compositeScore > highestScore) {
      highestScore = compositeScore;
      bestIncident = incident;
      bestReasons = reasons;
    }
  }

  const isMatch = highestScore >= CLUSTERING_CONFIG.MATCH_THRESHOLD;

  return {
    isMatch,
    incident: isMatch ? bestIncident : null,
    matchScore: Math.round(highestScore * 100) / 100,
    reasons: bestReasons,
  };
}
