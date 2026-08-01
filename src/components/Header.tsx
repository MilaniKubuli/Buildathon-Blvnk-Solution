import React from 'react';
import {
  ShieldAlert,
  Cpu,
  RefreshCw,
  PlusCircle,
  FileCode2,
  Database,
  Search,
  MapPin,
} from 'lucide-react';

interface HeaderProps {
  totalIncidents: number;
  duplicateCount: number;
  highUrgencyCount: number;
  activeTab: 'analyzer' | 'database' | 'map' | 'prompt_spec';
  setActiveTab: (tab: 'analyzer' | 'database' | 'map' | 'prompt_spec') => void;
  onResetSeed: () => void;
  onOpenAddModal: () => void;
}

export function Header({
  totalIncidents,
  duplicateCount,
  highUrgencyCount,
  activeTab,
  setActiveTab,
  onResetSeed,
  onOpenAddModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & AI Engine Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-base text-white shadow-sm">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold tracking-tight text-base sm:text-lg text-white">
                  CIVIC-AI Dispatch Reasoning Engine
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-900/50 text-blue-200 border border-blue-700 uppercase">
                  MUN-8842-X
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                AGENT_ID: MUN-8842-X | STATUS: ACTIVE_DISPATCH_REASONING
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center space-x-6 text-xs border-x border-slate-800 px-6 py-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-widest font-bold">
                Active Registry
              </span>
              <span className="font-bold text-slate-200 text-xs font-mono">
                {totalIncidents} INCIDENTS
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-widest font-bold">
                High Priority
              </span>
              <span className="font-bold text-rose-400 text-xs font-mono">
                {highUrgencyCount} URGENT
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-widest font-bold">
                Duplicates Flagged
              </span>
              <span className="font-bold text-amber-400 text-xs font-mono">
                {duplicateCount} MATCHES
              </span>
            </div>
          </div>

          {/* Controls & Reset */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title="Add a custom incident directly to existing database"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Incident</span>
            </button>

            <button
              onClick={onResetSeed}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Reset sample incidents to initial state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-t border-slate-800/80 pt-1 pb-2">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'analyzer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Reasoning Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>Real-Time Map</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Incident Log ({totalIncidents})</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt_spec')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'prompt_spec'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prompt & Schema Spec</span>
          </button>
        </div>
      </div>
    </header>
  );
}
