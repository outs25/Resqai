import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db-adapter';
import { resourceService } from '@/services/resource-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null;

    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      const resourcesWithDistance = resourceService.getResourcesForIncident(
        lat,
        lon,
        type !== 'ALL' ? type : undefined
      );
      return NextResponse.json({
        success: true,
        resources: resourcesWithDistance,
      });
    }

    const resources = db.getResources({
      type: type !== 'ALL' ? type : undefined,
      status: status !== 'ALL' ? status : undefined,
    });

    return NextResponse.json({
      success: true,
      resources,
    });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
