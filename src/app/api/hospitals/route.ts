import { NextRequest, NextResponse } from 'next/server';
import { hospitalService } from '@/services/hospital-service';
import { db } from '@/lib/supabase/db-adapter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null;

    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      const hospitals = hospitalService.getHospitalsForIncident(lat, lon);
      return NextResponse.json({
        success: true,
        hospitals,
      });
    }

    const hospitals = db.getHospitals();
    return NextResponse.json({
      success: true,
      hospitals,
    });
  } catch (error: any) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
