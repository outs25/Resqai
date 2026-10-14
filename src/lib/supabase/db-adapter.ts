import {
  Incident,
  Report,
  Resource,
  Hospital,
  IncidentTimeline,
  AuditLog,
  AIAssessment,
  Operator,
  ResourceAssignment,
} from '@/types/incident';
import {
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_HOSPITALS,
  INITIAL_OPERATORS,
  INITIAL_AUDIT_LOGS,
} from '@/database/seed-data';
import { EventEmitter } from 'events';

// Global event bus for real-time live updates across SSE / API routes
class DatabaseEventBus extends EventEmitter {}
export const dbEventBus = new DatabaseEventBus();
dbEventBus.setMaxListeners(100);

// In-Memory resilient database engine
class ResilientDB {
  private incidents: Incident[] = [];
  private reports: Report[] = [];
  private resources: Resource[] = [];
  private hospitals: Hospital[] = [];
  private operators: Operator[] = [];
  private assessments: AIAssessment[] = [];
  private assignments: ResourceAssignment[] = [];
  private timeline: IncidentTimeline[] = [];
  private auditLogs: AuditLog[] = [];
  private initialized = false;

  constructor() {
    this.clearAllData();
  }

  public clearAllData() {
    this.incidents = [];
    this.reports = [];
    this.assessments = [];
    this.assignments = [];
    this.timeline = [];
    this.auditLogs = [];
    this.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES)).map((r: Resource) => ({
      ...r,
      status: 'AVAILABLE',
      current_incident_id: null,
      assigned_at: null,
    }));
    this.hospitals = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
    this.operators = JSON.parse(JSON.stringify(INITIAL_OPERATORS));
    this.initialized = true;
    dbEventBus.emit('database_reseeded');
    dbEventBus.emit('incident_updated', null);
  }

  public seed(force = false) {
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
    this.hospitals = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
    this.operators = JSON.parse(JSON.stringify(INITIAL_OPERATORS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.reports = [];
    this.assessments = [];
    this.timeline = [];
    this.assignments = [];

    // Extract nested reports, assessments and timelines from seed incidents
    for (const inc of this.incidents) {
      if (inc.reports) {
        for (const rep of inc.reports) {
          this.reports.push(rep);
        }
      }
      if (inc.ai_assessment) {
        this.assessments.push(inc.ai_assessment);
      }
      if (inc.timeline) {
        for (const tl of inc.timeline) {
          this.timeline.push(tl);
        }
      }
    }

    this.initialized = true;
    dbEventBus.emit('database_reseeded');
  }

  // --- INCIDENTS ---
  public getIncidents(options?: {
    status?: string;
    severity?: string;
    type?: string;
    search?: string;
  }): Incident[] {
    let result = [...this.incidents];

    if (options?.status && options.status !== 'ALL') {
      if (options.status === 'ACTIVE_ONLY') {
        result = result.filter(
          (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
        );
      } else {
        result = result.filter((i) => i.status === options.status);
      }
    }

    if (options?.severity && options.severity !== 'ALL') {
      result = result.filter((i) => i.severity === options.severity);
    }

    if (options?.type && options.type !== 'ALL') {
      result = result.filter((i) => i.type === options.type);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.public_id.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }

    // Attach current reports, assessment, resources, and timeline to each incident
    return result.map((inc) => this.enrichIncident(inc));
  }

  public getIncidentById(idOrPublicId: string): Incident | null {
    const inc = this.incidents.find(
      (i) => i.id === idOrPublicId || i.public_id === idOrPublicId
    );
    if (!inc) return null;
    return this.enrichIncident(inc);
  }

  private enrichIncident(inc: Incident): Incident {
    const reports = this.reports.filter((r) => r.incident_id === inc.id);
    const ai_assessment =
      this.assessments.find((a) => a.incident_id === inc.id) || null;
    const timeline = this.timeline
      .filter((t) => t.incident_id === inc.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    const assigned_resources = this.resources.filter(
      (r) => r.current_incident_id === inc.id
    );

    return {
      ...inc,
      report_count: Math.max(inc.report_count || 1, reports.length),
      reports,
      ai_assessment,
      assigned_resources,
      timeline,
    };
  }

  public createIncident(incident: Incident): Incident {
    this.incidents.unshift(incident);
    dbEventBus.emit('incident_created', incident);
    return this.enrichIncident(incident);
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const index = this.incidents.findIndex((i) => i.id === id || i.public_id === id);
    if (index === -1) return null;

    this.incidents[index] = {
      ...this.incidents[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const updated = this.enrichIncident(this.incidents[index]);
    dbEventBus.emit('incident_updated', updated);
    return updated;
  }

  // --- REPORTS ---
  public createReport(report: Report): Report {
    this.reports.unshift(report);
    dbEventBus.emit('report_created', report);
    return report;
  }

  public getReportById(reportId: string): Report | null {
    return (
      this.reports.find((r) => r.id === reportId || r.report_id === reportId) ||
      null
    );
  }

  public getReportsByIncidentId(incidentId: string): Report[] {
    return this.reports.filter((r) => r.incident_id === incidentId);
  }

  // --- AI ASSESSMENTS ---
  public saveAIAssessment(assessment: AIAssessment): AIAssessment {
    const idx = this.assessments.findIndex((a) => a.incident_id === assessment.incident_id);
    if (idx !== -1) {
      this.assessments[idx] = assessment;
    } else {
      this.assessments.unshift(assessment);
    }
    dbEventBus.emit('ai_assessment_saved', assessment);
    return assessment;
  }

  // --- RESOURCES ---
  public getResources(filter?: { type?: string; status?: string }): Resource[] {
    let list = [...this.resources];
    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter((r) => r.type === filter.type);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((r) => r.status === filter.status);
    }
    return list;
  }

  public getResourceById(id: string): Resource | null {
    return this.resources.find((r) => r.id === id) || null;
  }

  public updateResource(id: string, updates: Partial<Resource>): Resource | null {
    const index = this.resources.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.resources[index] = {
      ...this.resources[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    dbEventBus.emit('resource_updated', this.resources[index]);
    return this.resources[index];
  }

  // --- RESOURCE ASSIGNMENTS ---
  public assignResource(
    incidentId: string,
    resourceId: string,
    assignedBy: string
  ): ResourceAssignment | null {
    const resource = this.getResourceById(resourceId);
    if (!resource) return null;

    // Update resource state
    this.updateResource(resourceId, {
      status: 'EN_ROUTE',
      current_incident_id: incidentId,
    });

    const assignment: ResourceAssignment = {
      id: `asgn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      incident_id: incidentId,
      resource_id: resourceId,
      assigned_by: assignedBy,
      status: 'EN_ROUTE',
      assigned_at: new Date().toISOString(),
      resource,
    };

    this.assignments.unshift(assignment);

    // Add to incident timeline
    this.addTimelineEvent({
      id: `tl-${Date.now()}`,
      incident_id: incidentId,
      event_type: 'RESOURCE_ASSIGNED',
      description: `${resource.name} (${resource.type.replace('_', ' ')}) dispatched to scene by ${assignedBy}.`,
      created_by: assignedBy,
      created_at: new Date().toISOString(),
    });

    // Update incident status to DISPATCHED or RESPONDERS_EN_ROUTE if reported/active
    const inc = this.getIncidentById(incidentId);
    if (inc && (inc.status === 'REPORTED' || inc.status === 'ANALYZING' || inc.status === 'ACTIVE' || inc.status === 'VERIFICATION_REQUIRED')) {
      this.updateIncident(incidentId, { status: 'RESPONDERS_EN_ROUTE' });
    }

    dbEventBus.emit('resource_assigned', assignment);
    return assignment;
  }

  // --- HOSPITALS ---
  public getHospitals(): Hospital[] {
    return [...this.hospitals];
  }

  public updateHospital(id: string, updates: Partial<Hospital>): Hospital | null {
    const index = this.hospitals.findIndex((h) => h.id === id);
    if (index === -1) return null;

    this.hospitals[index] = {
      ...this.hospitals[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    dbEventBus.emit('hospital_updated', this.hospitals[index]);
    return this.hospitals[index];
  }

  // --- TIMELINE ---
  public addTimelineEvent(event: IncidentTimeline): IncidentTimeline {
    this.timeline.unshift(event);
    dbEventBus.emit('timeline_event', event);
    return event;
  }

  // --- AUDIT LOGS ---
  public addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const fullLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullLog);
    dbEventBus.emit('audit_log_created', fullLog);
    return fullLog;
  }

  public getAuditLogs(limit = 50): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  // --- OPERATORS ---
  public getOperators(): Operator[] {
    return [...this.operators];
  }
}

// Global singleton instance
const globalForDB = globalThis as unknown as { dbInstance: ResilientDB };
export const db = globalForDB.dbInstance || new ResilientDB();
if (process.env.NODE_ENV !== 'production') globalForDB.dbInstance = db;
