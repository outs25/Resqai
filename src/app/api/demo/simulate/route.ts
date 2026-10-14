import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incident-service';
import { db } from '@/lib/supabase/db-adapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scenario = body.scenario || 'SINGLE_REPORT';

    if (scenario === 'SINGLE_REPORT') {
      const result = await incidentService.submitReport({
        emergencyType: 'ACCIDENT',
        description: 'Multi-car collision near Indiranagar 100ft Road flyover. Airbags deployed, fluid leaking.',
        latitude: 12.9785,
        longitude: 77.6408,
        address: '100ft Road, Indiranagar, Sector 2',
        inDanger: true,
        peopleCount: 3,
        anonymousSessionId: `sim-anon-${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        scenario,
        result,
        message: `Simulated fresh emergency report: #${result.report.report_id}. Incident #${result.incident.public_id} created.`,
      });
    }

    if (scenario === 'CLUSTER_BURST') {
      // Create 3 related reports in rapid sequence in same geographic zone
      const baseLat = 12.935;
      const baseLon = 77.624;
      const results = [];

      // Report 1
      const r1 = await incidentService.submitReport({
        emergencyType: 'FLOOD',
        description: 'Severe storm runoff entered residential basements near Koramangala Sony Signal.',
        latitude: baseLat + 0.001,
        longitude: baseLon + 0.001,
        address: 'Koramangala 80ft Road, Sony Signal',
        inDanger: false,
        peopleCount: 4,
        anonymousSessionId: `sim-burst-1`,
      });
      results.push(r1);

      // Report 2 (150 meters away, same time window)
      const r2 = await incidentService.submitReport({
        emergencyType: 'FLOOD',
        description: 'Water level reached 3 feet, vehicles floating in basement parking at Sony Signal.',
        latitude: baseLat + 0.002,
        longitude: baseLon - 0.001,
        address: 'Sony Signal Junction, Block 4',
        inDanger: true,
        peopleCount: 6,
        anonymousSessionId: `sim-burst-2`,
      });
      results.push(r2);

      // Report 3 (200 meters away, corroborating)
      const r3 = await incidentService.submitReport({
        emergencyType: 'FLOOD',
        description: 'Power transformer sparking near flooded underpass. Civilians stranded on wall.',
        latitude: baseLat - 0.001,
        longitude: baseLon + 0.002,
        address: 'Sony Signal Underpass East',
        inDanger: true,
        peopleCount: 8,
        anonymousSessionId: `sim-burst-3`,
      });
      results.push(r3);

      return NextResponse.json({
        success: true,
        scenario: 'CLUSTER_BURST',
        message: `Spawned 3 rapid citizen reports. AI successfully clustered all 3 into unified Incident #${r3.incident.public_id} with severity escalation to ${r3.incident.severity}!`,
        clustered_incident: r3.incident,
      });
    }

    if (scenario === 'DISPATCH_MOVE') {
      // Move any EN_ROUTE vehicle slightly closer to its assigned incident
      const enRouteUnits = db.getResources({ status: 'EN_ROUTE' });
      if (enRouteUnits.length === 0) {
        // If none en route, set one
        const amb = db.getResources({ status: 'AVAILABLE', type: 'AMBULANCE' })[0];
        if (amb) {
          db.updateResource(amb.id, { status: 'EN_ROUTE' });
          return NextResponse.json({
            success: true,
            message: `Set ${amb.name} status to EN_ROUTE`,
          });
        }
      } else {
        const unit = enRouteUnits[0];
        // Jitter / advance coordinates
        const newLat = unit.latitude + 0.002;
        const newLon = unit.longitude + 0.002;
        db.updateResource(unit.id, {
          latitude: newLat,
          longitude: newLon,
          eta_minutes: Math.max(1, (unit.eta_minutes || 5) - 2),
        });
        return NextResponse.json({
          success: true,
          message: `Simulated telemetry advancement for ${unit.name}. New ETA: ${Math.max(1, (unit.eta_minutes || 5) - 2)}m`,
        });
      }
    }

    return NextResponse.json({ error: 'Unknown scenario' }, { status: 400 });
  } catch (error: any) {
    console.error('Simulation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
