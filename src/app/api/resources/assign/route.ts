import { NextRequest, NextResponse } from 'next/server';
import { resourceService } from '@/services/resource-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { incidentId, resourceIds, operatorName = 'Operator', operatorId = 'op-001' } = body;

    if (!incidentId || !resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json({ error: 'incidentId and resourceIds array required' }, { status: 400 });
    }

    const assignments = resourceService.confirmDispatch({
      incidentId,
      resourceIds,
      operatorName,
      operatorId,
    });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
