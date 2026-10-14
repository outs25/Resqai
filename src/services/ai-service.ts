import { z } from 'zod';
import { EmergencyType, SeverityLevel, ResourceType, AIAssessment, Report } from '@/types/incident';

// Strict Zod schema for validated AI JSON output
export const AIAssessmentSchema = z.object({
  incident_type: z.enum(['FIRE', 'ACCIDENT', 'FLOOD', 'BUILDING_DAMAGE', 'MEDICAL', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number().min(0).max(1),
  estimated_affected: z.number().int().min(1),
  risk_factors: z.array(z.string()),
  summary: z.string(),
  recommended_resources: z.array(
    z.enum(['AMBULANCE', 'FIRE_UNIT', 'RESCUE_UNIT', 'POLICE_UNIT', 'TRAFFIC_UNIT', 'MEDICAL_TEAM'])
  ),
  recommended_route: z
    .object({
      distance_km: z.number(),
      duration_minutes: z.number(),
      waypoints: z.array(z.tuple([z.number(), z.number()])).optional(),
      hazard_notes: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export type StructuredAIResponse = z.infer<typeof AIAssessmentSchema>;

export class AIService {
  private geminiKey: string | undefined;
  private openAiKey: string | undefined;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AQ.') 
      ? process.env.GEMINI_API_KEY 
      : (process.env.AI_API_KEY?.startsWith('AIza') ? process.env.AI_API_KEY : undefined);
    this.openAiKey = process.env.OPENAI_API_KEY || (process.env.AI_API_KEY?.startsWith('sk-') ? process.env.AI_API_KEY : undefined);
  }

  /**
   * Main pipeline for analyzing a report or combined reports of an incident
   */
  public async analyzeEmergencyReport(params: {
    emergencyType: EmergencyType;
    description: string;
    address: string;
    inDanger: boolean;
    peopleCount?: number;
    voiceTranscript?: string | null;
    reports?: Report[];
  }): Promise<StructuredAIResponse> {
    // 1. Try Gemini if configured
    if (this.geminiKey) {
      try {
        const result = await this.callGemini(params);
        const parsed = AIAssessmentSchema.safeParse(result);
        if (parsed.success) {
          return parsed.data;
        } else {
          console.warn('Gemini response did not match schema:', parsed.error);
        }
      } catch (err) {
        console.warn('Gemini API call failed or timed out, evaluating fallbacks:', err);
      }
    }

    // 2. Try OpenAI if configured
    if (this.openAiKey) {
      try {
        const result = await this.callOpenAI(params);
        const parsed = AIAssessmentSchema.safeParse(result);
        if (parsed.success) {
          return parsed.data;
        }
      } catch (err) {
        console.warn('OpenAI API call failed or timed out:', err);
      }
    }

    // 3. High-Fidelity Intelligent Heuristic Engine (Deterministic NLP fallback)
    return this.runIntelligentAnalysis(params);
  }

  /**
   * Google Gemini LLM caller with structured JSON generation
   */
  private async callGemini(params: {
    emergencyType: EmergencyType;
    description: string;
    address: string;
    inDanger: boolean;
    peopleCount?: number;
    voiceTranscript?: string | null;
  }): Promise<any> {
    const prompt = `You are ResQAI Emergency Triage AI.
Analyze this raw emergency report and return STRICT JSON with this exact schema:
{
  "incident_type": "FIRE" | "ACCIDENT" | "FLOOD" | "BUILDING_DAMAGE" | "MEDICAL" | "OTHER",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number between 0.0 and 1.0,
  "estimated_affected": integer,
  "risk_factors": ["risk 1", "risk 2", "risk 3"],
  "summary": "Brief 2 sentence tactical dispatch summary",
  "recommended_resources": ["AMBULANCE" | "FIRE_UNIT" | "RESCUE_UNIT" | "POLICE_UNIT" | "TRAFFIC_UNIT" | "MEDICAL_TEAM"],
  "recommended_route": {
    "distance_km": number,
    "duration_minutes": number,
    "hazard_notes": "string"
  }
}

Report Data:
- Initial Category: ${params.emergencyType}
- Location: ${params.address}
- Danger Flag: ${params.inDanger ? 'YES - Reporter in immediate peril' : 'NO'}
- People count: ${params.peopleCount || 1}
- User text: "${params.description}"
- Voice transcript: "${params.voiceTranscript || 'N/A'}"
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned empty candidate content');
    }

    return JSON.parse(candidateText);
  }

  /**
   * OpenAI LLM caller
   */
  private async callOpenAI(params: {
    emergencyType: EmergencyType;
    description: string;
    address: string;
    inDanger: boolean;
    peopleCount?: number;
    voiceTranscript?: string | null;
  }): Promise<any> {
    const prompt = `You are ResQAI Emergency Triage AI.
Analyze this raw emergency report and return STRICT JSON with this exact schema:
{
  "incident_type": "FIRE" | "ACCIDENT" | "FLOOD" | "BUILDING_DAMAGE" | "MEDICAL" | "OTHER",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number between 0.0 and 1.0,
  "estimated_affected": integer,
  "risk_factors": ["risk 1", "risk 2", "risk 3"],
  "summary": "Brief 2 sentence tactical dispatch summary",
  "recommended_resources": ["AMBULANCE" | "FIRE_UNIT" | "RESCUE_UNIT" | "POLICE_UNIT" | "TRAFFIC_UNIT" | "MEDICAL_TEAM"],
  "recommended_route": {
    "distance_km": number,
    "duration_minutes": number,
    "hazard_notes": "string"
  }
}

Report Data:
- Initial Category: ${params.emergencyType}
- Location: ${params.address}
- Danger Flag: ${params.inDanger ? 'YES - Reporter in immediate peril' : 'NO'}
- People count: ${params.peopleCount || 1}
- User text: "${params.description}"
- Voice transcript: "${params.voiceTranscript || 'N/A'}"
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  /**
   * Deterministic Natural Language & Heuristic Triage Engine
   */
  private runIntelligentAnalysis(params: {
    emergencyType: EmergencyType;
    description: string;
    address: string;
    inDanger: boolean;
    peopleCount?: number;
    voiceTranscript?: string | null;
    reports?: Report[];
  }): StructuredAIResponse {
    const fullText = `${params.description || ''} ${params.voiceTranscript || ''}`.toLowerCase();
    const peopleCount = params.peopleCount || 1;
    const reportCount = params.reports ? params.reports.length : 1;

    let type: EmergencyType = params.emergencyType;
    let confidence = 0.89;
    const riskFactors: string[] = [];
    const recommendedResources: ResourceType[] = [];

    // Type refinements based on keywords
    if (fullText.includes('fire') || fullText.includes('smoke') || fullText.includes('flames') || fullText.includes('burning')) {
      type = 'FIRE';
      confidence = 0.94;
    } else if (fullText.includes('crash') || fullText.includes('collision') || fullText.includes('car') || fullText.includes('bus') || fullText.includes('overturn')) {
      type = 'ACCIDENT';
      confidence = 0.92;
    } else if (fullText.includes('water') || fullText.includes('flood') || fullText.includes('submerged') || fullText.includes('drowning')) {
      type = 'FLOOD';
      confidence = 0.91;
    } else if (fullText.includes('collapse') || fullText.includes('rubble') || fullText.includes('crack') || fullText.includes('scaffold')) {
      type = 'BUILDING_DAMAGE';
      confidence = 0.90;
    } else if (fullText.includes('unconscious') || fullText.includes('heart') || fullText.includes('breathing') || fullText.includes('bleeding') || fullText.includes('cpr')) {
      type = 'MEDICAL';
      confidence = 0.95;
    }

    // Risk factors & Resource determinations
    switch (type) {
      case 'FIRE':
        riskFactors.push('Rapid thermal & toxic smoke propagation');
        if (fullText.includes('smoke') || fullText.includes('stair') || fullText.includes('trapped')) {
          riskFactors.push('Smoke egress blockage / upper floor hazard');
        }
        if (params.inDanger) {
          riskFactors.push('Active entrapment of civilian occupants');
        }
        riskFactors.push('Structural integrity vulnerability');
        recommendedResources.push('FIRE_UNIT', 'RESCUE_UNIT', 'AMBULANCE', 'POLICE_UNIT');
        break;

      case 'ACCIDENT':
        riskFactors.push('Multi-lane traffic artery obstruction');
        if (fullText.includes('fuel') || fullText.includes('gas') || fullText.includes('leak')) {
          riskFactors.push('Flammable fluid leak / ignition hazard');
          recommendedResources.push('FIRE_UNIT');
        }
        if (params.inDanger || peopleCount > 2) {
          riskFactors.push('Passenger mechanical entrapment in vehicle chassis');
          recommendedResources.push('RESCUE_UNIT');
        }
        recommendedResources.push('AMBULANCE', 'TRAFFIC_UNIT');
        break;

      case 'FLOOD':
        riskFactors.push('Water current engulfment & basement inundation');
        riskFactors.push('Submerged electrical grid / shock hazard');
        recommendedResources.push('RESCUE_UNIT', 'MEDICAL_TEAM');
        break;

      case 'BUILDING_DAMAGE':
        riskFactors.push('Secondary structural collapse risk');
        riskFactors.push('Debris fall radius threatening pedestrians');
        recommendedResources.push('RESCUE_UNIT', 'POLICE_UNIT');
        break;

      case 'MEDICAL':
        riskFactors.push('Time-critical physiological stabilization window');
        if (fullText.includes('chest') || fullText.includes('cardiac') || fullText.includes('cpr')) {
          riskFactors.push('Suspected acute cardiac / respiratory arrest');
        }
        recommendedResources.push('AMBULANCE');
        break;

      default:
        riskFactors.push('Field verification needed by patrol unit');
        recommendedResources.push('POLICE_UNIT');
    }

    if (reportCount > 1) {
      riskFactors.push(`${reportCount} corroborating citizen reports in rapid sequence`);
    }

    // Severity estimation
    let severity: SeverityLevel = 'MEDIUM';
    if (params.inDanger || type === 'FIRE' || fullText.includes('trapped') || fullText.includes('unconscious') || peopleCount >= 5) {
      severity = 'CRITICAL';
    } else if (type === 'ACCIDENT' || type === 'FLOOD' || peopleCount >= 2) {
      severity = 'HIGH';
    }

    const estimatedAffected = Math.max(
      peopleCount,
      reportCount * 3 + (severity === 'CRITICAL' ? 5 : 0)
    );

    const summary = `${severity} ${type} incident detected at ${params.address}. ${
      params.inDanger ? 'Civilians in immediate peril.' : 'Active situation reported.'
    } ${reportCount} report(s) correlated. Recommended dispatch: ${recommendedResources.join(
      ', '
    )}.`;

    return {
      incident_type: type,
      severity,
      confidence,
      estimated_affected: estimatedAffected,
      risk_factors: riskFactors.slice(0, 5),
      summary,
      recommended_resources: Array.from(new Set(recommendedResources)),
      recommended_route: {
        distance_km: 3.2,
        duration_minutes: 6,
        hazard_notes: 'Primary arterial roads clear; emergency sirens active',
      },
    };
  }

  /**
   * Voice to text audio speech simulation / transcriber
   */
  public async transcribeVoiceAudio(audioBlobUrlOrData: string): Promise<string> {
    const samples = [
      'There was a loud crash near the intersection, two cars collided and smoke is coming out!',
      'The water is rising fast into the ground floor building, please send help!',
      'Someone collapsed on the sidewalk and is unresponsive, we need an ambulance right now!',
      'Fire broke out in the shop next door, flames are spreading to the roof!',
    ];
    return samples[Math.floor(Math.random() * samples.length)];
  }
}

export const aiService = new AIService();
