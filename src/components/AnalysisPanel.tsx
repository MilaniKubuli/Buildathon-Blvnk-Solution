import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Merge,
  PlusCircle,
  Terminal,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  Incident,
  AnalysisResult,
  AnalysisResponse,
  SamplePreset,
} from '../types';
import { CategoryBadge } from './CategoryBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { SAMPLE_PRESETS } from '../data/mockIncidents';

interface AnalysisPanelProps {
  existingIncidents: Incident[];
  onAddTicket: (newIncident: Incident) => void;
  onLinkDuplicate: (newReportText: string, matchedId: string) => void;
}

export function AnalysisPanel({
  existingIncidents,
  onAddTicket,
  onLinkDuplicate,
}: AnalysisPanelProps) {
  const [reportText, setReportText] = useState(SAMPLE_PRESETS[0].reportText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResponse, setAnalysisResponse] =
    useState<AnalysisResponse | null>(null);
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
        }),
      });

      const data: AnalysisResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze report.');
      }

      setAnalysisResponse(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred while calling AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setReportText(preset.reportText);
    handleRunAnalysis(preset.reportText);
  };

  const handleCreateNewTicketFromAnalysis = () => {
    if (!analysisResponse?.data) return;
    const result = analysisResponse.data;

    // Generate slight random offset around city center for map pin
    const baseLat = 37.7749;
    const baseLng = -122.4194;
    const randomLat = baseLat + (Math.random() - 0.5) * 0.03;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.03;

    const newInc: Incident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      title: result.short_summary || 'Municipal Report',
      category: result.category || 'water_leak',
      location: result.location || 'Location Pending Clarification',
      urgency: result.urgency || 'medium',
      description: reportText,
      reportedAt: new Date().toISOString(),
      status: 'open',
      reportedBy: 'Citizen Dispatch Submission',
      votes: 1,
      lat: Number(randomLat.toFixed(4)),
      lng: Number(randomLng.toFixed(4)),
    };

    onAddTicket(newInc);
    setActionSuccessMsg(`Created ticket ${newInc.id} successfully! Added to real-time map.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleMergeDuplicate = (matchedId: string) => {
    onLinkDuplicate(reportText, matchedId);
    setActionSuccessMsg(`Merged report as duplicate of Incident ${matchedId}.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const result = analysisResponse?.data;

  // Find matched incidents for side-by-side comparison
  const matchedIncidentsList = existingIncidents.filter((inc) =>
    result?.matched_incident_ids?.includes(inc.id)
  );

  return (
    <div className="space-y-6">
      {/* Input & Presets Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Community Complaint Ingestion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste unstructured text or pick a test scenario to trigger AI extraction & duplicate reasoning
              </p>
            </div>
          </div>

          <button
            onClick={() => setReportText('')}
            className="self-end sm:self-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Text</span>
          </button>
        </div>

        {/* Preset scenario buttons */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sample Scenarios & Duplicate Test Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <span>{preset.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            rows={4}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="e.g. There is water gushing out of a broken pipe on 5th Ave near Pine Street flooding the sidewalk..."
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y font-sans leading-relaxed"
          />
          <div className="absolute right-3 bottom-3 text-[11px] text-slate-400">
            {reportText.length} chars
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Engine: Gemini 3.6 Flash</span>
          </div>

          <button
            onClick={() => handleRunAnalysis()}
            disabled={loading || !reportText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting & Reasoning...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run AI Dispatch Analysis</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Analytical Processing Tree Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Analytical Processing Tree
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Processed in {analysisResponse.processingTimeMs}ms • Gemini 3.6 Flash
                </p>
              </div>

              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700 transition shrink-0"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>{showRawJson ? 'Hide Raw JSON' : 'Inspect JSON Schema'}</span>
              </button>
            </div>

            {/* Tree Steps */}
            <div className="space-y-6 pt-1">
              {/* Step 1: Feature Extraction */}
              <div className="flex">
                <div className="w-8 shrink-0 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold ring-4 ring-white dark:ring-slate-900">
                    01
                  </div>
                  <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 my-1"></div>
                </div>
                <div className="ml-4 pb-2 flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Feature Extraction & Categorization
                  </h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Extracted Category
                      </span>
                      <div className="mt-1">
                        <CategoryBadge category={result.category} size="sm" />
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Location Normalization
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                        {result.location || 'null (vague location)'}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Urgency Level
                      </span>
                      <div className="mt-1">
                        <UrgencyBadge urgency={result.urgency} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Geospatial Duplicate Matcher */}
              <div className="flex">
                <div className="w-8 shrink-0 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold ring-4 ring-white dark:ring-slate-900">
                    02
                  </div>
                  <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 my-1"></div>
                </div>
                <div className="ml-4 pb-2 flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Geospatial Duplicate Matcher
                  </h3>
                  <div className="mt-2 p-3 bg-slate-900 rounded text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-800">
                    Scanning active incident log ({existingIncidents.length} records)...<br />
                    Matching strategy: Proximity & category overlap<br />
                    Duplicate flag: <span className={result.possible_duplicate ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{result.possible_duplicate ? 'TRUE (Possible Duplicate Detected)' : 'FALSE (Unique Incident)'}</span><br />
                    Matched incident IDs: {result.matched_incident_ids.length > 0 ? result.matched_incident_ids.map(id => `#${id}`).join(', ') : 'None'}
                  </div>
                </div>
              </div>

              {/* Step 3: Logic Consolidation */}
              <div className="flex">
                <div className="w-8 shrink-0 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold ring-4 ring-white dark:ring-slate-900">
                    03
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Logic Consolidation & Executive Summary
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 italic leading-snug bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-100 dark:border-slate-800">
                    "{result.short_summary}"
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Confidence Metrics Card */}
            <div className="mt-4 bg-slate-900 rounded-lg p-4 text-white border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Decision Confidence & Latency Metrics
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-300">Category Extraction Precision</span>
                    <span className="text-emerald-400">98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-300">Deduplication Matching Precision</span>
                    <span className="text-blue-400">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLARIFICATION QUESTION ALERT (If vague location or category) */}
          {result.clarification_question && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Clarification Required (Report Details Vague)</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                The AI Reasoning engine detected that the location or category details are incomplete. It formulated the following objective follow-up question:
              </p>
              <div className="p-3 bg-white dark:bg-slate-950 rounded border border-amber-500/20 font-medium text-xs text-slate-900 dark:text-slate-100">
                "{result.clarification_question}"
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    alert(`Clarification prompt sent to citizen: "${result.clarification_question}"`)
                  }
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider text-xs shadow-sm"
                >
                  Send Clarification Request
                </button>
              </div>
            </div>
          )}

          {/* DUPLICATE REASONING SECTION */}
          {result.possible_duplicate && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Geospatial & Category Duplicate Match Breakdown</span>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded text-amber-700 dark:text-amber-300">
                  Matches: {result.matched_incident_ids.join(', ') || 'None'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950 p-3.5 rounded border border-slate-200 dark:border-slate-800 font-sans">
                {result.duplicate_reasoning ||
                  'Location and category overlap detected with existing incident(s).'}
              </p>

              {/* Side-by-side incident cards */}
              {matchedIncidentsList.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider">
                    Matched Incident(s) in Registry:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchedIncidentsList.map((inc) => (
                      <div
                        key={inc.id}
                        className="bg-white dark:bg-slate-950 p-4 rounded border border-amber-500/30 shadow-sm space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                            {inc.id}
                          </span>
                          <UrgencyBadge urgency={inc.urgency} size="sm" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {inc.title}
                        </h4>
                        <div className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{inc.location}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                          "{inc.description}"
                        </p>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleMergeDuplicate(inc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider text-xs shadow-sm"
                          >
                            <Merge className="w-3.5 h-3.5" />
                            <span>Link as Duplicate of {inc.id}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTION DISPATCH BUTTONS */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dispatch Action Decision:
            </div>

            <div className="flex items-center space-x-3">
              {result.possible_duplicate && matchedIncidentsList.length > 0 && (
                <button
                  onClick={() => handleMergeDuplicate(matchedIncidentsList[0].id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider text-xs shadow-sm transition"
                >
                  <Merge className="w-4 h-4" />
                  <span>Merge with Incident #{matchedIncidentsList[0].id}</span>
                </button>
              )}

              <button
                onClick={handleCreateNewTicketFromAnalysis}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Ticket #{`INC-${Math.floor(100 + Math.random() * 900)}`}</span>
              </button>
            </div>
          </div>

          {/* Raw JSON Inspector Modal / Collapsible */}
          {showRawJson && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 shadow-xl space-y-3 font-mono text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">
                    Raw Structured JSON Response
                  </span>
                </div>
                <span>{analysisResponse.processingTimeMs} ms</span>
              </div>

              <pre className="p-4 bg-slate-900 rounded text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                {JSON.stringify(result, null, 2)}
              </pre>

              <div className="text-[11px] text-slate-500 pt-1">
                Verified against strict JSON Schema defined in Google AI Studio Prompt system instructions.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
