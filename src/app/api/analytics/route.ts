import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics-service';

export async function GET() {
  try {
    const summary = analyticsService.getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      analytics: summary,
    });
  } catch (error: any) {
    console.error('Error computing analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
