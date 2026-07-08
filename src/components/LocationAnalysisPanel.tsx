import { useState } from 'react';
import { LocationAnalysis, CropRecommendation } from '../types/analysis';
import { 
  Thermometer, Droplet, Leaf, AlertTriangle, TrendingUp, 
  MapPin 
} from 'lucide-react';

interface Props {
  analysis: LocationAnalysis;
  recommendations: CropRecommendation[];
  onApplyRecommendation?: (rec: CropRecommendation) => void;
  userRole?: string;
}

export default function LocationAnalysisPanel({ analysis, recommendations, onApplyRecommendation }: Props) {
  const [activeCropTab, setActiveCropTab] = useState(0);
  const [activeSection, setActiveSection] = useState<'overview' | 'crops' | 'risks'>('overview');

  const currentCrop = analysis.crops.current;

  const formatCurrency = (n: number) => n.toLocaleString() + 'M VND';

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold tracking-tighter text-xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {analysis.province}, {analysis.district}
            </div>
            <div className="text-sm text-slate-500">{analysis.commune} Commune • {analysis.lat}°N, {analysis.lng}°E</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-mono text-emerald-700">{analysis.area} ha</div>
            <div>{analysis.elevation}m elev.</div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b bg-slate-50 px-1">
        {(['overview', 'crops', 'risks'] as const).map((sec) => (
          <button 
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition ${activeSection === sec ? 'border-b-2 border-emerald-700 text-emerald-800 bg-white' : 'text-slate-600'}`}
          >
            {sec}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-7 text-sm">

        {/* OVERVIEW SECTION */}
        {activeSection === 'overview' && (
          <>
            {/* Weather */}
            <div>
              <div className="uppercase text-xs font-semibold tracking-wider text-slate-500 mb-2">CURRENT WEATHER</div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3">
                  <Thermometer className="w-4 h-4 mb-1 text-orange-600" /> {analysis.weather.current.temp}°C
                  <div className="text-[10px] text-slate-500">{analysis.weather.current.condition}</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                  <Droplet className="w-4 h-4 mb-1 text-blue-600" /> {analysis.weather.current.humidity}%
                  <div className="text-[10px] text-slate-500">Humidity</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                  <span className="font-medium">Wind</span><br />{analysis.weather.current.wind} km/h
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 text-xs">
                  <div>Forecast</div>
                  <div className="text-emerald-700 font-medium">{analysis.weather.forecast[0].condition}</div>
                </div>
              </div>
            </div>

            {/* Soil + Groundwater + Vegetation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="uppercase text-xs font-semibold tracking-wider mb-2 text-slate-500">SOIL &amp; GROUNDWATER</div>
                <div className="text-xs space-y-1.5 bg-white border p-3 rounded-2xl">
                  <div className="flex justify-between"><span>Type</span> <span className="font-medium">{analysis.soil.type}</span></div>
                  <div className="flex justify-between"><span>pH</span> <span className="font-medium">{analysis.soil.ph}</span></div>
                  <div className="flex justify-between"><span>Salinity</span> <span className="font-medium text-red-600">{analysis.soil.salinity} dS/m</span></div>
                  <div className="flex justify-between"><span>Groundwater</span> <span>{analysis.groundwater.depth}m ({analysis.groundwater.quality})</span></div>
                </div>
              </div>

              <div>
                <div className="uppercase text-xs font-semibold tracking-wider mb-2 text-slate-500">VEGETATION INDICES</div>
                <div className="bg-white border rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span>NDVI</span> 
                    <span className="font-semibold">{analysis.vegetation.ndvi}</span>
                    <span className="text-emerald-600 text-xs">{analysis.vegetation.status}</span>
                  </div>
                  <div className="flex justify-between"><span>NDWI</span> <span className="font-semibold">{analysis.vegetation.ndwi}</span></div>
                  <div className="flex justify-between"><span>EVI</span> <span className="font-semibold">{analysis.vegetation.evi}</span></div>
                </div>
              </div>
            </div>

            {/* Current Crop */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="uppercase text-xs font-semibold tracking-wider text-slate-500">CURRENT CROP</div>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-sm">
                <div>
                  <div className="font-semibold">{currentCrop}</div>
                  <div className="text-xs text-emerald-700">{analysis.crops.stage} • {analysis.crops.daysSincePlanting} days</div>
                </div>
                <div className="text-right text-xs font-medium">Market trend: <span className="text-emerald-700">{analysis.market.trend}</span></div>
              </div>
            </div>

            {/* Market + Support */}
            <div>
              <div className="uppercase text-xs font-semibold tracking-wider text-slate-500 mb-2">MARKET &amp; SUPPORT</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="border rounded-2xl p-2">Rice: <span className="font-medium">{analysis.market.ricePrice.toLocaleString()}</span> VND/kg</div>
                <div className="border rounded-2xl p-2">Shrimp: <span className="font-medium">{analysis.market.shrimpPrice.toLocaleString()}</span></div>
                <div className="border rounded-2xl p-2">{analysis.market.trend}</div>
              </div>
              <div className="mt-3 text-xs">
                <div className="font-medium">Nearby Cooperatives:</div>
                {analysis.cooperatives.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs mt-1">{c.name} — {c.distance} km ({c.members} farmers)</div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CROPS / AI DECISION SECTION */}
        {activeSection === 'crops' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">AI Crop Suitability</div>
                  <div className="text-xs text-emerald-700">Best options for this location</div>
                </div>
              </div>

              {/* Crop Recommendation Cards */}
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    onClick={() => setActiveCropTab(index)}
                    className={`border rounded-2xl p-4 cursor-pointer transition ${activeCropTab === index ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-300' : 'hover:border-slate-300'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-lg">{rec.crop}</div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-px text-xs font-bold rounded-full bg-emerald-800 text-white">{rec.confidence}%</div>
                        <div className={`text-xs px-2 py-px rounded ${rec.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{rec.riskLevel}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 mt-3 gap-x-3 gap-y-2 text-xs">
                      <div><span className="block text-[10px] text-slate-500">Yield</span> <span className="font-semibold">{rec.expectedYield} t/ha</span></div>
                      <div><span className="block text-[10px] text-slate-500">Profit</span> <span className="font-semibold">{formatCurrency(rec.expectedProfit)}</span></div>
                      <div><span className="block text-[10px] text-slate-500">Water</span> <span className="font-semibold">{rec.waterRequirement.toLocaleString()} m³</span></div>
                      <div><span className="block text-[10px] text-slate-500">Risk</span> <span>{rec.riskLevel}</span></div>
                    </div>

                    {activeCropTab === index && (
                      <div className="mt-4 pt-3 border-t text-xs">
                        <div className="font-semibold mb-1 text-emerald-800">WHY THIS CROP IS RECOMMENDED</div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          {rec.why.map((reason, i) => <li key={i}>{reason}</li>)}
                        </ul>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                          <div className="bg-white px-2.5 py-1.5 rounded-xl border">NDVI Fit: <span className="font-medium">{rec.ndviFit}%</span></div>
                          <div className="bg-white px-2.5 py-1.5 rounded-xl border">Market Fit: <span className="font-medium">{rec.marketFit}%</span></div>
                          <div className="bg-white px-2.5 py-1.5 rounded-xl border">Confidence: <span className="font-medium">{rec.confidence}%</span></div>
                        </div>

                        {onApplyRecommendation && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onApplyRecommendation(rec); }}
                            className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-900 text-xs font-semibold text-white rounded-2xl"
                          >
                            APPLY THIS RECOMMENDATION + SEND SMS
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* RISKS SECTION */}
        {activeSection === 'risks' && (
          <div className="space-y-4">
            <div>
              <div className="uppercase text-xs tracking-wider font-semibold text-slate-500 mb-2">RISK ASSESSMENT</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Flood Risk', val: analysis.risks.flood, icon: Droplet, unit: '%' },
                  { label: 'Drought Risk', val: analysis.risks.drought, icon: AlertTriangle, unit: '%' },
                  { label: 'Salinity Intrusion', val: analysis.risks.salinityIntrusion, icon: Droplet, unit: '%' },
                  { label: 'Land Subsidence', val: analysis.risks.subsidence, icon: TrendingUp, unit: 'cm/yr' },
                ].map((r, i) => (
                  <div key={i} className="border rounded-2xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <r.icon className="w-4 h-4 text-slate-500" />
                      <span>{r.label}</span>
                    </div>
                    <div className="font-semibold text-xl tracking-tight text-right">{r.val}<span className="text-xs font-normal text-slate-500">{r.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
              <div className="font-medium mb-1">Government Support Programs Active</div>
              {analysis.support.map((s, i) => <div key={i}>• {s}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="border-t px-5 py-3 text-[10px] bg-white flex items-center justify-between text-emerald-700">
        <div className="flex items-center gap-1.5"><Leaf className="w-3 h-3" /> Data from Sentinel-2, CHIRPS, MONRE, MODIS</div>
        <div>Updated 8 min ago</div>
      </div>
    </div>
  );
}
