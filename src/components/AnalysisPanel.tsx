import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Check,
  AlertTriangle,
  HelpCircle,
  MapPin,
  Merge,
  PlusCircle,
  Terminal,
  RotateCcw,
  Zap,
  HelpCircle as QuestionIcon,
  BrainCircuit,
} from 'lucide-react';
import {
  Incident,
  AnalysisResult,
  AnalysisResponse,
  SamplePreset,
  SALanguageCode,
} from '../types';
import { CategoryBadge } from './CategoryBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { QuestionnaireWizard } from './QuestionnaireWizard';
import { SA_LANGUAGES, getTranslation } from '../lib/i18n';

interface AnalysisPanelProps {
  existingIncidents: Incident[];
  onAddTicket: (newIncident: Incident) => void;
  onLinkDuplicate: (newReportText: string, matchedId: string) => void;
  currentLanguage: SALanguageCode;
  onLanguageChange: (lang: SALanguageCode) => void;
}

export function AnalysisPanel({
  existingIncidents,
  onAddTicket,
  onLinkDuplicate,
  currentLanguage,
  onLanguageChange,
}: AnalysisPanelProps) {
  const t = getTranslation(currentLanguage);

  // View Mode: 'wizard' (Guided Questionnaire) or 'quick_analyze'
  const [viewMode, setViewMode] = useState<'wizard' | 'quick_analyze'>('wizard');

  const [reportText, setReportText] = useState(
    'Amanzi ayaphuma emgwaqweni e-Jan Smuts Ave Rosebank kufuphi ne-garage.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleRunAnalysis = async (textToAnalyze?: string) => {
    const input = (textToAnalyze || reportText).trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setActionSuccessMsg(null);

    try {
      const res = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newReport: input,
          existingIncidents: existingIncidents,
          languageCode: currentLanguage,
        }),
      });

      const data: AnalysisResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze report.');
      }

      setAnalysisResponse(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred while calling Groq Qwen AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewTicketFromAnalysis = () => {
    if (!analysisResponse?.data) return;
    const result = analysisResponse.data;

    const baseLat = -26.1952;
    const baseLng = 28.034;
    const randomLat = baseLat + (Math.random() - 0.5) * 0.03;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.03;

    const newInc: Incident = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: result.short_summary || 'Municipal Report',
      category: result.category || 'water_leak',
      location: result.location || 'Johannesburg Metro',
      suburb: result.suburb || undefined,
      landmark: result.landmark || undefined,
      urgency: result.urgency || 'medium',
      description: reportText,
      reportedAt: new Date().toISOString(),
      status: 'open',
      reportedBy: 'Groq Qwen Citizen Dispatch',
      lat: Number(randomLat.toFixed(4)),
      lng: Number(randomLng.toFixed(4)),
      languageCode: currentLanguage,
    };

    onAddTicket(newInc);
    setActionSuccessMsg(`Created ticket ${newInc.id} successfully in Supabase & local DB!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const result = analysisResponse?.data;

  const matchedIncidentsList = existingIncidents.filter((inc) =>
    result?.matched_incident_ids?.includes(inc.id)
  );

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('wizard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'wizard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Guided Questionnaire Wizard (Recommended)</span>
          </button>

          <button
            onClick={() => setViewMode('quick_analyze')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'quick_analyze'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Raw Text Groq Qwen Analyzer</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Groq Qwen 2.5 Active</span>
        </div>
      </div>

      {/* VIEW MODE 1: Questionnaire Wizard */}
      {viewMode === 'wizard' && (
        <QuestionnaireWizard
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          existingIncidents={existingIncidents}
          onAddTicket={onAddTicket}
          onLinkDuplicate={onLinkDuplicate}
        />
      )}

      {/* VIEW MODE 2: Raw Text Qwen Analyzer */}
      {viewMode === 'quick_analyze' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">
                    Multi-Lingual Community Report Ingestion
                  </h2>
                  <p className="text-xs text-slate-400">
                    Input complaints in any of South Africa's 11 official languages for Groq Qwen AI analysis
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReportText('')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Text Area Input */}
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Type complaint in isiZulu, isiXhosa, Afrikaans, Sepedi, Setswana, English, etc..."
              className="w-full p-4 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Groq Qwen 2.5 Model Engine</span>
              </div>

              <button
                onClick={() => handleRunAnalysis()}
                disabled={loading || !reportText.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg flex items-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing with Groq Qwen...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Qwen AI Analysis</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Display */}
          {result && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Groq Qwen 2.5 Extracted Insights
                  </h3>
                  <p className="text-xs text-slate-400">
                    Processed in {analysisResponse?.processingTimeMs}ms • Model: {result.ai_model || 'qwen-2.5-32b'}
                  </p>
                </div>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-300 font-mono"
                >
                  {showRawJson ? 'Hide JSON' : 'View JSON'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    Category
                  </span>
                  <div className="mt-1">
                    <CategoryBadge category={result.category} size="sm" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    Location
                  </span>
                  <span className="text-sm font-semibold text-white mt-1 block">
                    {result.location || 'Vague location'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    Language Detected
                  </span>
                  <span className="text-sm font-bold text-blue-400 mt-1 block">
                    {result.detected_language?.name || currentLanguage}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">
                  Short Summary:
                </span>
                <p className="text-slate-200 text-sm font-medium">
                  {result.short_summary}
                </p>
                {result.english_translation && (
                  <p className="text-blue-300 text-xs pt-1 border-t border-slate-800/60">
                    <strong>English Translation:</strong> {result.english_translation}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCreateNewTicketFromAnalysis}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Dispatch Ticket to Supabase</span>
                </button>
              </div>

              {showRawJson && (
                <pre className="p-4 bg-slate-950 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
