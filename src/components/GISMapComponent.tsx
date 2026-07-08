import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup, Polygon } from 'react-leaflet';
import { SatelliteDataPoint, LayerConfig } from '../types';
import { provinces, currentSatelliteData } from '../data/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GISMapProps {
  data?: SatelliteDataPoint[];
  showTimeline?: boolean;
  height?: string;
  onPointSelect?: (point: SatelliteDataPoint) => void;
}

const LAYER_CONFIGS: LayerConfig[] = [
  { id: 'salinity', name: 'Salinity (dS/m)', type: 'heatmap', active: true, opacity: 0.85, color: '#DC2626', dataSource: 'Sentinel-1 + MONRE' },
  { id: 'ndvi', name: 'Vegetation (NDVI)', type: 'heatmap', active: true, opacity: 0.75, color: '#22C55E', dataSource: 'Sentinel-2' },
  { id: 'rainfall', name: 'Rainfall', type: 'heatmap', active: false, opacity: 0.7, color: '#3B82F6', dataSource: 'CHIRPS' },
  { id: 'groundwater', name: 'Groundwater', type: 'heatmap', active: false, opacity: 0.8, color: '#8B5CF6', dataSource: 'NASA MODIS + MONRE' },
];

const provincePolygons = provinces.map(p => {
  // Approximate province bounding polygons
  const offset = 0.38;
  return [
    [p.lat - offset * 0.7, p.lng - offset],
    [p.lat - offset * 0.6, p.lng + offset * 0.9],
    [p.lat + offset * 0.9, p.lng + offset * 0.75],
    [p.lat + offset * 1.1, p.lng - offset * 0.6],
    [p.lat + offset * 0.4, p.lng - offset * 1.1],
  ] as [number, number][];
});

const TIMELINE_DATES = ['2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03'];

export default function GISMapComponent({ data = currentSatelliteData, showTimeline = true, height = '640px', onPointSelect }: GISMapProps) {
  const [layers, setLayers] = useState<LayerConfig[]>(LAYER_CONFIGS);
  const [selectedDate, setSelectedDate] = useState('2026-07-03');
  const [timeIndex, setTimeIndex] = useState(0);
  const [filteredData, setFilteredData] = useState(data);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulated timeline playback (8 days)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && showTimeline) {
      interval = setInterval(() => {
        const next = (timeIndex + 1) % TIMELINE_DATES.length;
        setTimeIndex(next);
        setSelectedDate(TIMELINE_DATES[next]);
      }, 1250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeIndex, showTimeline]);

  useEffect(() => {
    // DEMONSTRATION: deterministic time-series variation
    const newData = data.map((d, i) => {
      const seed = (timeIndex + i) % 9;
      return {
        ...d,
        timestamp: selectedDate,
        salinity: Math.max(0.4, Math.min(13, d.salinity + (Math.sin(timeIndex) * 0.9) + (seed - 4) * 0.3)),
        ndvi: Math.max(0.3, Math.min(0.9, d.ndvi + (Math.cos(timeIndex) * 0.04))),
        rainfall: Math.max(1, Math.min(75, d.rainfall * (0.85 + (seed % 5) * 0.04))),
      };
    });
    setFilteredData(newData);
  }, [selectedDate, timeIndex, data]);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const getColorByValue = (value: number, layerId: string) => {
    if (layerId === 'salinity') {
      if (value > 7) return '#DC2626';
      if (value > 4) return '#F59E0B';
      return '#22C55E';
    }
    if (layerId === 'ndvi') {
      if (value > 0.7) return '#15803D';
      if (value > 0.5) return '#4ADE80';
      return '#A3E635';
    }
    if (layerId === 'rainfall') {
      if (value > 55) return '#1E40AF';
      if (value > 32) return '#3B82F6';
      return '#93C5FD';
    }
    // groundwater
    if (value > 3.2) return '#7C3AED';
    if (value > 1.8) return '#A78BFA';
    return '#C4B5FD';
  };

  const activeLayers = layers.filter(l => l.active);

  return (
    <div className="relative">
      <div className="map-container" style={{ height }}>
        <MapContainer 
          center={[10.15, 105.6]} 
          zoom={8.4} 
          style={{ height: '100%', width: '100%' }}
          className="rounded-3xl"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Province boundaries */}
          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Province Boundaries">
              <LayerGroup>
                {provinces.map((province, idx) => (
                  <Polygon
                    key={idx}
                    positions={provincePolygons[idx]}
                    pathOptions={{ 
                      color: '#14532D', 
                      weight: 1.5, 
                      fillOpacity: 0.06, 
                      fillColor: '#22C55E' 
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{province.name}</div>
                        <div className="text-xs text-slate-500">{province.region} • {province.farmers.toLocaleString()} farmers</div>
                        <div className="mt-1.5 flex gap-x-4 text-[13px]">
                          <div>Salinity risk: <span className="font-semibold text-red-600">{province.salinityRisk}%</span></div>
                          <div>NDVI: <span className="font-semibold">{province.ndviAvg}</span></div>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>

          {/* Dynamic Satellite Layers */}
          {activeLayers.map((layer) => (
            <LayerGroup key={layer.id}>
              {filteredData.map((point, idx) => {
                let value: number;
                let radius: number;

                if (layer.id === 'salinity') {
                  value = point.salinity;
                  radius = Math.min(11, Math.max(4, value * 1.1));
                } else if (layer.id === 'ndvi') {
                  value = point.ndvi;
                  radius = 5.5 + (value * 6);
                } else if (layer.id === 'rainfall') {
                  value = point.rainfall;
                  radius = 4 + (value / 18);
                } else {
                  value = point.groundwater;
                  radius = 5 + (value * 1.3);
                }

                return (
                  <CircleMarker
                    key={`${layer.id}-${idx}`}
                    center={[point.lat, point.lng]}
                    radius={radius}
                    pathOptions={{
                      color: getColorByValue(value, layer.id),
                      fillColor: getColorByValue(value, layer.id),
                      fillOpacity: layer.opacity * 0.95,
                      weight: layer.id === 'salinity' ? 1.5 : 0.7,
                    }}
                    eventHandlers={{
                      click: () => onPointSelect?.(point)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[190px]">
                        <div className="font-semibold text-sm mb-1 tracking-tight">{layer.name}</div>
                        <div className="text-xs mb-2 text-slate-500">{point.timestamp} • {point.source}</div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-px text-xs">
                          <div>Salinity:</div><div className="font-semibold text-right">{point.salinity} dS/m</div>
                          <div>NDVI:</div><div className="font-semibold text-right">{point.ndvi}</div>
                          <div>Rainfall:</div><div className="font-semibold text-right">{point.rainfall} mm</div>
                          <div>Soil Moisture:</div><div className="font-semibold text-right">{point.soilMoisture}%</div>
                        </div>

                        <div className="pt-2 mt-1.5 border-t text-[10px] text-emerald-700">Click marker for prediction</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </LayerGroup>
          ))}

          {/* District / Sample Points for visual density */}
          {filteredData.slice(0, 14).map((pt, index) => (
            <CircleMarker 
              key={`base-${index}`}
              center={[pt.lat, pt.lng]}
              radius={3.5}
              pathOptions={{ color: '#64748B', fillOpacity: 0.2, weight: 0.6 }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-5 right-5 layer-control z-[999]">
        <div className="font-semibold text-xs tracking-wider text-slate-600 mb-2 px-1">ACTIVE LAYERS</div>
        {layers.map(layer => (
          <label key={layer.id} className="flex items-center gap-2.5 px-1 py-[3px] cursor-pointer text-sm">
            <input 
              type="checkbox" 
              checked={layer.active} 
              onChange={() => toggleLayer(layer.id)}
              className="accent-emerald-600 w-3.5 h-3.5" 
            />
            <div className="flex-1 flex items-center justify-between">
              <span>{layer.name}</span>
              <span className="text-[10px] text-slate-400 ml-2">{layer.dataSource}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Timeline */}
      {showTimeline && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-5 py-3 rounded-3xl shadow border flex items-center gap-4 z-[999]">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="font-medium text-xs px-4 py-1 bg-slate-900 text-white rounded-2xl"
          >
            {isPlaying ? 'PAUSE' : 'PLAY'} TIMELINE
          </button>
          
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            {TIMELINE_DATES.map((date: string, i: number) => (
              <button
                key={i}
                onClick={() => { setTimeIndex(i); setSelectedDate(date); setIsPlaying(false); }}
                className={`px-2.5 py-px rounded-lg font-medium transition-all ${timeIndex === i ? 'bg-emerald-700 text-white' : 'hover:bg-slate-100'}`}
              >
                {date.slice(5)}
              </button>
            ))}
          </div>

          <div className="text-xs text-emerald-700 font-medium pl-1 tracking-wide">{selectedDate}</div>
        </div>
      )}
    </div>
  );
}
