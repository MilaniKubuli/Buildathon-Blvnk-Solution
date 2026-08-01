'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Layers,
  Search,
  Maximize2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Merge,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Zap,
  Droplet,
  Biohazard,
  Trees,
  CircleOff,
  Navigation,
} from 'lucide-react';
import { Incident, IncidentCategory, TicketStatus, UrgencyLevel } from '../types';
import { CategoryBadge, CATEGORY_META } from './CategoryBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { StatusBadge } from './StatusBadge';

interface IncidentMapProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onDeleteIncident: (id: string) => void;
  onOpenAddModal?: () => void;
}

// Category color mappings for map pins
const CATEGORY_PIN_CONFIG: Record<
  IncidentCategory,
  { bg: string; text: string; border: string; svg: string }
> = {
  water_leak: {
    bg: '#2563eb',
    text: '#ffffff',
    border: '#1d4ed8',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
  },
  electricity_outage: {
    bg: '#d97706',
    text: '#ffffff',
    border: '#b45309',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  },
  pothole_traffic: {
    bg: '#ea580c',
    text: '#ffffff',
    border: '#c2410c',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  },
  illegal_dumping: {
    bg: '#9333ea',
    text: '#ffffff',
    border: '#7e22ce',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  },
  sewage_overflow: {
    bg: '#059669',
    text: '#ffffff',
    border: '#047857',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 10V2"/><path d="M10.5 13.5 3.5 17.5"/><path d="M13.5 13.5 20.5 17.5"/></svg>`,
  },
  fallen_tree: {
    bg: '#57534e',
    text: '#ffffff',
    border: '#44403c',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M12 2a7 7 0 0 0-7 7c0 2 1 4 3 5.5l2 1.5h4l2-1.5c2-1.5 3-3.5 3-5.5a7 7 0 0 0-7-7Z"/></svg>`,
  },
  missing_manhole: {
    bg: '#dc2626',
    text: '#ffffff',
    border: '#b91c1c',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  },
};

// Generate deterministic lat/lng if not present
function getCoordinates(inc: Incident, index: number): { lat: number; lng: number } {
  if (inc.lat !== undefined && inc.lng !== undefined) {
    return { lat: inc.lat, lng: inc.lng };
  }
  // Fallback grid offsets around city center (37.7749, -122.4194)
  // Fallback grid offsets around South Africa Metro (-26.2041, 28.0473)
  const baseLat = -26.2041;
  const baseLng = 28.0473;
  const hash = inc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offsetLat = ((hash % 100) - 50) * 0.0008;
  const offsetLng = (((hash * 3) % 100) - 50) * 0.0008;
  return { lat: baseLat + offsetLat, lng: baseLng + offsetLng };
}

export function IncidentMap({
  incidents,
  onUpdateStatus,
  onDeleteIncident,
  onOpenAddModal,
}: IncidentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    incidents[0]?.id || null
  );

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (selectedCategory !== 'all' && inc.category !== selectedCategory) return false;
      if (selectedUrgency !== 'all' && inc.urgency !== selectedUrgency) return false;
      if (selectedStatus !== 'all' && inc.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesLoc = inc.location.toLowerCase().includes(q);
        const matchesId = inc.id.toLowerCase().includes(q);
        const matchesDesc = inc.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesId && !matchesDesc) return false;
      }
      return true;
    });
  }, [incidents, selectedCategory, selectedUrgency, selectedStatus, searchQuery]);

  const selectedIncident = useMemo(() => {
    return incidents.find((i) => i.id === selectedIncidentId) || filteredIncidents[0] || null;
  }, [incidents, selectedIncidentId, filteredIncidents]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map centered at South Africa Metro
    const map = L.map(mapContainerRef.current, {
      center: [-26.2041, 28.0473],
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom control top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Voyager tiles for crisp dark/light municipal look
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers on Map dynamically when incidents or filters update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Track existing marker keys
    const currentMarkerMap = markersRef.current;
    const activeIds = new Set(filteredIncidents.map((i) => i.id));

    // Remove markers no longer in filtered list
    currentMarkerMap.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkerMap.delete(id);
      }
    });

    // Add or update markers
    const bounds: L.LatLngExpression[] = [];

    filteredIncidents.forEach((inc, index) => {
      const coords = getCoordinates(inc, index);
      bounds.push([coords.lat, coords.lng]);

      const isSelected = inc.id === selectedIncidentId;
      const pinCfg = CATEGORY_PIN_CONFIG[inc.category] || {
        bg: '#3b82f6',
        text: '#ffffff',
        border: '#1d4ed8',
        svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="8"/></svg>`,
      };

      const isHighUrgency = inc.urgency === 'high';

      // Custom divIcon HTML for real-time ticket marker
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        iconSize: isSelected ? [44, 44] : [36, 36],
        iconAnchor: isSelected ? [22, 44] : [18, 36],
        popupAnchor: [0, -36],
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s ease;">
            ${
              isHighUrgency
                ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: rgba(225, 29, 72, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="width: ${isSelected ? '42px' : '34px'}; height: ${isSelected ? '42px' : '34px'}; border-radius: 9999px; background-color: ${pinCfg.bg}; border: 2px solid ${isSelected ? '#ffffff' : pinCfg.border}; display: flex; align-items: center; justify-content: center; color: ${pinCfg.text}; box-shadow: ${isSelected ? '0 0 0 3px #2563eb, 0 10px 15px -3px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.2)'};">
              ${pinCfg.svg}
            </div>
            <div style="position: absolute; bottom: -4px; right: -4px; width: 12px; height: 12px; border-radius: 9999px; border: 2px solid #ffffff; background-color: ${
              inc.status === 'resolved'
                ? '#10b981'
                : inc.status === 'in_progress'
                ? '#f59e0b'
                : inc.status === 'duplicate'
                ? '#64748b'
                : '#3b82f6'
            };"></div>
          </div>
        `,
      });

      if (currentMarkerMap.has(inc.id)) {
        const marker = currentMarkerMap.get(inc.id)!;
        marker.setLatLng([coords.lat, coords.lng]);
        marker.setIcon(customIcon);
      } else {
        const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);

        // Click event opens popup / sets selected incident
        marker.on('click', () => {
          setSelectedIncidentId(inc.id);
        });

        // Add tooltip on hover
        marker.bindTooltip(
          `<div style="font-family: system-ui; font-size: 11px; font-weight: 700; color: #0f172a; padding: 2px 4px;">#${inc.id}: ${inc.title}</div>`,
          { direction: 'top', offset: [0, -28] }
        );

        currentMarkerMap.set(inc.id, marker);
      }
    });

    // Fit map to bounds if filtered list has items
    if (bounds.length > 0 && mapInstanceRef.current) {
      const leafletBounds = L.latLngBounds(bounds);
      mapInstanceRef.current.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredIncidents, selectedIncidentId]);

  // Pan to selected incident on click
  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncidentId(inc.id);
    if (mapInstanceRef.current) {
      const coords = getCoordinates(inc, 0);
      mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 0.8 });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Map Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Live Status & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="flex items-center space-x-2 bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-mono font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REALTIME_MAP</span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-300">{filteredIncidents.length} TICKETS</span>
          </div>

          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search map tickets by location, title, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Log Ticket on Map</span>
            </button>
          )}

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([37.7749, -122.4194], 13);
              }
            }}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono transition"
            title="Recenter Map View"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              All ({incidents.length})
            </button>
            {(Object.keys(CATEGORY_META) as IncidentCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = incidents.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Status & Urgency Dropdowns */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-1 rounded focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="duplicate">Duplicate</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Urgency:
              </span>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-1 rounded focus:outline-none"
              >
                <option value="all">All Urgencies</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Container + Ticket Summary Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Stage (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col relative h-[520px]">
          {/* Leaflet DOM Mount */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Overlay Legend */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-slate-200 p-2.5 rounded border border-slate-800 text-[10px] font-mono shadow-xl space-y-1">
            <div className="font-bold text-slate-400 uppercase tracking-widest mb-1">
              Municipal Map Legend
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span>Water Leak</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                <span>Outage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
                <span>Pothole</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                <span>Dumping</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>Sewage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <span>Missing Cover</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Incident Summary Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Ticket Details
              </h3>
              {selectedIncident && (
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  #{selectedIncident.id}
                </span>
              )}
            </div>

            {selectedIncident ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedIncident.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">{selectedIncident.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={selectedIncident.category} size="sm" />
                  <UrgencyBadge urgency={selectedIncident.urgency} size="sm" />
                  <StatusBadge status={selectedIncident.status} size="sm" />
                </div>

                {/* Coordinates & Metadata */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                    <span>Geospatial Coords:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {getCoordinates(selectedIncident, 0).lat.toFixed(4)},{' '}
                      {getCoordinates(selectedIncident, 0).lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                    <span>Reported By:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedIncident.reportedBy || 'Citizen'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                    <span>Logged At:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {new Date(selectedIncident.reportedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{selectedIncident.description}"
                </div>

                {/* Status Update Quick Dispatch Buttons */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Update Ticket Dispatch Status:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onUpdateStatus(selectedIncident.id, 'open')}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                        selectedIncident.status === 'open'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onUpdateStatus(selectedIncident.id, 'in_progress')}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                        selectedIncident.status === 'in_progress'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => onUpdateStatus(selectedIncident.id, 'resolved')}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                        selectedIncident.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        if (confirm(`Remove ticket #${selectedIncident.id} from municipal database?`)) {
                          onDeleteIncident(selectedIncident.id);
                        }
                      }}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
                <p>Click any icon on the map to view ticket details and dispatch controls.</p>
              </div>
            )}
          </div>

          {/* Mini Incident Quick List under Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm max-h-[160px] overflow-y-auto space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Active Map Pins ({filteredIncidents.length}):
            </span>
            {filteredIncidents.slice(0, 5).map((inc) => (
              <button
                key={inc.id}
                onClick={() => handleSelectIncident(inc)}
                className={`w-full text-left p-2 rounded text-xs flex items-center justify-between border transition ${
                  selectedIncidentId === inc.id
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500/50 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold mr-1.5">
                    #{inc.id}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">{inc.title}</span>
                </div>
                <UrgencyBadge urgency={inc.urgency} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
