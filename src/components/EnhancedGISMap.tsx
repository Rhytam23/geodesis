
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup, Polygon, useMapEvents } from 'react-leaflet';
import { provinces } from '../data/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EnhancedGISProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  activeLayers: string[];
  height?: string;
}

// Map click handler component
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

const ALL_LAYERS = [
  { id: 'salinity', name: 'Salinity', color: '#DC2626', label: 'Salinity Risk' },
  { id: 'ndvi', name: 'Vegetation (NDVI)', color: '#22C55E', label: 'Vegetation Health' },
  { id: 'rainfall', name: 'Rainfall', color: '#3B82F6', label: 'Rainfall' },
  { id: 'groundwater', name: 'Groundwater', color: '#8B5CF6', label: 'Groundwater Level' },
  { id: 'soil', name: 'Soil Moisture', color: '#854D0E', label: 'Soil Moisture' },
  { id: 'flood', name: 'Flood Risk', color: '#0EA5E9', label: 'Flood Risk' },
  { id: 'drought', name: 'Drought Risk', color: '#F59E0B', label: 'Drought Risk' },
  { id: 'crop', name: 'Crop Suitability', color: '#166534', label: 'Crop Suitability' },
  { id: 'market', name: 'Market Demand', color: '#7C3AED', label: 'Market Demand' },
];

export default function EnhancedGISMap({ onLocationSelect, selectedLocation, activeLayers, height = '720px' }: EnhancedGISProps) {
  // DEMONSTRATION LAYER DATA
  // Deterministic points derived from province reference data
  const simulatedPoints = provinces.flatMap((prov, idx) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const seed = (idx * 19 + i * 7) % 13;
      const lat = prov.lat + (seed - 6) * 0.055;
      const lng = prov.lng + ((i * 5) % 11 - 5) * 0.06;
      return {
        id: `pt-${idx}-${i}`,
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        salinity: Math.max(0.4, Math.min(13, prov.salinityRisk / 10 + (seed - 6) * 0.25)),
        ndvi: Math.max(0.32, Math.min(0.93, prov.ndviAvg + (i - 2) * 0.018)),
        rainfall: 22 + (seed * 4.2),
        groundwater: 0.8 + (seed % 7) * 0.48,
        soilMoisture: 26 + (i * 6.5),
        floodRisk: Math.max(5, prov.salinityRisk - 15 + (seed % 9) * 4),
        droughtRisk: Math.max(5, prov.salinityRisk - 15 + (i * 3)),
        province: prov.name,
      };
    });
  });

  const getLayerColor = (point: any, layerId: string) => {
    switch (layerId) {
      case 'salinity': return point.salinity > 7 ? '#DC2626' : point.salinity > 4 ? '#F59E0B' : '#22C55E';
      case 'ndvi': return point.ndvi > 0.7 ? '#15803D' : point.ndvi > 0.5 ? '#4ADE80' : '#A3E635';
      case 'rainfall': return point.rainfall > 55 ? '#1E40AF' : point.rainfall > 35 ? '#3B82F6' : '#93C5FD';
      case 'groundwater': return point.groundwater > 2.8 ? '#7C3AED' : point.groundwater > 1.5 ? '#A78BFA' : '#C4B5FD';
      case 'soil': return point.soilMoisture > 55 ? '#854D0E' : point.soilMoisture > 35 ? '#CA8A04' : '#FBBF24';
      case 'flood': return point.floodRisk > 65 ? '#0EA5E9' : point.floodRisk > 40 ? '#38BDF8' : '#7DD3FC';
      case 'drought': return point.droughtRisk > 60 ? '#F59E0B' : point.droughtRisk > 35 ? '#FBBF24' : '#FDE047';
      case 'crop': return '#166534';
      case 'market': return '#7C3AED';
      default: return '#64748B';
    }
  };

  const getRadius = (point: any, layerId: string) => {
    if (['salinity', 'ndvi'].includes(layerId)) return Math.min(13, Math.max(4.5, (point.salinity || 4) * 1.1));
    if (layerId === 'rainfall') return 4 + point.rainfall / 19;
    if (layerId === 'groundwater') return 4.5 + point.groundwater * 1.2;
    if (layerId === 'flood') return 4 + point.floodRisk / 15;
    if (layerId === 'drought') return 5 + point.droughtRisk / 13;
    return 5.5;
  };

  const activeLayerIds = activeLayers.length > 0 ? activeLayers : ['salinity', 'ndvi'];

  // Generate province polygons (simplified)
  const provincePolygons = provinces.map(p => {
    const offset = 0.35;
    return [
      [p.lat - offset * 0.8, p.lng - offset * 0.9],
      [p.lat - offset * 0.5, p.lng + offset],
      [p.lat + offset * 0.85, p.lng + offset * 0.9],
      [p.lat + offset * 1.05, p.lng - offset * 0.5],
      [p.lat + offset * 0.35, p.lng - offset * 1.1],
    ] as [number, number][];
  });

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={[10.25, 105.65]}
        zoom={8.1}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationSelect={onLocationSelect} />

        {/* Province Boundaries */}
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Province Boundaries">
            <LayerGroup>
              {provinces.map((prov, idx) => (
                <Polygon
                  key={idx}
                  positions={provincePolygons[idx]}
                  pathOptions={{ 
                    color: '#14532D', 
                    weight: 1.5, 
                    fillColor: '#22C55E', 
                    fillOpacity: 0.05 
                  }}
                >
                  <Popup>
                    <div>
                      <div className="font-semibold">{prov.name}</div>
                      <div className="text-xs text-slate-500">{prov.region}</div>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {/* Dynamic Layer Markers */}
        {activeLayerIds.map(layerId => (
          <LayerGroup key={layerId}>
            {simulatedPoints.map((point, idx) => {
              const color = getLayerColor(point, layerId);
              const radius = getRadius(point, layerId);
              const value = point[layerId === 'ndvi' ? 'ndvi' : layerId === 'rainfall' ? 'rainfall' : 
                           layerId === 'groundwater' ? 'groundwater' : layerId === 'soil' ? 'soilMoisture' : 
                           layerId === 'flood' ? 'floodRisk' : layerId === 'drought' ? 'droughtRisk' : 'salinity'];

              return (
                <CircleMarker
                  key={`${layerId}-${idx}`}
                  center={[point.lat, point.lng]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.85,
                    weight: layerId === 'salinity' ? 1.5 : 0.6,
                  }}
                    eventHandlers={{
                      click: () => onLocationSelect(point.lat, point.lng),
                    }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{point.province}</div>
                      <div className="text-xs mt-1">{ALL_LAYERS.find(l => l.id === layerId)?.label}: <span className="font-semibold">{value.toFixed(1)}</span></div>
                      <div className="mt-2 text-[10px] text-emerald-700">Click for full analysis →</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </LayerGroup>
        ))}

        {/* Selected location marker */}
        {selectedLocation && (
          <CircleMarker
            center={[selectedLocation.lat, selectedLocation.lng]}
            radius={13}
            pathOptions={{
              color: '#14532D',
              fillColor: '#22C55E',
              fillOpacity: 0.25,
              weight: 3,
            }}
          >
            <Popup>
              <div className="font-semibold text-emerald-800">Selected Location</div>
              <div className="text-xs">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Click instruction overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-sm text-xs flex items-center gap-2 border border-emerald-200 z-[999]">
        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
        <span className="font-medium">Click anywhere on the map to analyze a location</span>
      </div>
    </div>
  );
}
