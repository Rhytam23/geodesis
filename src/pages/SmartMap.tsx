import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalGISMap from '../components/ProfessionalGISMap';
import GISLocationPanel from '../components/GISLocationPanel';
import DecisionIntelligence from '../components/DecisionIntelligence';
import EconomicDecision from '../components/EconomicDecision';
import { useLocationData } from '../hooks/useLocationData';
import { generateRecommendations } from '../services/decisionEngine';
import { DecisionInput } from '../types/recommendation';
import { Search, MapPin, RefreshCw } from 'lucide-react';
import { LocationPanelSkeleton } from '../components/shared/LoadingStates';
import { useDemoMode } from '../context/DemoModeContext';
import { useRole } from '../context/RoleContext';

export default function SmartMap() {
  const navigate = useNavigate();
  const { role } = useRole();
  const demo = useDemoMode();

  // Strict Farmer restriction - invisible = invisible
  useEffect(() => {
    if (role === 'farmer') {
      navigate('/mission-control', { replace: true });
    }
  }, [role, navigate]);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const effectiveLat = demo.isDemoMode && demo.demoData ? demo.demoData.location.lat : selectedLocation?.lat ?? null;
  const effectiveLng = demo.isDemoMode && demo.demoData ? demo.demoData.location.lng : selectedLocation?.lng ?? null;

  const realLocationData = useLocationData(effectiveLat, effectiveLng);
  const locationData = useMemo(() => {
    return demo.isDemoMode && demo.demoData 
      ? { ...realLocationData, ...demo.demoData, loading: false, error: null } 
      : realLocationData;
  }, [realLocationData, demo.isDemoMode, demo.demoData]);

  const decisionInput: DecisionInput | null = useMemo(() => {
    if (demo.isDemoMode && demo.demoData) return demo.demoData.decisionInput;
    if (!selectedLocation || !locationData.admin || !locationData.soil || !locationData.weather) return null;
    return {
      lat: selectedLocation.lat, lng: selectedLocation.lng,
      admin: locationData.admin, weather: locationData.weather, soil: locationData.soil,
      crop: locationData.crop, market: locationData.market, government: locationData.government,
      groundwater: { depth: 2.1 },
    };
  }, [selectedLocation, locationData, demo]);

  const recommendations = useMemo(() => {
    if (demo.isDemoMode && demo.demoData) return demo.demoData.recommendations;
    if (!decisionInput) return [];
    return generateRecommendations(decisionInput);
  }, [decisionInput, demo]);

  const handleLocationSelect = (lat: number, lng: number) => setSelectedLocation({ lat, lng });

  // Early return for farmers (defense in depth)
  if (role === 'farmer') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="max-w-[1520px] mx-auto px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-700 rounded-2xl flex items-center justify-center"><MapPin className="text-white w-5 h-5" /></div>
            <div>
              <div className="font-semibold tracking-tighter text-2xl">MEKONG GIS</div>
              <div className="text-[10px] text-emerald-700 font-medium">Enterprise Satellite Intelligence</div>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleLocationSelect(10.1, 105.5)} 
                placeholder="Search province or lat,lng..." 
                className="w-full border border-slate-300 pl-10 py-2.5 text-sm rounded-3xl focus:outline-none focus:ring-1 focus:ring-emerald-600" 
              />
              <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <button onClick={() => setSelectedLocation(null)} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-2xl hover:bg-white">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="max-w-[1520px] mx-auto px-8 pt-4">
        <div className="bg-emerald-950 text-emerald-100 px-4 py-2 rounded-2xl text-xs mb-4">
          <strong>PROOF LOOP (DEMO ONLY):</strong> Location → deterministic labeled data (Source + Confidence) → transparent rule-based decisionEngine.ts → recommendations + EconomicDecision. All values explicitly labeled demonstration data.
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-h-[620px] rounded-3xl overflow-hidden border bg-white shadow-sm">
            <ProfessionalGISMap onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} height="100%" />
          </div>

          <div className="lg:w-[420px] flex-shrink-0">
            {locationData.loading ? <LocationPanelSkeleton /> : (
              <GISLocationPanel 
                lat={effectiveLat} lng={effectiveLng} 
                admin={locationData.admin} weather={locationData.weather} soil={locationData.soil} 
                crop={locationData.crop} market={locationData.market} government={locationData.government} 
                loading={false} onApply={() => {}} 
              />
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-8">
            <DecisionIntelligence recommendations={recommendations} locationName="Selected Location" loading={false} />
          </div>
        )}

        {recommendations.length > 0 && decisionInput && (
          <div className="mt-6">
            <EconomicDecision 
              lat={selectedLocation?.lat ?? effectiveLat} 
              lng={selectedLocation?.lng ?? effectiveLng} 
              currentCrop={locationData.crop} 
              recommended={recommendations[0]} 
              input={decisionInput} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
