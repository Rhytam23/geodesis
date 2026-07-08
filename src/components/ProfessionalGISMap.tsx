import { useState, useEffect } from 'react';
import { 
  MapContainer, TileLayer, CircleMarker, Popup, LayersControl, 
  LayerGroup, Polygon, useMap, useMapEvents, ScaleControl 
} from 'react-leaflet';
import { provinces } from '../data/mockData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProfessionalGISProps {
  onLocationSelect: (lat: number, lng: number, meta: any) => void;
  selectedLocation: { lat: number; lng: number } | null;
  height?: string;
}

// Component to control map from outside
function MapController({ selectedLocation }: { selectedLocation: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation && map) {
      // Smooth fly animation
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 11.5, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

// Click handler
function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, meta: any) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      // Find closest province for metadata
      let closest = provinces[0];
      let minDist = Infinity;
      provinces.forEach(p => {
        const dist = Math.hypot(p.lat - lat, p.lng - lng);
        if (dist < minDist) {
          minDist = dist;
          closest = p;
        }
      });

      // Deterministic demo metadata
      const meta = {
        province: closest.name,
        district: `${closest.name} District ${1 + Math.floor(((lat + lng) * 100) % 8)}`,
        commune: `Commune ${['An', 'Phu', 'Binh', 'Long', 'Vinh'][Math.floor((lat * 100 + lng * 10) % 5)]}`,
        salinity: parseFloat((closest.salinityRisk / 9.8 + ((lat - 10) * 0.7)).toFixed(1)),
        ndvi: parseFloat((closest.ndviAvg + ((lng - 105.5) * 0.04)).toFixed(3)),
      };

      onLocationSelect(lat, lng, meta);
    },
  });
  return null;
}

const BASE_LAYERS = [
  { 
    id: 'osm', 
    name: 'OpenStreetMap', 
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  { 
    id: 'satellite', 
    name: 'Satellite (Esri)', 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, Maxar, Earthstar Geographics'
  },
  { 
    id: 'terrain', 
    name: 'Terrain', 
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'OpenTopoMap'
  },
  { 
    id: 'dark', 
    name: 'Dark', 
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
];

export default function ProfessionalGISMap({ onLocationSelect, selectedLocation, height = '720px' }: ProfessionalGISProps) {
  const [activeBase, setActiveBase] = useState('osm');
  const [showProvince, setShowProvince] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showCommunes, setShowCommunes] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Deterministic demo polygons + heatmap (no Math.random for stable demo)
  const adminPolygons = provinces.map((prov, pIndex) => {
    const offset = 0.42;
    const provincePoly = [
      [prov.lat - offset * 0.75, prov.lng - offset * 1.05],
      [prov.lat - offset * 0.5, prov.lng + offset],
      [prov.lat + offset * 0.9, prov.lng + offset * 0.9],
      [prov.lat + offset * 1.05, prov.lng - offset * 0.45],
      [prov.lat + offset * 0.4, prov.lng - offset * 1.15],
    ] as [number, number][];

    // Districts (deterministic)
    const districts = Array.from({ length: 4 }).map((_, dIndex) => {
      const dOffset = offset * 0.55;
      const angle = (dIndex * 1.6) + pIndex * 0.7;
      const cx = prov.lat + Math.sin(angle) * 0.15;
      const cy = prov.lng + Math.cos(angle) * 0.22;
      
      return [
        [cx - dOffset * 0.6, cy - dOffset * 0.9],
        [cx - dOffset * 0.35, cy + dOffset * 0.7],
        [cx + dOffset * 0.85, cy + dOffset * 0.6],
        [cx + dOffset * 0.9, cy - dOffset * 0.4],
        [cx + dOffset * 0.3, cy - dOffset * 1.0],
      ] as [number, number][];
    });

    // Communes (deterministic)
    const communes = Array.from({ length: 6 }).map((_, cIdx) => {
      const cOffset = 0.13;
      const seed = (pIndex * 7 + cIdx) % 5;
      const cx = prov.lat + (seed - 2) * 0.09;
      const cy = prov.lng + ((cIdx % 3) - 1) * 0.11;
      return [
        [cx - cOffset, cy - cOffset * 0.9],
        [cx - cOffset * 0.4, cy + cOffset],
        [cx + cOffset * 0.85, cy + cOffset * 0.6],
        [cx + cOffset * 0.7, cy - cOffset * 0.65],
      ] as [number, number][];
    });

    return { province: prov, provincePoly, districts, communes, index: pIndex };
  });

  // Deterministic heatmap points (DEMO data)
  const heatmapPoints = provinces.flatMap((prov, idx) =>
    Array.from({ length: 6 }).map((_, i) => {
      const seed = (idx * 13 + i) % 7;
      return {
        lat: prov.lat + (seed - 3.5) * 0.068,
        lng: prov.lng + ((i % 5) - 2) * 0.078,
        value: Math.max(0.2, Math.min(13.5, prov.salinityRisk / 9 + (seed - 3) * 0.4)),
        ndvi: Math.max(0.25, Math.min(0.93, prov.ndviAvg + (i - 3) * 0.025)),
        id: `${idx}-${i}`
      };
    })
  );

  const currentBase = BASE_LAYERS.find(b => b.id === activeBase)!;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm" style={{ height }}>
      <MapContainer
        center={[10.25, 105.6]}
        zoom={8.2}
        minZoom={6}
        maxZoom={18}
        style={{ height: '100%', width: '100%', background: '#e0e7ff' }}
        className="z-0 leaflet-professional"
      >
        {/* Base Layers - Switched via controlled state */}
        <TileLayer
          key={activeBase}
          attribution={currentBase.attribution}
          url={currentBase.url}
        />

        <MapController selectedLocation={selectedLocation} />
        <ClickHandler onLocationSelect={onLocationSelect} />
        <ScaleControl position="bottomleft" />

        {/* ADMINISTRATIVE BOUNDARIES */}
        <LayersControl position="topright">
          {/* Province Boundaries */}
          <LayersControl.Overlay checked={showProvince} name="Province Boundaries">
            <LayerGroup>
              {adminPolygons.map((admin, idx) => (
                <Polygon
                  key={`prov-${idx}`}
                  positions={admin.provincePoly}
                  pathOptions={{
                    color: '#14532D',
                    weight: 2.5,
                    fillColor: '#22C55E',
                    fillOpacity: 0.04,
                    opacity: 0.95,
                  }}
                >
                  <Popup>
                    <div className="font-semibold text-sm">{admin.province.name}</div>
                    <div className="text-xs text-slate-500">{admin.province.region}</div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* District Boundaries */}
          <LayersControl.Overlay checked={showDistricts} name="District Boundaries">
            <LayerGroup>
              {adminPolygons.flatMap((admin, pIdx) =>
                admin.districts.map((poly, dIdx) => (
                  <Polygon
                    key={`dist-${pIdx}-${dIdx}`}
                    positions={poly}
                    pathOptions={{
                      color: '#3B82F6',
                      weight: 1.1,
                      fillOpacity: 0.015,
                      opacity: 0.7,
                    }}
                  />
                ))
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Commune Boundaries */}
          <LayersControl.Overlay checked={showCommunes} name="Commune Boundaries">
            <LayerGroup>
              {adminPolygons.flatMap((admin, pIdx) =>
                admin.communes.map((poly, _cIdx) => (
                  <Polygon
                    key={`comm-${pIdx}-${_cIdx}`}
                    positions={poly}
                    pathOptions={{
                      color: '#64748B',
                      weight: 0.7,
                      fillOpacity: 0,
                      opacity: 0.45,
                    }}
                  />
                ))
              )}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {/* HEATMAP / SALINITY OVERLAY */}
        {showHeatmap && (
          <LayerGroup>
            {heatmapPoints.map((pt) => {
              const isHigh = pt.value > 7;
              const radius = Math.max(4, Math.min(13, pt.value * 1.05));
              return (
                <CircleMarker
                  key={pt.id}
                  center={[pt.lat, pt.lng]}
                  radius={radius}
                  pathOptions={{
                    color: isHigh ? '#DC2626' : pt.value > 4.5 ? '#F59E0B' : '#22C55E',
                    fillColor: isHigh ? '#DC2626' : pt.value > 4.5 ? '#F59E0B' : '#22C55E',
                    fillOpacity: 0.6,
                    weight: 0.8,
                  }}
                  eventHandlers={{
                    click: () => {
                      onLocationSelect(pt.lat, pt.lng, { 
                        province: pt.id, 
                        district: 'Simulated', 
                        commune: 'Click', 
                        salinity: pt.value, 
                        ndvi: pt.ndvi 
                      });
                    },
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>Salinity:</strong> {pt.value.toFixed(1)} dS/m<br />
                      <strong>NDVI:</strong> {pt.ndvi.toFixed(2)}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </LayerGroup>
        )}

        {/* SELECTED LOCATION HIGHLIGHT — Large pulsing marker */}
        {selectedLocation && (
          <>
            <CircleMarker
              center={[selectedLocation.lat, selectedLocation.lng]}
              radius={18}
              pathOptions={{
                color: '#14532D',
                fillColor: '#22C55E',
                fillOpacity: 0.12,
                weight: 3.5,
              }}
            />
            <CircleMarker
              center={[selectedLocation.lat, selectedLocation.lng]}
              radius={7.5}
              pathOptions={{
                color: '#14532D',
                fillColor: '#14532D',
                fillOpacity: 0.9,
                weight: 1.5,
              }}
            />
          </>
        )}
      </MapContainer>

      {/* BASE LAYER SWITCHER — Professional control */}
      <div className="absolute top-4 right-4 z-[999] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow p-1.5 text-sm">
        <div className="px-2 pb-1 text-[10px] font-semibold text-slate-500 tracking-widest">BASE MAP</div>
        <div className="flex flex-col">
          {BASE_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveBase(layer.id)}
              className={`px-4 py-[5px] text-left rounded-xl text-xs font-medium transition ${activeBase === layer.id ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Layer toggles */}
      <div className="absolute top-4 left-4 z-[999] bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow p-3 text-xs w-[168px]">
        <div className="font-semibold text-emerald-800 mb-1.5 px-1 tracking-wider text-xs">GIS LAYERS</div>
        
        <label className="flex items-center gap-2 py-1 cursor-pointer px-1">
          <input type="checkbox" checked={showProvince} onChange={(e) => setShowProvince(e.target.checked)} className="accent-emerald-700" />
          <span>Provinces</span>
        </label>
        <label className="flex items-center gap-2 py-1 cursor-pointer px-1">
          <input type="checkbox" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} className="accent-emerald-700" />
          <span>Districts</span>
        </label>
        <label className="flex items-center gap-2 py-1 cursor-pointer px-1">
          <input type="checkbox" checked={showCommunes} onChange={(e) => setShowCommunes(e.target.checked)} className="accent-emerald-700" />
          <span>Communes</span>
        </label>
        <label className="flex items-center gap-2 py-1 cursor-pointer px-1">
          <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="accent-emerald-700" />
          <span>Salinity / NDVI</span>
        </label>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[999] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-3 text-xs shadow-sm w-[158px]">
        <div className="font-semibold text-emerald-800 text-[10px] mb-1.5">LEGEND</div>
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-600"></div> High Salinity (&gt;7)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div> Medium (4-7)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div> Low (&lt;4)</div>
          <div className="pt-1 border-t mt-1 text-emerald-700">Green = Province boundary</div>
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 text-[10px] px-3 py-px rounded-xl border border-slate-200 text-slate-500 z-[999]">
        Vietnam • Mekong Delta • Leaflet
      </div>
    </div>
  );
}
