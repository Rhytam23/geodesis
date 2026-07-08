import React, { useState } from 'react';
import ProfessionalGISMap from '../../ProfessionalGISMap';
import { useGeodesisTwin } from '../../../hooks/useGeodesisTwin';

/**
 * MapView (Batch 6 - Real Map Integration)
 * 
 * Wraps the production-grade ProfessionalGISMap.
 * Receives selected year from timeline state for future overlay reactivity.
 * Location selection is wired to central workspace state.
 */
interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedYear?: number;
}

export const MapView: React.FC<MapViewProps> = ({ selectedYear }) => {
  const { timeline, selectLocation: twinSelectLocation } = useGeodesisTwin();
  const yearToShow = selectedYear || timeline.state.selectedYear;

  // Local state for the selected location (will be lifted in future batches)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationSelect = (lat: number, lng: number, meta?: any) => {
    const loc = { lat, lng };
    setSelectedLocation(loc);

    // Wire to central twin state
    twinSelectLocation(lat, lng, meta);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F1F5F9]">
      {/* Map header bar (minimal) */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-2 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur border border-[var(--geodesis-border)] rounded-2xl px-4 py-1 text-sm flex items-center gap-2 shadow-sm">
          <span className="font-medium">Mekong Delta — Digital Twin</span>
          {yearToShow && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {yearToShow}
            </span>
          )}
        </div>

        {/* Floating controls (kept minimal) */}
        <div className="pointer-events-auto flex gap-2">
          <div className="layer-control text-xs px-3 py-1.5 flex items-center gap-2">
            <span>Base</span>
            <select className="bg-transparent text-xs border border-[var(--geodesis-border)] rounded-lg px-2 py-0.5">
              <option>Satellite</option>
              <option>OSM</option>
              <option>Dark</option>
            </select>
          </div>
        </div>
      </div>

      {/* The real ProfessionalGISMap */}
      <div className="flex-1">
        <ProfessionalGISMap
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          height="100%"
        />
      </div>

      {/* Bottom legend (kept for visual continuity) */}
      <div className="absolute bottom-3 left-3 bg-white/95 text-[10px] px-3 py-px rounded-xl border border-slate-200 text-slate-500 z-[999]">
        Vietnam • Mekong Delta • Live GIS
      </div>
    </div>
  );
};
