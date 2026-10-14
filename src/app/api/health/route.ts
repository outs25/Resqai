import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase/db-adapter';

const START_TIME = Date.now();

export async function GET() {
  try {
    const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
    const memory = process.memoryUsage();
    
    // Check database state
    const incidents = db.getIncidents({ status: 'ACTIVE_ONLY' });
    const resources = db.getResources();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime_seconds: uptimeSeconds,
        environment: process.env.NODE_ENV || 'production',
        version: '1.0.0',
        system: {
          node_version: process.version,
          platform: process.platform,
          memory: {
            heap_used_mb: Math.round(memory.heapUsed / 1024 / 1024),
            heap_total_mb: Math.round(memory.heapTotal / 1024 / 1024),
            rss_mb: Math.round(memory.rss / 1024 / 1024),
          },
        },
        database: {
          status: 'connected',
          engine: 'resilient_event_bus',
          active_incidents: incidents.length,
          available_resources: resources.filter((r) => r.status === 'AVAILABLE').length,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown health check error',
      },
      { status: 503 }
    );
  }
}
