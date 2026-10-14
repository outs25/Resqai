import { Resource, ResourceType, ResourceAssignment } from '@/types/incident';
import { db } from '@/lib/supabase/db-adapter';
import { calculateDistanceKm, estimateEmergencyEtaMinutes } from '@/lib/geo';

export class ResourceService {
  /**
   * Get all resources with distance & ETA relative to an incident coordinate
   */
  public getResourcesForIncident(
    incidentLat: number,
    incidentLon: number,
    filterType?: string
  ): (Resource & { distance_km: number; calculated_eta: number; is_recommended?: boolean })[] {
    const allResources = db.getResources({ type: filterType });

    return allResources.map((res) => {
      const dist = calculateDistanceKm(incidentLat, incidentLon, res.latitude, res.longitude);
      const eta = estimateEmergencyEtaMinutes(dist);
      return {
        ...res,
        distance_km: dist,
        calculated_eta: eta,
      };
    }).sort((a, b) => a.distance_km - b.distance_km);
  }

  /**
   * Calculate smart resource recommendations based on incident needs, proximity, and availability
   */
  public recommendResources(
    incidentLat: number,
    incidentLon: number,
    requiredTypes: ResourceType[]
  ): Resource[] {
    const available = db.getResources({ status: 'AVAILABLE' });
    const recommended: Resource[] = [];

    for (const reqType of requiredTypes) {
      // Find closest available resource matching this type
      const candidates = available
        .filter((r) => r.type === reqType)
        .map((r) => ({
          ...r,
          dist: calculateDistanceKm(incidentLat, incidentLon, r.latitude, r.longitude),
        }))
        .sort((a, b) => a.dist - b.dist);

      if (candidates.length > 0) {
        recommended.push(candidates[0]);
      }
    }

    return recommended;
  }

  /**
   * Confirm Dispatch of multiple resources to an incident (Operator Approved)
   */
  public confirmDispatch(params: {
    incidentId: string;
    resourceIds: string[];
    operatorName: string;
    operatorId: string;
  }): ResourceAssignment[] {
    const assignments: ResourceAssignment[] = [];
    const resourceNames: string[] = [];

    for (const resId of params.resourceIds) {
      const asgn = db.assignResource(params.incidentId, resId, params.operatorName);
      if (asgn) {
        assignments.push(asgn);
        const res = db.getResourceById(resId);
        if (res) resourceNames.push(res.name);
      }
    }

    // Add Audit Log
    db.addAuditLog({
      operator_id: params.operatorId,
      operator_name: params.operatorName,
      action: 'DISPATCH_APPROVED',
      entity_type: 'INCIDENT',
      entity_id: params.incidentId,
      metadata: {
        dispatched_resources: resourceNames,
        resource_ids: params.resourceIds,
      },
    });

    return assignments;
  }
}

export const resourceService = new ResourceService();
