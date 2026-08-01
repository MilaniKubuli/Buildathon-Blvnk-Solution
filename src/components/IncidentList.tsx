import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Incident, IncidentCategory, UrgencyLevel, TicketStatus } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { UrgencyBadge } from './UrgencyBadge';

interface IncidentListProps {
  incidents: Incident[];
  onDeleteIncident: (id: string) => void;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onOpenAddModal: () => void;
  onSelectForComparison?: (incident: Incident) => void;
}

export function IncidentList({
  incidents,
  onDeleteIncident,
  onUpdateStatus,
  onOpenAddModal,
  onSelectForComparison,
}: IncidentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || inc.category === categoryFilter;

    const matchesUrgency =
      urgencyFilter === 'all' || inc.urgency === urgencyFilter;

    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, location, title, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="water_leak">Water Leak</option>
              <option value="electricity_outage">Electricity Outage</option>
              <option value="pothole_traffic">Pothole / Traffic</option>
              <option value="illegal_dumping">Illegal Dumping</option>
              <option value="sewage_overflow">Sewage Overflow</option>
              <option value="fallen_tree">Fallen Tree</option>
              <option value="missing_manhole">Missing Manhole</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Urgencies</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
              <option value="low">Low Urgency</option>
            </select>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Incidents */}
      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
            No matching incidents found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search terms or category filter, or add a new record to the municipal registry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition duration-200 hover:shadow-md flex flex-col justify-between ${
                selectedIncident?.id === inc.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {inc.id}
                  </span>
                  <UrgencyBadge urgency={inc.urgency} size="sm" />
                </div>

                {/* Title & Category */}
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-1">
                  {inc.title}
                </h3>

                <div className="mb-3">
                  <CategoryBadge category={inc.category} size="sm" />
                </div>

                {/* Location */}
                <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium line-clamp-2">{inc.location}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  "{inc.description}"
                </p>
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center text-slate-400 gap-1 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(inc.reportedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {inc.status !== 'resolved' ? (
                    <button
                      onClick={() => onUpdateStatus(inc.id, 'resolved')}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                      title="Mark as Resolved"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Resolved
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteIncident(inc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Incident"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
