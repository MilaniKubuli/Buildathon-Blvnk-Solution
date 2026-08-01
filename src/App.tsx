import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalysisPanel } from './components/AnalysisPanel';
import { IncidentList } from './components/IncidentList';
import { IncidentMap } from './components/IncidentMap';
import { SystemPromptViewer } from './components/SystemPromptViewer';
import { AddIncidentModal } from './components/AddIncidentModal';
import { INITIAL_INCIDENTS } from './data/mockIncidents';
import { Incident, TicketStatus } from './types';
import { ShieldCheck, Cpu, Database, FileCode2, Sparkles } from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_incidents_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed loading saved incidents:', e);
    }
    return INITIAL_INCIDENTS;
  });

  const [activeTab, setActiveTab] = useState<'analyzer' | 'map' | 'database' | 'prompt_spec'>('analyzer');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('municipal_incidents_db', JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed saving incidents to localStorage:', e);
    }
  }, [incidents]);

  const handleAddIncident = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateStatus = (id: string, status: TicketStatus) => {
    setIncidents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleLinkDuplicate = (newReportText: string, matchedId: string) => {
    const baseLat = 37.7749;
    const baseLng = -122.4194;
    const randomLat = baseLat + (Math.random() - 0.5) * 0.03;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.03;

    const dupTicket: Incident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      title: `Duplicate Report of #${matchedId}`,
      category: 'water_leak',
      location: 'Overlapping location',
      urgency: 'medium',
      description: newReportText,
      reportedAt: new Date().toISOString(),
      status: 'duplicate',
      duplicateOfId: matchedId,
      reportedBy: 'Citizen Ingestion',
      votes: 1,
      lat: Number(randomLat.toFixed(4)),
      lng: Number(randomLng.toFixed(4)),
    };

    setIncidents((prev) => [dupTicket, ...prev]);
  };

  const handleResetSeed = () => {
    if (confirm('Are you sure you want to reset the incidents database to initial seed data?')) {
      setIncidents(INITIAL_INCIDENTS);
      localStorage.removeItem('municipal_incidents_db');
    }
  };

  // Metrics calculation
  const totalIncidents = incidents.length;
  const duplicateCount = incidents.filter((i) => i.status === 'duplicate').length;
  const highUrgencyCount = incidents.filter((i) => i.urgency === 'high').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Header */}
      <Header
        totalIncidents={totalIncidents}
        duplicateCount={duplicateCount}
        highUrgencyCount={highUrgencyCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetSeed={handleResetSeed}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'analyzer' && (
          <AnalysisPanel
            existingIncidents={incidents}
            onAddTicket={handleAddIncident}
            onLinkDuplicate={handleLinkDuplicate}
          />
        )}

        {activeTab === 'map' && (
          <IncidentMap
            incidents={incidents}
            onUpdateStatus={handleUpdateStatus}
            onDeleteIncident={handleDeleteIncident}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'database' && (
          <IncidentList
            incidents={incidents}
            onDeleteIncident={handleDeleteIncident}
            onUpdateStatus={handleUpdateStatus}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'prompt_spec' && <SystemPromptViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">
              Municipal AI Dispatch Reasoner Active
            </span>
            <span className="text-slate-500">|</span>
            <span>Gemini 3.6 Flash Engine</span>
          </div>
          <div className="text-slate-500">
            Hyper-Local Utility Reporting MVP • Zero Hallucination Duplicate Reasoning
          </div>
        </div>
      </footer>

      {/* Add Incident Modal */}
      <AddIncidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddIncident}
      />
    </div>
  );
}
