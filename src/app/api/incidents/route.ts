import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db-adapter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const severity = searchParams.get('severity') || 'ALL';
    const type = searchParams.get('type') || 'ALL';
    const search = searchParams.get('search') || '';

    const incidents = db.getIncidents({
      status,
      severity,
      type,
      search,
    });

    const severityRank: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    incidents.sort((a, b) => {
      const aActive = a.status !== 'RESOLVED' && a.status !== 'CLOSED' ? 1 : 0;
      const bActive = b.status !== 'RESOLVED' && b.status !== 'CLOSED' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      const rankDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
      if (rankDiff !== 0) return rankDiff;

      const scoreDiff = (b.severity_score || 50) - (a.severity_score || 50);
      if (scoreDiff !== 0) return scoreDiff;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
