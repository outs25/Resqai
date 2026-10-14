import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db-adapter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let action = 'seed';
    try {
      const body = await request.json();
      if (body?.action) action = body.action;
    } catch (e) {
      const { searchParams } = new URL(request.url);
      if (searchParams.get('action')) action = searchParams.get('action')!;
    }

    if (action === 'clear' || action === 'reset_zero') {
      db.clearAllData();
      return NextResponse.json({
        success: true,
        incident_count: 0,
        report_count: 0,
        message: 'Database completely cleared to 0 incidents & reports. Fleet units reset to AVAILABLE.',
      });
    }

    db.seed(true);
    return NextResponse.json({
      success: true,
      message: 'Database successfully reseeded with standard emergency scenarios, active units, and hospitals.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('action') === 'clear') {
    db.clearAllData();
    return NextResponse.json({ success: true, message: 'Database reset to 0' });
  }
  return NextResponse.json({ success: true, incidents: db.getIncidents().length });
}
