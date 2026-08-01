import React, { useState, useEffect } from 'react';
import {
  IncidentCategory,
  UrgencyLevel,
  Incident,
  SALanguageCode,
  AnalysisResult,
} from '../types';
import { SA_LANGUAGES, detectSALanguage, getTranslation } from '../lib/i18n';
import {
  Sparkles,
  MapPin,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Send,
  Languages,
  ChevronRight,
  ArrowLeft,
  Search,
  Navigation,
  BrainCircuit,
  Layers,
  Check,
} from 'lucide-react';
import L from 'leaflet';

interface QuestionnaireWizardProps {
  currentLanguage: SALanguageCode;
  onLanguageChange: (lang: SALanguageCode) => void;
  existingIncidents: Incident[];
  onAddTicket: (ticket: Incident) => void;
  onLinkDuplicate: (text: string, matchedId: string) => void;
}

export function QuestionnaireWizard({
  currentLanguage,
  onLanguageChange,
  existingIncidents,
  onAddTicket,
  onLinkDuplicate,
}: QuestionnaireWizardProps) {
  const t = getTranslation(currentLanguage);

  // Step State (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [reportText, setReportText] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('water_leak');
  const [severity, setSeverity] = useState<UrgencyLevel>('medium');

  // Category specific answers
  const [qAnswers, setQAnswers] = useState<Record<string, string>>({
    flowRate: 'gushing',
    trafficHazard: 'yes',
    affectedRange: 'suburb',
  });

  // Location State
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [landmark, setLandmark] = useState('');
  const [lat, setLat] = useState<number>(-26.1952); // Default Johannesburg
  const [lng, setLng] = useState<number>(28.034);

  // AI & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string>('');

  // Leaflet map setup for Step 3
  useEffect(() => {
    if (step !== 3) return;

    const mapContainer = document.getElementById('questionnaire-map');
    if (!mapContainer) return;

    // Clean old Leaflet instance if present
    const existingMap = (mapContainer as any)._leaflet_id;
    if (existingMap) return;

    const map = L.map('questionnaire-map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragend', (event) => {
      const position = event.target.getLatLng();
      setLat(Number(position.lat.toFixed(5)));
      setLng(Number(position.lng.toFixed(5)));
    });

    map.on('click', (e) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      marker.setLatLng([newLat, newLng]);
      setLat(Number(newLat.toFixed(5)));
      setLng(Number(newLng.toFixed(5)));
    });

    return () => {
      map.remove();
    };
  }, [step]);

  // Auto detect language from report text in Step 1
  const handleReportTextChange = (text: string) => {
    setReportText(text);
    if (text.trim().length > 6) {
      const detected = detectSALanguage(text);
      if (detected !== currentLanguage) {
        onLanguageChange(detected);
      }
    }
  };

  // Step 4: Run Groq Qwen AI Analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const fullPromptText = `
Report Text: ${reportText}
Category Selected: ${category}
Address: ${address || 'Not specified'}
Suburb/Ward: ${suburb || 'Not specified'}
Landmark: ${landmark || 'Not specified'}
Location Coordinates: Lat ${lat}, Lng ${lng}
Diagnostic Answers: ${JSON.stringify(qAnswers)}
`;

    try {
      const res = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newReport: fullPromptText,
          existingIncidents,
          languageCode: currentLanguage,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze report');
      }

      setAnalysisResult(json.data);

      if (json.data.category) {
        setCategory(json.data.category);
      }
      if (json.data.urgency) {
        setSeverity(json.data.urgency);
      }
      if (json.data.location && !address) {
        setAddress(json.data.location);
      }

      setStep(4);
    } catch (err: any) {
      setAnalysisError(err.message || 'Error running Qwen AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get current GPS
  const handleGetGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(5)));
          setLng(Number(pos.coords.longitude.toFixed(5)));
        },
        (err) => {
          alert('Could not retrieve GPS location: ' + err.message);
        }
      );
    }
  };

  // Final Submit
  const handleFinalSubmit = () => {
    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: Incident = {
      id: newId,
      title: `${category.replace('_', ' ').toUpperCase()} at ${suburb || address || 'Location'}`,
      category,
      location: [address, suburb, landmark].filter(Boolean).join(', ') || 'Custom Pin Location',
      suburb: suburb || undefined,
      landmark: landmark || undefined,
      urgency: severity,
      description: reportText || 'Report submitted via Municipal AI Questionnaire.',
      reportedAt: new Date().toISOString(),
      status: 'open',
      reportedBy: 'Resident Questionnaire',
      lat,
      lng,
      languageCode: currentLanguage,
    };

    onAddTicket(newTicket);
    setSubmittedTicketId(newId);
    setIsSubmitted(true);
    setStep(5);
  };

  // Reset form
  const handleReset = () => {
    setStep(1);
    setReportText('');
    setAddress('');
    setSuburb('');
    setLandmark('');
    setAnalysisResult(null);
    setIsSubmitted(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Wizard Progress Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>Step {step} of 5 • Groq Qwen AI Questionnaire</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {step === 1 && t.step1Title}
              {step === 2 && t.step2Title}
              {step === 3 && t.step3Title}
              {step === 4 && t.step4Title}
              {step === 5 && t.step5Title}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {step === 1 && t.step1Subtitle}
              {step === 2 && t.step2Subtitle}
              {step === 3 && t.step3Subtitle}
              {step === 4 && t.step4Subtitle}
              {step === 5 && t.step5Subtitle}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50'
                    : s < step
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: Language & Natural Language Complaint */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Language Selection Header */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-3">
              <Languages className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {t.languageDetected}
                </span>
                <span className="text-sm font-bold text-white">
                  {SA_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName} (
                  {SA_LANGUAGES.find((l) => l.code === currentLanguage)?.name})
                </span>
              </div>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SALanguageCode)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {SA_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Free-text input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Describe the Municipal Issue in your preferred language:</span>
              <span className="text-xs text-blue-400 font-normal">
                Auto-detects all 11 SA official languages
              </span>
            </label>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => handleReportTextChange(e.target.value)}
              placeholder="e.g. Amanzi ayaphuma emgwaqweni e-Jan Smuts Ave kufuphi ne-garage..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              disabled={!reportText.trim()}
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <span>{t.nextStep}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Guided Category & Diagnostic Questionnaire */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Category Picker */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">
              Select Incident Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'water_leak', name: t.catWaterLeak, icon: '💧' },
                { id: 'electricity_outage', name: t.catElectricity, icon: '⚡' },
                { id: 'pothole_traffic', name: t.catPothole, icon: '🚗' },
                { id: 'illegal_dumping', name: t.catDumping, icon: '🗑️' },
                { id: 'sewage_overflow', name: t.catSewage, icon: '⚠️' },
                { id: 'fallen_tree', name: t.catFallenTree, icon: '🌳' },
                { id: 'missing_manhole', name: t.catMissingManhole, icon: '🕳️' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as IncidentCategory)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                    category === cat.id
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-semibold">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Question Prompts */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">
              Diagnostic Context Questionnaire:
            </h3>

            {category === 'water_leak' && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Water Leak Flow Intensity:
                  </label>
                  <select
                    value={qAnswers.flowRate}
                    onChange={(e) =>
                      setQAnswers({ ...qAnswers, flowRate: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5"
                  >
                    <option value="trickle">Minor Slow Trickle</option>
                    <option value="gushing">Heavy Burst Stream across road</option>
                    <option value="flooding">High Pressure Geyser / Home Flooding</option>
                  </select>
                </div>
              </div>
            )}

            {category === 'pothole_traffic' && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-slate-400 block mb-1">Pothole Hazard Severity:</label>
                  <select
                    value={qAnswers.trafficHazard}
                    onChange={(e) =>
                      setQAnswers({ ...qAnswers, trafficHazard: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5"
                  >
                    <option value="high">Deep Crater - Immediate Wheel Damage</option>
                    <option value="medium">Medium Pothole - Swerving Risk</option>
                    <option value="low">Surface Cracking</option>
                  </select>
                </div>
              </div>
            )}

            {category === 'electricity_outage' && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-slate-400 block mb-1">Outage Coverage Scope:</label>
                  <select
                    value={qAnswers.affectedRange}
                    onChange={(e) =>
                      setQAnswers({ ...qAnswers, affectedRange: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5"
                  >
                    <option value="suburb">Entire Suburb / Ward Blackout</option>
                    <option value="street">Single Street / Cable Cut</option>
                    <option value="single">Single Household Meter</option>
                  </select>
                </div>
              </div>
            )}

            {/* Severity level picker */}
            <div>
              <label className="text-slate-400 block mb-1">Perceived Urgency Level:</label>
              <div className="flex space-x-3">
                {[
                  { id: 'low', label: t.urgencyLow, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500' },
                  { id: 'medium', label: t.urgencyMedium, color: 'bg-amber-500/20 text-amber-400 border-amber-500' },
                  { id: 'high', label: t.urgencyHigh, color: 'bg-rose-500/20 text-rose-400 border-rose-500' },
                ].map((urg) => (
                  <button
                    key={urg.id}
                    onClick={() => setSeverity(urg.id as UrgencyLevel)}
                    className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                      severity === urg.id
                        ? `${urg.color} ring-2 ring-slate-400`
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {urg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.prevStep}</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <span>{t.nextStep}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location Refinement & Map Pin Dragging */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Address Details Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {t.addressLabel}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {t.suburbLabel}
                </label>
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder={t.suburbPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {t.landmarkLabel}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={t.landmarkPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-mono">
                  <span>Selected Pin GPS:</span>
                  <span className="text-blue-400">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                </div>
                <button
                  onClick={handleGetGps}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center justify-center space-x-2 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t.useCurrentGps}</span>
                </button>
              </div>
            </div>

            {/* Interactive Leaflet/Google Pin Map */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{t.dragPinInstruction}</span>
              </label>
              <div
                id="questionnaire-map"
                className="w-full h-64 sm:h-72 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.prevStep}</span>
            </button>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing with Groq Qwen AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>{t.runQwenAnalysis} →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Groq Qwen AI Analysis & Duplicate Reasoner */}
      {step === 4 && analysisResult && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-lg">
                  Groq Qwen 2.5 Structured AI Insights
                </h3>
              </div>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                Model: {analysisResult.ai_model || 'qwen-2.5-32b'}
              </span>
            </div>

            {/* Extracted Card Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-semibold block">
                  Category Extracted
                </span>
                <span className="text-sm font-bold text-slate-200 mt-1 block">
                  {analysisResult.category || category}
                </span>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-semibold block">
                  Assessed Urgency
                </span>
                <span
                  className={`text-sm font-bold mt-1 uppercase block ${
                    analysisResult.urgency === 'high'
                      ? 'text-rose-400'
                      : analysisResult.urgency === 'medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {analysisResult.urgency}
                </span>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-semibold block">
                  Language Detected
                </span>
                <span className="text-sm font-bold text-blue-400 mt-1 block">
                  {analysisResult.detected_language?.name || currentLanguage}
                </span>
              </div>
            </div>

            {/* Short Summary & Translation */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  1-Sentence Objective Summary:
                </span>
                <p className="text-slate-200 text-sm font-medium">
                  {analysisResult.short_summary}
                </p>
              </div>

              {analysisResult.english_translation && (
                <div className="p-4 bg-blue-950/30 rounded-xl border border-blue-900/40">
                  <span className="text-xs font-semibold text-blue-400 block mb-1">
                    English Translation for Municipal Operators:
                  </span>
                  <p className="text-slate-300 text-sm">
                    {analysisResult.english_translation}
                  </p>
                </div>
              )}
            </div>

            {/* Zero-Hallucination Duplicate reasoning */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                {analysisResult.possible_duplicate ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <span className="text-sm font-bold text-white">
                  {analysisResult.possible_duplicate
                    ? 'Possible Existing Incident Duplicate Flagged'
                    : 'No Duplicate Found - Unique Report'}
                </span>
              </div>
              {analysisResult.duplicate_reasoning && (
                <p className="text-xs text-slate-400">
                  {analysisResult.duplicate_reasoning}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.prevStep}</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{t.submitToSupabase}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success & Supabase Confirmation */}
      {step === 5 && isSubmitted && (
        <div className="bg-emerald-950/30 border border-emerald-800/50 p-8 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-2xl font-bold text-white">
            Incident Successfully Dispatched!
          </h3>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Your report has been analyzed by Groq Qwen 2.5 and securely saved to the
            Supabase municipal database.
          </p>

          <div className="p-3 bg-slate-950 max-w-xs mx-auto rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
            Tracking ID: #{submittedTicketId}
          </div>

          <div className="pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
