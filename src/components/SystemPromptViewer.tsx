import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, Sparkles, ShieldCheck } from 'lucide-react';

export function SystemPromptViewer() {
  const [copied, setCopied] = useState(false);

  const systemInstructionText = `You are an intelligent, analytical municipal dispatch AI assistant.
Analyze the input text ("New_Report") and compare it against the provided JSON array ("Existing_Incidents"). Extract the location, assess the urgency (low, medium, high), and categorize the incident into one of these exact strings: "water_leak", "electricity_outage", "pothole_traffic", "illegal_dumping", "sewage_overflow", "fallen_tree", or "missing_manhole". Identify if the new report is a possible duplicate based on overlapping locations and categories, and explain your reasoning. If the location or incident type is too vague, do not invent details; return null and formulate a relevant clarification question.

Format: Return ONLY a valid, raw JSON object using this exact schema:
{
  "category": "string or null",
  "location": "string or null",
  "urgency": "string",
  "short_summary": "string",
  "clarification_question": "string or null",
  "possible_duplicate": boolean,
  "matched_incident_ids": ["array of strings"],
  "duplicate_reasoning": "string or null"
}

Tone: Highly objective, logical, and strictly data-driven. Do not include conversational filler, markdown code blocks, or introductory text.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(systemInstructionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google AI Studio Prompt Specification
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Strict Schema Enforced
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                The exact prompt instruction and structural schema passed to Gemini 3.6 Flash for municipal report reasoning.
              </p>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Prompt Text</span>
              </>
            )}
          </button>
        </div>

        {/* System Prompt Box */}
        <div className="relative mt-4">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-xl border border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>system_instruction.txt</span>
            </div>
            <span className="text-[10px] uppercase bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">
              Gemini 3.6 Flash Engine
            </span>
          </div>
          <pre className="p-4 bg-slate-950 border border-t-0 border-slate-800 rounded-b-xl text-xs sm:text-sm text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-blue-500 selection:text-white">
            {systemInstructionText}
          </pre>
        </div>
      </div>

      {/* Contract & Schema Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Category Taxonomy</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Strictly categorizes inputs into exact municipal buckets: <code className="text-blue-600 font-mono">water_leak</code>, <code className="text-blue-600 font-mono">electricity_outage</code>, <code className="text-blue-600 font-mono">pothole_traffic</code>, <code className="text-blue-600 font-mono">illegal_dumping</code>, <code className="text-blue-600 font-mono">sewage_overflow</code>, <code className="text-blue-600 font-mono">fallen_tree</code>, or <code className="text-blue-600 font-mono">missing_manhole</code>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Hallucination Vague Handling</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            If the location or issue description lacks sufficient detail, the model returns <code className="text-amber-600 font-mono">null</code> for category/location and constructs an objective citizen clarification question.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400 font-semibold text-sm">
            <FileCode2 className="w-4 h-4" />
            <span>Duplicate Reasoner</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Compares <code className="text-purple-600 font-mono">New_Report</code> against <code className="text-purple-600 font-mono">Existing_Incidents</code> array, matching location proximity and issue overlap, returning matched incident IDs and logical reasoning text.
          </p>
        </div>
      </div>
    </div>
  );
}
