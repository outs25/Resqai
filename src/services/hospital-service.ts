import { Hospital } from '@/types/incident';
import { db } from '@/lib/supabase/db-adapter';
import { calculateDistanceKm, estimateEmergencyEtaMinutes } from '@/lib/geo';

export interface HospitalWithRecommendation extends Hospital {
  distance_km: number;
  eta_minutes: number;
  is_recommended: boolean;
  recommendation_reason?: string;
}

export class HospitalService {
  /**
   * Get sorted list of hospitals with proximity, capacity assessment, and smart recommendation
   */
  public getHospitalsForIncident(
    incidentLat: number,
    incidentLon: number
  ): HospitalWithRecommendation[] {
    const hospitals = db.getHospitals();

    const withMetrics = hospitals.map((hosp) => {
      const dist = calculateDistanceKm(incidentLat, incidentLon, hosp.latitude, hosp.longitude);
      const eta = estimateEmergencyEtaMinutes(dist);
      return {
        ...hosp,
        distance_km: dist,
        eta_minutes: eta,
        is_recommended: false,
        recommendation_reason: undefined as string | undefined,
      };
    });

    // Sort primarily by available capacity > 0 and distance
    withMetrics.sort((a, b) => {
      if (a.available_capacity > 0 && b.available_capacity === 0) return -1;
      if (b.available_capacity > 0 && a.available_capacity === 0) return 1;
      return a.distance_km - b.distance_km;
    });

    // Select the best hospital recommendation
    const bestHospital = withMetrics.find((h) => h.available_capacity >= 5 && h.status === 'OPEN') || withMetrics[0];

    if (bestHospital) {
      bestHospital.is_recommended = true;
      bestHospital.recommendation_reason = `Closest facility with active surge capacity (${bestHospital.available_capacity}/${bestHospital.emergency_capacity} beds available, ${bestHospital.eta_minutes} min ETA).`;
    }

    return withMetrics;
  }
}

export const hospitalService = new HospitalService();
