import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db-adapter';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incidentId = params.id;
    const incident = db.getIncidentById(incidentId);

    if (!incident) {
      return NextResponse.json(
        { error: `Incident '${incidentId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    console.error('Error fetching incident detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incidentId = params.id;
    const updates = await request.json();

    const updated = db.updateIncident(incidentId, updates);
    if (!updated) {
      return NextResponse.json(
        { error: `Incident '${incidentId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      incident: updated,
    });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
