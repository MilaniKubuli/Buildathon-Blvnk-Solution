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

export type SALanguageCode =
  | 'en'
  | 'zu'
  | 'xh'
  | 'af'
  | 'nso'
  | 'tn'
  | 'st'
  | 'ts'
  | 'ss'
  | 've'
  | 'nr';

export interface SALanguage {
  code: SALanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  location: string;
  suburb?: string;
  landmark?: string;
  urgency: UrgencyLevel;
  description: string;
  reportedAt: string;
  status: TicketStatus;
  reportedBy?: string;
  duplicateOfId?: string;
  votes?: number;
  lat?: number;
  lng?: number;
  languageCode?: SALanguageCode;
  aiConfidence?: number;
}

export interface DetectedLanguageInfo {
  code: SALanguageCode;
  name: string;
  confidence: number;
}

export interface AnalysisResult {
  category: IncidentCategory | null;
  location: string | null;
  suburb?: string | null;
  landmark?: string | null;
  urgency: UrgencyLevel;
  short_summary: string;
  english_translation?: string | null;
  clarification_question: string | null;
  possible_duplicate: boolean;
  matched_incident_ids: string[];
  duplicate_reasoning: string | null;
  detected_language?: DetectedLanguageInfo;
  ai_provider?: string;
  ai_model?: string;
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
  languageCode?: SALanguageCode;
}
