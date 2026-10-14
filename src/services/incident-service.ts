import {
  Incident,
  Report,
  EmergencyType,
  AIAssessment,
  IncidentTimeline,
} from '@/types/incident';
import { db } from '@/lib/supabase/db-adapter';
import { generateReportId } from '@/lib/utils';
import { findClusteredIncident } from './clustering-service';
import { aiService } from './ai-service';
import { calculateTransparentSeverity } from './severity-calculator';

export class IncidentService {
  /**
   * Main entry point when a citizen submits an emergency report
   */
  public async submitReport(params: {
    emergencyType: EmergencyType;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    inDanger: boolean;
    peopleCount?: number;
    voiceTranscript?: string | null;
    anonymousSessionId: string;
    evidence?: any[];
  }): Promise<{
    report: Report;
    incident: Incident;
    isClustered: boolean;
    clusterMatchReasons?: string[];
  }> {
    const reportId = generateReportId();
    const now = new Date().toISOString();

    // 1. Create Report Entity
    const newReport: Report = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      report_id: reportId,
      emergency_type: params.emergencyType,
      description: params.description || '',
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address,
      voice_transcript: params.voiceTranscript || null,
      is_anonymous: true,
      anonymous_session_id: params.anonymousSessionId,
      in_danger: params.inDanger,
      people_count: params.peopleCount || 1,
      created_at: now,
      evidence: params.evidence || [],
    };

    // 2. Fetch Active Incidents for Clustering
    const activeIncidents = db.getIncidents({ status: 'ACTIVE_ONLY' });

    // 3. Evaluate Clustering & Duplicate Match
    const clusterResult = findClusteredIncident(newReport, activeIncidents);

    let targetIncident: Incident;
    let isClustered = false;

    if (clusterResult.isMatch && clusterResult.incident) {
      // --- CLUSTER MATCH FOUND: ATTACH TO EXISTING INCIDENT ---
      isClustered = true;
      const existingInc = clusterResult.incident;
      newReport.incident_id = existingInc.id;

      // Save report in database
      db.createReport(newReport);

      // Fetch all reports now linked to this incident
      const allReports = db.getReportsByIncidentId(existingInc.id);

      // Run AI on aggregated multi-report context
      const aiResponse = await aiService.analyzeEmergencyReport({
        emergencyType: existingInc.type,
        description: allReports.map((r) => r.description).join(' | '),
        address: existingInc.address,
        inDanger: allReports.some((r) => r.in_danger),
        peopleCount: allReports.reduce((sum, r) => sum + (r.people_count || 1), 0),
        voiceTranscript: allReports.map((r) => r.voice_transcript).filter(Boolean).join(' | '),
        reports: allReports,
      });

      // Recalculate transparent multi-factor severity
      const severityBreakdown = calculateTransparentSeverity({
        type: existingInc.type,
        reports: allReports,
        estimated_affected: aiResponse.estimated_affected,
        in_danger: allReports.some((r) => r.in_danger),
        ai_confidence: aiResponse.confidence,
        has_media: allReports.some((r) => r.evidence && r.evidence.length > 0),
      });

      const previousSeverity = existingInc.severity;

      // Update AI Assessment
      const updatedAssessment: AIAssessment = {
        id: existingInc.ai_assessment?.id || `ai-${Date.now()}`,
        incident_id: existingInc.id,
        classification: aiResponse.incident_type,
        severity: severityBreakdown.severity_level,
        confidence: aiResponse.confidence,
        affected_estimate: aiResponse.estimated_affected,
        risk_factors: aiResponse.risk_factors,
        summary: aiResponse.summary,
        recommended_resources: aiResponse.recommended_resources,
        recommended_route: aiResponse.recommended_route || null,
        human_approved: existingInc.ai_assessment?.human_approved || false,
        created_at: now,
      };
      db.saveAIAssessment(updatedAssessment);

      // Update Incident record
      targetIncident = db.updateIncident(existingInc.id, {
        severity: severityBreakdown.severity_level,
        severity_score: severityBreakdown.total_score,
        estimated_affected: aiResponse.estimated_affected,
        ai_confidence: aiResponse.confidence,
        ai_summary: aiResponse.summary,
        report_count: allReports.length,
      })!;

      // Add Clustering Timeline event
      db.addTimelineEvent({
        id: `tl-${Date.now()}-clust`,
        incident_id: existingInc.id,
        event_type: 'INCIDENT_CLUSTERED',
        description: `Correlated Report #${reportId} into this incident (${clusterResult.reasons.join(', ')}). Total clustered: ${allReports.length} reports.`,
        created_by: 'SYSTEM_AI',
        metadata: {
          report_id: reportId,
          reasons: clusterResult.reasons,
          score: clusterResult.matchScore,
        },
        created_at: now,
      });

      // If severity escalated, record timeline event
      if (previousSeverity !== severityBreakdown.severity_level) {
        db.addTimelineEvent({
          id: `tl-${Date.now()}-esc`,
          incident_id: existingInc.id,
          event_type: 'SEVERITY_ESCALATED',
          description: `Severity escalated from ${previousSeverity} to ${severityBreakdown.severity_level} based on incoming multi-report velocity.`,
          created_by: 'SYSTEM_AI',
          created_at: now,
        });
      }
    } else {
      // --- NO CLUSTER MATCH: CREATE BRAND NEW INCIDENT ---
      const incidentId = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const publicIncidentId = generateReportId();
      newReport.incident_id = incidentId;

      // Save report in database
      db.createReport(newReport);

      // Run AI pipeline
      const aiResponse = await aiService.analyzeEmergencyReport({
        emergencyType: params.emergencyType,
        description: params.description,
        address: params.address,
        inDanger: params.inDanger,
        peopleCount: params.peopleCount,
        voiceTranscript: params.voiceTranscript,
      });

      // Calculate transparent severity
      const severityBreakdown = calculateTransparentSeverity({
        type: params.emergencyType,
        reports: [newReport],
        estimated_affected: aiResponse.estimated_affected,
        in_danger: params.inDanger,
        ai_confidence: aiResponse.confidence,
        has_media: (params.evidence && params.evidence.length > 0) || false,
      });

      // Create Assessment
      const assessment: AIAssessment = {
        id: `ai-${Date.now()}`,
        incident_id: incidentId,
        classification: aiResponse.incident_type,
        severity: severityBreakdown.severity_level,
        confidence: aiResponse.confidence,
        affected_estimate: aiResponse.estimated_affected,
        risk_factors: aiResponse.risk_factors,
        summary: aiResponse.summary,
        recommended_resources: aiResponse.recommended_resources,
        recommended_route: aiResponse.recommended_route || null,
        human_approved: false,
        created_at: now,
      };
      db.saveAIAssessment(assessment);

      // Create Incident
      targetIncident = db.createIncident({
        id: incidentId,
        public_id: publicIncidentId,
        type: aiResponse.incident_type,
        status: 'REPORTED',
        severity: severityBreakdown.severity_level,
        severity_score: severityBreakdown.total_score,
        latitude: params.latitude,
        longitude: params.longitude,
        address: params.address,
        description: params.description || `Emergency ${params.emergencyType} reported near ${params.address}`,
        estimated_affected: aiResponse.estimated_affected,
        ai_confidence: aiResponse.confidence,
        ai_summary: aiResponse.summary,
        report_count: 1,
        created_at: now,
        updated_at: now,
      });

      // Add Initial Timeline events
      db.addTimelineEvent({
        id: `tl-${Date.now()}-rep`,
        incident_id: incidentId,
        event_type: 'REPORT_RECEIVED',
        description: `Citizen emergency report #${reportId} registered via zero-login portal.`,
        created_by: 'CITIZEN',
        created_at: now,
      });

      db.addTimelineEvent({
        id: `tl-${Date.now()}-ai`,
        incident_id: incidentId,
        event_type: 'AI_ANALYSIS_COMPLETED',
        description: `AI triage completed. Classified: ${aiResponse.incident_type}, Severity: ${severityBreakdown.severity_level} (Score: ${severityBreakdown.total_score}/100, Confidence: ${(aiResponse.confidence * 100).toFixed(0)}%). Recommended units: ${aiResponse.recommended_resources.join(', ')}.`,
        created_by: 'SYSTEM_AI',
        created_at: now,
      });
    }

    return {
      report: newReport,
      incident: targetIncident,
      isClustered,
      clusterMatchReasons: clusterResult.reasons,
    };
  }

  /**
   * Resolve an incident (Human operator controlled)
   */
  public resolveIncident(params: {
    incidentId: string;
    operatorId: string;
    operatorName: string;
    notes?: string;
  }): Incident | null {
    const incident = db.getIncidentById(params.incidentId);
    if (!incident) return null;

    const now = new Date().toISOString();

    // 1. Release assigned resources back to AVAILABLE
    if (incident.assigned_resources && incident.assigned_resources.length > 0) {
      for (const res of incident.assigned_resources) {
        db.updateResource(res.id, {
          status: 'AVAILABLE',
          current_incident_id: null,
        });
      }
    }

    // 2. Update Incident Status
    const resolvedIncident = db.updateIncident(params.incidentId, {
      status: 'RESOLVED',
      resolved_at: now,
    });

    // 3. Add Timeline Event
    db.addTimelineEvent({
      id: `tl-${Date.now()}-res`,
      incident_id: params.incidentId,
      event_type: 'INCIDENT_RESOLVED',
      description: `Incident marked RESOLVED by ${params.operatorName}. All assigned units released. ${params.notes ? `Notes: "${params.notes}"` : ''}`,
      created_by: params.operatorName,
      created_at: now,
    });

    // 4. Audit Log
    db.addAuditLog({
      operator_id: params.operatorId,
      operator_name: params.operatorName,
      action: 'INCIDENT_RESOLVED',
      entity_type: 'INCIDENT',
      entity_id: params.incidentId,
      metadata: { notes: params.notes, resolved_at: now },
    });

    return resolvedIncident;
  }
}

export const incidentService = new IncidentService();
