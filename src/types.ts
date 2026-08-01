export type IncidentCategory =
  | 'water_leak'
  | 'electricity_outage'
  | 'pothole_traffic'
  | 'illegal_dumping'
  | 'sewage_overflow'
  | 'fallen_tree'
  | 'missing_manhole';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'duplicate';

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  location: string;
  urgency: UrgencyLevel;
  description: string;
  reportedAt: string;
  status: TicketStatus;
  reportedBy?: string;
  duplicateOfId?: string;
  votes?: number;
  lat?: number;
  lng?: number;
}

export interface AnalysisResult {
  category: IncidentCategory | null;
  location: string | null;
  urgency: UrgencyLevel;
  short_summary: string;
  clarification_question: string | null;
  possible_duplicate: boolean;
  matched_incident_ids: string[];
  duplicate_reasoning: string | null;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  rawResponse?: string;
  error?: string;
  processingTimeMs?: number;
  promptUsed?: {
    systemInstruction: string;
    newReport: string;
    existingIncidents: Incident[];
  };
}

export interface SamplePreset {
  id: string;
  label: string;
  badge: string;
  description: string;
  reportText: string;
}
