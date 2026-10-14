import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incident-service';
import { checkRateLimit } from '@/lib/rate-limiter';
import { z } from 'zod';

const ReportRequestSchema = z.object({
  emergencyType: z.enum(['FIRE', 'ACCIDENT', 'FLOOD', 'BUILDING_DAMAGE', 'MEDICAL', 'OTHER']),
  description: z.string().optional().default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(1),
  inDanger: z.boolean().default(false),
  peopleCount: z.number().int().min(1).max(100).optional().default(1),
  voiceTranscript: z.string().optional().nullable(),
  anonymousSessionId: z.string().min(1),
  evidence: z.array(z.any()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate body schema
    const validation = ReportRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid report data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Server-side Rate Limiting (5 reports per minute per anonymous session)
    const rateCheck = checkRateLimit(data.anonymousSessionId, 5, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.message,
          resetSeconds: rateCheck.resetSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Process report in incident service (Clustering + AI + Severity calculation)
    const result = await incidentService.submitReport({
      emergencyType: data.emergencyType,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      inDanger: data.inDanger,
      peopleCount: data.peopleCount,
      voiceTranscript: data.voiceTranscript,
      anonymousSessionId: data.anonymousSessionId,
      evidence: data.evidence,
    });

    return NextResponse.json(
      {
        success: true,
        report_id: result.report.report_id,
        incident_id: result.incident.id,
        public_id: result.incident.public_id,
        status: result.incident.status,
        severity: result.incident.severity,
        is_clustered: result.isClustered,
        cluster_reasons: result.clusterMatchReasons,
        created_at: result.report.created_at,
        message: result.isClustered
          ? `Report attached to active clustered Incident #${result.incident.public_id}`
          : `New Incident #${result.incident.public_id} created and dispatched to Command Center`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting emergency report:', error);
    return NextResponse.json(
      { error: 'Internal server error processing emergency report' },
      { status: 500 }
    );
  }
}
