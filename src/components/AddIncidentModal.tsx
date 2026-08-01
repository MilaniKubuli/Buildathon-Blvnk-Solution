'use client';

import React, { useState } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { Incident, IncidentCategory, UrgencyLevel } from '../types';

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newIncident: Incident) => void;
}

export function AddIncidentModal({
  isOpen,
  onClose,
  onAdd,
}: AddIncidentModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('water_leak');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Citizen Report');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) return;

    const baseLat = 37.7749;
    const baseLng = -122.4194;
    const randomLat = baseLat + (Math.random() - 0.5) * 0.03;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.03;

    const newInc: Incident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      category,
      location: location.trim(),
      urgency,
      description: description.trim(),
      reportedAt: new Date().toISOString(),
      status: 'open',
      reportedBy: reportedBy.trim() || 'Citizen',
      votes: 1,
      lat: Number(randomLat.toFixed(4)),
      lng: Number(randomLng.toFixed(4)),
    };

    onAdd(newInc);
    // Reset
    setTitle('');
    setLocation('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Existing Incident
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Insert a record into the municipal database to test duplicate detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              Incident Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Burst pipe on 4th street"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="water_leak">Water Leak</option>
                <option value="electricity_outage">Electricity Outage</option>
                <option value="pothole_traffic">Pothole / Traffic</option>
                <option value="illegal_dumping">Illegal Dumping</option>
                <option value="sewage_overflow">Sewage Overflow</option>
                <option value="fallen_tree">Fallen Tree</option>
                <option value="missing_manhole">Missing Manhole</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="low">Low Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="high">High Urgency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              Specific Location
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Corner of 4th Street & Main Ave"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              Description / Complaint Details
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the complaint..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
            >
              Add to Incidents Array
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
