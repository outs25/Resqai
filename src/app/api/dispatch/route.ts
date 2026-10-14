import { NextRequest, NextResponse } from 'next/server';
import { resourceService } from '@/services/resource-service';
import { z } from 'zod';

const DispatchSchema = z.object({
  incidentId: z.string().min(1),
  resourceIds: z.array(z.string()).min(1),
  operatorName: z.string().optional().default('Lead Dispatcher'),
  operatorId: z.string().optional().default('op-001'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = DispatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid dispatch payload', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { incidentId, resourceIds, operatorName, operatorId } = validation.data;

    const assignments = resourceService.confirmDispatch({
      incidentId,
      resourceIds,
      operatorName,
      operatorId,
    });

    return NextResponse.json({
      success: true,
      assignments_count: assignments.length,
      assignments,
      message: `Successfully dispatched ${assignments.length} emergency unit(s). Units status updated to EN_ROUTE.`,
    });
  } catch (error: any) {
    console.error('Error confirming dispatch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
