import React from 'react';
import {
  Cpu,
  RefreshCw,
  PlusCircle,
  FileCode2,
  Database,
  MapPin,
  Globe,
  DatabaseZap,
  Sparkles,
} from 'lucide-react';
import { SALanguageCode } from '../types';
import { SA_LANGUAGES, getTranslation } from '../lib/i18n';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  totalIncidents: number;
  duplicateCount: number;
  highUrgencyCount: number;
  activeTab: 'analyzer' | 'database' | 'map' | 'prompt_spec';
  setActiveTab: (tab: 'analyzer' | 'database' | 'map' | 'prompt_spec') => void;
  onResetSeed: () => void;
  onOpenAddModal: () => void;
  currentLanguage: SALanguageCode;
  onLanguageChange: (lang: SALanguageCode) => void;
}

export function Header({
  totalIncidents,
  duplicateCount,
  highUrgencyCount,
  activeTab,
  setActiveTab,
  onResetSeed,
  onOpenAddModal,
  currentLanguage,
  onLanguageChange,
}: HeaderProps) {
  const t = getTranslation(currentLanguage);

  return (
    <header className="sticky top-0 z-30 bg-[#070f1e]/95 backdrop-blur-md text-white border-b border-[#162a4a] shadow-xl shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* BLVNK Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f2fe] to-[#0072ff] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <img
                src="/logo.jpg"
                alt="BLVNK Tech Solutions Logo"
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/20 shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-base sm:text-xl blvnk-gradient-text">
                  BLVNK Tech Solutions
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
                  Groq Qwen 2.5 AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* 11 SA Languages Dropdown & Supabase Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Supabase Status */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}
              title={
                isSupabaseConfigured
                  ? 'Connected to live Supabase Postgres backend'
                  : 'Operating in local browser database with Supabase fallback'
              }
            >
              <DatabaseZap className="w-3.5 h-3.5" />
              <span>
                {isSupabaseConfigured ? t.supabaseConnected : t.supabaseLocal}
              </span>
            </div>

            {/* 11 SA Languages Selector */}
            <div className="flex items-center space-x-1 bg-[#0c182e] border border-[#162a4a] rounded-xl px-2 sm:px-3 py-1">
              <Globe className="w-4 h-4 text-[#00f2fe]" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SALanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer py-1 max-w-[110px] sm:max-w-none"
              >
                {SA_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-[#070f1e] text-white"
                  >
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold blvnk-gradient-btn text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.reportIncidentBtn}</span>
            </button>

            <button
              onClick={onResetSeed}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#162a4a] transition"
              title={t.resetDatabase}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.resetDatabase}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Responsive Scrollable Bar */}
        <div className="flex space-x-2 border-t border-[#162a4a]/80 pt-1.5 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'analyzer'
                ? 'blvnk-gradient-btn text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c182e]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#00f2fe]" />
            <span>{t.tabQuestionnaire}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'blvnk-gradient-btn text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c182e]'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{t.tabMap}</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'database'
                ? 'blvnk-gradient-btn text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c182e]'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>
              {t.tabDatabase} ({totalIncidents})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prompt_spec')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === 'prompt_spec'
                ? 'blvnk-gradient-btn text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c182e]'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-amber-400" />
            <span>{t.tabPromptSpec}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
