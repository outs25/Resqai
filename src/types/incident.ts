export type EmergencyType =
  | 'FIRE'
  | 'ACCIDENT'
  | 'FLOOD'
  | 'BUILDING_DAMAGE'
  | 'MEDICAL'
  | 'OTHER';

export type IncidentStatus =
  | 'REPORTED'
  | 'ANALYZING'
  | 'VERIFICATION_REQUIRED'
  | 'ACTIVE'
  | 'DISPATCHED'
  | 'RESPONDERS_EN_ROUTE'
  | 'ON_SCENE'
  | 'RESOLVED'
  | 'CLOSED';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ResourceType =
  | 'AMBULANCE'
  | 'FIRE_UNIT'
  | 'RESCUE_UNIT'
  | 'POLICE_UNIT'
  | 'TRAFFIC_UNIT'
  | 'MEDICAL_TEAM';

export type ResourceStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'UNAVAILABLE';

export type EvidenceType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export type OperatorRole = 'OPERATOR' | 'DISPATCHER' | 'COMMANDER' | 'ADMIN';

export interface Operator {
  id: string;
  email: string;
  name: string;
  role: OperatorRole;
  organization: string;
  created_at: string;
  last_login?: string;
}

export interface Incident {
  id: string;
  public_id: string;
  type: EmergencyType;
  status: IncidentStatus;
  severity: SeverityLevel;
  severity_score: number; // 0-100 score
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  estimated_affected: number;
  ai_confidence: number;
  ai_summary: string;
  report_count: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  reports?: Report[];
  ai_assessment?: AIAssessment | null;
  assigned_resources?: Resource[];
  timeline?: IncidentTimeline[];
}

export interface Report {
  id: string;
  report_id: string; // e.g. RQ-8F42K
  incident_id?: string | null;
  emergency_type: EmergencyType;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  voice_transcript?: string | null;
  is_anonymous: boolean;
  anonymous_session_id: string;
  in_danger: boolean;
  people_count?: number;
  created_at: string;
  evidence?: Evidence[];
}

export interface Evidence {
  id: string;
  report_id: string;
  type: EvidenceType;
  storage_url: string;
  file_name?: string;
  file_size?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AIAssessment {
  id: string;
  incident_id: string;
  classification: EmergencyType;
  severity: SeverityLevel;
  confidence: number;
  affected_estimate: number;
  risk_factors: string[];
  summary: string;
  recommended_resources: ResourceType[];
  recommended_route?: {
    distance_km: number;
    duration_minutes: number;
    waypoints?: [number, number][];
    hazard_notes?: string;
  } | null;
  created_at: string;
  human_approved?: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  heading?: number;
  capacity: number;
  organization: string;
  current_incident_id?: string | null;
  eta_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceAssignment {
  id: string;
  incident_id: string;
  resource_id: string;
  assigned_by: string;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED' | 'CANCELLED';
  assigned_at: string;
  arrived_at?: string | null;
  completed_at?: string | null;
  resource?: Resource;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  emergency_capacity: number;
  available_capacity: number;
  status: 'OPEN' | 'CRITICAL_CAPACITY' | 'DIVERTING' | 'CLOSED';
  specialties?: string[];
  distance_km?: number;
  eta_minutes?: number;
  updated_at: string;
}

export interface IncidentTimeline {
  id: string;
  incident_id: string;
  event_type:
    | 'REPORT_RECEIVED'
    | 'AI_ANALYSIS_COMPLETED'
    | 'INCIDENT_CLUSTERED'
    | 'SEVERITY_ESCALATED'
    | 'OPERATOR_REVIEWED'
    | 'RESPONSE_APPROVED'
    | 'RESOURCE_ASSIGNED'
    | 'RESPONDER_EN_ROUTE'
    | 'RESPONDER_ON_SCENE'
    | 'INCIDENT_RESOLVED'
    | 'STATUS_UPDATED';
  description: string;
  created_by: string; // 'SYSTEM_AI' | 'CITIZEN' | operator name
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  operator_id: string;
  operator_name?: string;
  action:
    | 'INCIDENT_VIEWED'
    | 'INCIDENT_UPDATED'
    | 'AI_RECOMMENDATION_APPROVED'
    | 'AI_RECOMMENDATION_MODIFIED'
    | 'RESOURCE_ASSIGNED'
    | 'DISPATCH_APPROVED'
    | 'INCIDENT_RESOLVED'
    | 'SEVERITY_OVERRIDDEN';
  entity_type: 'INCIDENT' | 'RESOURCE' | 'REPORT' | 'HOSPITAL';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  total_incidents: number;
  critical_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  average_dispatch_time_sec: number;
  average_response_time_sec: number;
  total_reports_processed: number;
  duplicate_reports_merged: number;
  clustering_efficiency_pct: number;
  resource_utilization_pct: number;
  incidents_by_type: { type: EmergencyType; count: number }[];
  incidents_by_severity: { severity: SeverityLevel; count: number }[];
  hourly_distribution: { hour: string; count: number }[];
  response_trends: { date: string; avg_response_min: number; incident_count: number }[];
  ai_insights: string[];
}
