import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incident-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incidentId = params.id;
    const body = await request.json().catch(() => ({}));

    const operatorName = body.operatorName || 'Lead Dispatcher';
    const operatorId = body.operatorId || 'op-001';
    const notes = body.notes || 'Emergency resolved by field responders. Scene secured.';

    const resolved = incidentService.resolveIncident({
      incidentId,
      operatorId,
      operatorName,
      notes,
    });

    if (!resolved) {
      return NextResponse.json(
        { error: `Incident '${incidentId}' could not be resolved.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      incident: resolved,
      message: `Incident #${resolved.public_id} successfully marked as RESOLVED. All assigned units released to AVAILABLE status.`,
    });
  } catch (error: any) {
    console.error('Error resolving incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
