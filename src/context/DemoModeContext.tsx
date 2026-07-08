import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DecisionInput } from '../types/recommendation';
import { CropRecommendation } from '../types/recommendation';
import { generateRecommendations } from '../services/decisionEngine';

export type DemoScenario = 
  | 'normal' 
  | 'flood' 
  | 'drought' 
  | 'high-salinity' 
  | 'gov-response';

interface DemoData {
  scenario: DemoScenario;
  location: { lat: number; lng: number; name: string };
  admin: any;
  weather: any;
  soil: any;
  crop: any;
  market: any;
  government: any;
  recommendations: CropRecommendation[];
  decisionInput: DecisionInput;
  smsPreview: string;
}

interface DemoModeContextType {
  isDemoMode: boolean;
  currentScenario: DemoScenario | null;
  demoData: DemoData | null;
  setScenario: (scenario: DemoScenario) => void;
  exitDemoMode: () => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const SCENARIO_CONFIG: Record<DemoScenario, {
  lat: number;
  lng: number;
  name: string;
  weather: any;
  soil: any;
  crop: any;
  market: any;
  government: any;
  sms: string;
}> = {
  normal: {
    lat: 10.25, lng: 105.6,
    name: 'Can Tho — Normal Season',
    weather: { current: { temp: 28, humidity: 78, wind: 9, condition: 'Partly Cloudy', rainfall: 28 } },
    soil: { type: 'Alluvial', ph: 5.8, organicMatter: 2.4, texture: 'Loam', salinity: 3.2 },
    crop: { current: 'ST25 Rice', stage: 'Grain Filling', daysSincePlanting: 62, season: 'Wet Season 2026' },
    market: { ricePrice: 7250, shrimpPrice: 139000, vegetablePrice: 17300, trend: 'Stable' },
    government: { programs: ['MARD Salinity Resilience Program 2026'], alerts: ['Normal monitoring'] },
    sms: 'ALERT: Normal conditions. Continue ST25 Rice. Expected yield 6.1 t/ha.',
  },
  flood: {
    lat: 9.95, lng: 105.15,
    name: 'Kien Giang — Flood Warning',
    weather: { current: { temp: 26, humidity: 92, wind: 18, condition: 'Heavy Rain', rainfall: 78 } },
    soil: { type: 'Silty Clay', ph: 5.4, organicMatter: 2.1, texture: 'Silty Clay', salinity: 2.1 },
    crop: { current: 'ST25 Rice', stage: 'Vegetative', daysSincePlanting: 31, season: 'Wet Season 2026' },
    market: { ricePrice: 6980, shrimpPrice: 141000, vegetablePrice: 16800, trend: 'Rising (+3.1%)' },
    government: { programs: ['MARD Salinity Resilience Program 2026', 'Flood Response Fund'], alerts: ['Flood warning active — Kien Giang'] },
    sms: 'URGENT: Heavy rainfall. Activate drainage. Monitor dikes. Reply DRAIN.',
  },
  drought: {
    lat: 10.52, lng: 105.13,
    name: 'An Giang — Drought Conditions',
    weather: { current: { temp: 34, humidity: 51, wind: 14, condition: 'Sunny', rainfall: 4 } },
    soil: { type: 'Saline Clay', ph: 5.1, organicMatter: 1.7, texture: 'Clay Loam', salinity: 5.8 },
    crop: { current: 'IR64 Rice', stage: 'Flowering', daysSincePlanting: 48, season: 'Dry Season 2026' },
    market: { ricePrice: 7520, shrimpPrice: 134000, vegetablePrice: 19100, trend: 'Rising (+6.4%)' },
    government: { programs: ['Provincial Irrigation Subsidy'], alerts: ['Drought advisory — An Giang'] },
    sms: 'ALERT: Drought risk high. Switch to AWD irrigation immediately. Expected +0.6 t/ha water savings.',
  },
  'high-salinity': {
    lat: 9.60, lng: 105.97,
    name: 'Soc Trang — High Salinity Intrusion',
    weather: { current: { temp: 30, humidity: 71, wind: 11, condition: 'Overcast', rainfall: 19 } },
    soil: { type: 'Saline Fluvisol', ph: 4.9, organicMatter: 1.5, texture: 'Silty Clay', salinity: 9.4 },
    crop: { current: 'IR64 Rice', stage: 'Maturing', daysSincePlanting: 79, season: 'Wet Season 2026' },
    market: { ricePrice: 6890, shrimpPrice: 152000, vegetablePrice: 15900, trend: 'Stable' },
    government: { programs: ['MARD Salinity Resilience Program 2026', 'Climate Smart Agriculture Credit'], alerts: ['Salinity intrusion warning — Soc Trang'] },
    sms: 'CRITICAL: Salinity 9.4 dS/m. Recommend immediate switch to Shrimp-Rice Rotation or ST25.',
  },
  'gov-response': {
    lat: 9.93, lng: 106.34,
    name: 'Tra Vinh — Government Response Active',
    weather: { current: { temp: 27, humidity: 84, wind: 7, condition: 'Light Rain', rainfall: 41 } },
    soil: { type: 'Alluvial', ph: 5.6, organicMatter: 2.0, texture: 'Loam', salinity: 6.8 },
    crop: { current: 'Shrimp-Rice', stage: 'Vegetative', daysSincePlanting: 22, season: 'Wet Season 2026' },
    market: { ricePrice: 7310, shrimpPrice: 148000, vegetablePrice: 17500, trend: 'Rising (+4.8%)' },
    government: { programs: ['MARD Salinity Resilience Program 2026', 'Provincial Irrigation Subsidy', 'Emergency Salinity Barrier Deployment'], alerts: ['Active government response — 6 provinces'] },
    sms: 'GOV: Salinity barriers deployed. AWD + ST25 recommended for 4,200 ha. Subsidies available.',
  },
};

function buildDemoData(scenario: DemoScenario): DemoData {
  const config = SCENARIO_CONFIG[scenario];
  
  const admin = {
    province: config.name.split(' — ')[0],
    district: 'Demo District',
    commune: 'Demo Commune',
    source: 'DEMO MODE',
    lastUpdated: new Date().toISOString(),
    confidence: 100,
  };

  const weather = {
    current: config.weather.current,
    forecast: [
      { day: 'Tomorrow', temp: config.weather.current.temp + 1, rain: Math.round(config.weather.current.rainfall * 0.7), condition: 'Scattered showers' },
      { day: 'Day 2', temp: config.weather.current.temp - 2, rain: 0, condition: 'Sunny' },
    ],
    source: 'DEMO MODE — Realistic scenario',
    lastUpdated: new Date().toISOString(),
    confidence: 100,
  };

  const soil = {
    ...config.soil,
    source: 'DEMO MODE — Realistic scenario',
    lastUpdated: new Date().toISOString(),
    confidence: 100,
  };

  const crop = {
    ...config.crop,
    source: 'DEMO MODE — Realistic scenario',
    lastUpdated: new Date().toISOString(),
    confidence: 100,
  };

  const market = {
    ...config.market,
    source: 'DEMO MODE — Realistic scenario',
    lastUpdated: new Date().toISOString(),
    confidence: 100,
  };

  const government = {
    ...config.government,
    source: 'DEMO MODE — Realistic scenario',
    lastUpdated: new Date().toISOString(),
    confidence: 100,
  };

  const decisionInput: DecisionInput = {
    lat: config.lat,
    lng: config.lng,
    admin,
    weather,
    soil,
    crop,
    market,
    government,
    groundwater: { depth: scenario === 'drought' ? 3.8 : 1.9 },
  };

  const recommendations = generateRecommendations(decisionInput);

  return {
    scenario,
    location: { lat: config.lat, lng: config.lng, name: config.name },
    admin,
    weather,
    soil,
    crop,
    market,
    government,
    recommendations,
    decisionInput,
    smsPreview: config.sms,
  };
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<DemoScenario | null>(null);
  const [demoData, setDemoData] = useState<DemoData | null>(null);

  const setScenario = (scenario: DemoScenario) => {
    const newData = buildDemoData(scenario);
    setCurrentScenario(scenario);
    setDemoData(newData);
    setIsDemoMode(true);
    
    // Broadcast to other parts of the app via custom event (lightweight)
    window.dispatchEvent(new CustomEvent('demo-scenario-changed', { 
      detail: { scenario, data: newData } 
    }));
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setCurrentScenario(null);
    setDemoData(null);
    window.dispatchEvent(new CustomEvent('demo-mode-exited'));
  };

  const toggleDemoMode = () => {
    if (isDemoMode) {
      exitDemoMode();
    } else {
      // Default to normal season
      setScenario('normal');
    }
  };

  // Persist demo state across refreshes for presentation convenience
  useEffect(() => {
    const saved = localStorage.getItem('mekong-demo-scenario');
    if (saved && Object.keys(SCENARIO_CONFIG).includes(saved)) {
      setScenario(saved as DemoScenario);
    }
  }, []);

  useEffect(() => {
    if (currentScenario) {
      localStorage.setItem('mekong-demo-scenario', currentScenario);
    } else {
      localStorage.removeItem('mekong-demo-scenario');
    }
  }, [currentScenario]);

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      currentScenario,
      demoData,
      setScenario,
      exitDemoMode,
      toggleDemoMode,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    // Return safe defaults if not wrapped (graceful fallback)
    return {
      isDemoMode: false,
      currentScenario: null,
      demoData: null,
      setScenario: () => {},
      exitDemoMode: () => {},
      toggleDemoMode: () => {},
    };
  }
  return context;
}

// Helper hook that components can use to get the active data (demo or real)
export function useDemoAwareData<T>(realData: T, demoOverride?: any): T {
  const { isDemoMode, demoData } = useDemoMode();
  
  if (!isDemoMode || !demoData) return realData;
  
  // Return demo version when available
  return demoOverride || realData;
}
