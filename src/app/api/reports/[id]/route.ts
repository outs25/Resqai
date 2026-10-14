import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db-adapter';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const report = db.getReportById(reportId);

    if (!report) {
      return NextResponse.json(
        { error: `Emergency report '${reportId}' not found.` },
        { status: 404 }
      );
    }

    // If attached to an incident, fetch incident status
    let incident = null;
    if (report.incident_id) {
      incident = db.getIncidentById(report.incident_id);
    }

    return NextResponse.json({
      success: true,
      report: {
        report_id: report.report_id,
        emergency_type: report.emergency_type,
        address: report.address,
        created_at: report.created_at,
        in_danger: report.in_danger,
        latitude: report.latitude,
        longitude: report.longitude,
      },
      incident: incident
        ? {
            public_id: incident.public_id,
            status: incident.status,
            severity: incident.severity,
            address: incident.address,
            report_count: incident.report_count,
            created_at: incident.created_at,
            assigned_resources_count: incident.assigned_resources?.length || 0,
            has_responders_en_route: incident.status === 'RESPONDERS_EN_ROUTE' || incident.status === 'ON_SCENE',
            timeline: incident.timeline?.slice(0, 5) || [],
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
