import { createClient } from '@supabase/supabase-js';
import { Incident } from '../types';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function fetchIncidentsFromSupabase(): Promise<Incident[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('reportedAt', { ascending: false });

    if (error) {
      console.warn('Supabase fetch notice (falling back to local):', error.message);
      return null;
    }

    if (Array.isArray(data)) {
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        location: item.location,
        suburb: item.suburb || undefined,
        landmark: item.landmark || undefined,
        urgency: item.urgency,
        description: item.description,
        reportedAt: item.reported_at || item.reportedAt,
        status: item.status,
        reportedBy: item.reported_by || item.reportedBy,
        duplicateOfId: item.duplicate_of_id || item.duplicateOfId,
        votes: item.votes || 0,
        lat: item.lat ? Number(item.lat) : undefined,
        lng: item.lng ? Number(item.lng) : undefined,
        languageCode: item.language_code || item.languageCode || 'en',
      }));
    }
  } catch (err) {
    console.error('Error fetching incidents from Supabase:', err);
  }
  return null;
}

export async function saveIncidentToSupabase(incident: Incident): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: incident.id,
      title: incident.title,
      category: incident.category,
      location: incident.location,
      suburb: incident.suburb || null,
      landmark: incident.landmark || null,
      urgency: incident.urgency,
      description: incident.description,
      reported_at: incident.reportedAt,
      status: incident.status,
      reported_by: incident.reportedBy || 'Resident AI Questionnaire',
      duplicate_of_id: incident.duplicateOfId || null,
      votes: incident.votes || 0,
      lat: incident.lat || null,
      lng: incident.lng || null,
      language_code: incident.languageCode || 'en',
    };

    const { error } = await supabase.from('incidents').upsert([payload]);
    if (error) {
      console.warn('Supabase save error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed saving incident to Supabase:', err);
    return false;
  }
}

export async function updateIncidentStatusInSupabase(
  id: string,
  status: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('incidents')
      .update({ status })
      .eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error updating status in Supabase:', err);
    return false;
  }
}

export async function deleteIncidentFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error deleting incident from Supabase:', err);
    return false;
  }
}

/*
Supabase Table Migration SQL Schema for Reference:

CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  suburb TEXT,
  landmark TEXT,
  urgency TEXT NOT NULL,
  description TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open',
  reported_by TEXT,
  duplicate_of_id TEXT,
  votes INT DEFAULT 0,
  lat NUMERIC,
  lng NUMERIC,
  language_code VARCHAR(10) DEFAULT 'en'
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read and write" ON public.incidents FOR ALL USING (true);
*/
