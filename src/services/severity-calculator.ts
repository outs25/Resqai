import { EmergencyType, SeverityLevel, Report } from '@/types/incident';

export interface SeverityScoreBreakdown {
  total_score: number; // 0 to 100
  severity_level: SeverityLevel;
  factors: {
    name: string;
    score: number;
    max: number;
    explanation: string;
  }[];
}

/**
 * Transparent, multi-factor severity scoring engine.
 * Computes deterministic score (0-100) combining AI confidence, danger flags,
 * casualty estimates, report density/clustering rate, and incident hazard profile.
 */
export function calculateTransparentSeverity(params: {
  type: EmergencyType;
  reports: Report[];
  estimated_affected: number;
  in_danger: boolean;
  ai_confidence: number;
  has_media: boolean;
}): SeverityScoreBreakdown {
  const { type, reports, estimated_affected, in_danger, ai_confidence, has_media } = params;
  const factors: SeverityScoreBreakdown['factors'] = [];

  // 1. Hazard Type Base Weight (Max 25 pts)
  let hazardScore = 15;
  let hazardDesc = 'Standard incident type hazard base';
  switch (type) {
    case 'FIRE':
      hazardScore = 25;
      hazardDesc = 'High thermal hazard & structural spread risk';
      break;
    case 'ACCIDENT':
      hazardScore = 20;
      hazardDesc = 'Vehicle collision with potential road artery obstruction';
      break;
    case 'FLOOD':
      hazardScore = 22;
      hazardDesc = 'Hydrological hazard impacting ground structures';
      break;
    case 'BUILDING_DAMAGE':
      hazardScore = 22;
      hazardDesc = 'Structural integrity compromise';
      break;
    case 'MEDICAL':
      hazardScore = 23;
      hazardDesc = 'Direct physiological life threat';
      break;
    default:
      hazardScore = 14;
      hazardDesc = 'General advisory report';
  }
  factors.push({
    name: 'Hazard Type Base',
    score: hazardScore,
    max: 25,
    explanation: hazardDesc,
  });

  // 2. Immediate Life Threat / Danger Flag (Max 25 pts)
  let dangerScore = 0;
  if (in_danger) {
    dangerScore = 25;
    factors.push({
      name: 'Immediate Danger Flag',
      score: 25,
      max: 25,
      explanation: 'Reporter flagged active personal threat / trapped status',
    });
  } else {
    factors.push({
      name: 'Immediate Danger Flag',
      score: 5,
      max: 25,
      explanation: 'Reporting from safe distance / external observer',
    });
    dangerScore = 5;
  }

  // 3. Number of Clustered Reports / Velocity (Max 20 pts)
  const reportCount = Math.max(1, reports.length);
  let clusterScore = 5;
  if (reportCount >= 4) {
    clusterScore = 20;
  } else if (reportCount === 3) {
    clusterScore = 16;
  } else if (reportCount === 2) {
    clusterScore = 11;
  }
  factors.push({
    name: 'Report Convergence Velocity',
    score: clusterScore,
    max: 20,
    explanation: `${reportCount} independent citizen report(s) clustered in geographic sector`,
  });

  // 4. Estimated People Affected / Casualties (Max 18 pts)
  let affectedScore = 4;
  if (estimated_affected >= 20) {
    affectedScore = 18;
  } else if (estimated_affected >= 10) {
    affectedScore = 14;
  } else if (estimated_affected >= 4) {
    affectedScore = 9;
  } else if (estimated_affected >= 2) {
    affectedScore = 6;
  }
  factors.push({
    name: 'Estimated Affected / Casualties',
    score: affectedScore,
    max: 18,
    explanation: `${estimated_affected} estimated person(s) directly impacted`,
  });

  // 5. Corroborating Evidence & AI Confidence (Max 12 pts)
  let evidenceScore = Math.round(ai_confidence * 7);
  if (has_media) evidenceScore += 5;
  factors.push({
    name: 'AI Confidence & Corroborating Media',
    score: Math.min(12, evidenceScore),
    max: 12,
    explanation: `AI model confidence ${(ai_confidence * 100).toFixed(0)}% with ${has_media ? 'field photo/video' : 'text telemetry'}`,
  });

  // Calculate sum
  const totalScore = Math.min(
    100,
    factors.reduce((acc, f) => acc + f.score, 0)
  );

  // Map to Severity Level
  let severityLevel: SeverityLevel = 'LOW';
  if (totalScore >= 80) {
    severityLevel = 'CRITICAL';
  } else if (totalScore >= 65) {
    severityLevel = 'HIGH';
  } else if (totalScore >= 45) {
    severityLevel = 'MEDIUM';
  } else {
    severityLevel = 'LOW';
  }

  return {
    total_score: totalScore,
    severity_level: severityLevel,
    factors,
  };
}
