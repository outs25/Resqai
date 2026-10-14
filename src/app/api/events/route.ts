import { NextRequest } from 'next/server';
import { dbEventBus } from '@/lib/supabase/db-adapter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`));

      const sendEvent = (eventType: string, data: any) => {
        try {
          const payload = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          // Stream might be closed
        }
      };

      const handleIncidentCreated = (inc: any) => sendEvent('INCIDENT_CREATED', inc);
      const handleIncidentUpdated = (inc: any) => sendEvent('INCIDENT_UPDATED', inc);
      const handleReportCreated = (rep: any) => sendEvent('REPORT_CREATED', rep);
      const handleResourceUpdated = (res: any) => sendEvent('RESOURCE_UPDATED', res);
      const handleResourceAssigned = (asgn: any) => sendEvent('RESOURCE_ASSIGNED', asgn);
      const handleTimelineEvent = (tl: any) => sendEvent('TIMELINE_EVENT', tl);
      const handleReseeded = () => sendEvent('DATABASE_RESEEDED', {});

      dbEventBus.on('incident_created', handleIncidentCreated);
      dbEventBus.on('incident_updated', handleIncidentUpdated);
      dbEventBus.on('report_created', handleReportCreated);
      dbEventBus.on('resource_updated', handleResourceUpdated);
      dbEventBus.on('resource_assigned', handleResourceAssigned);
      dbEventBus.on('timeline_event', handleTimelineEvent);
      dbEventBus.on('database_reseeded', handleReseeded);

      // Heartbeat ping every 15s to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        dbEventBus.off('incident_created', handleIncidentCreated);
        dbEventBus.off('incident_updated', handleIncidentUpdated);
        dbEventBus.off('report_created', handleReportCreated);
        dbEventBus.off('resource_updated', handleResourceUpdated);
        dbEventBus.off('resource_assigned', handleResourceAssigned);
        dbEventBus.off('timeline_event', handleTimelineEvent);
        dbEventBus.off('database_reseeded', handleReseeded);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
