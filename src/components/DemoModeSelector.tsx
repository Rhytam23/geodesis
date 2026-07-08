import { useState } from 'react';
import { useDemoMode, DemoScenario } from '../context/DemoModeContext';
import { Play, X } from 'lucide-react';

const SCENARIOS: { id: DemoScenario; label: string; color: string }[] = [
  { id: 'normal', label: 'Normal Season', color: 'emerald' },
  { id: 'flood', label: 'Flood Warning', color: 'sky' },
  { id: 'drought', label: 'Drought', color: 'amber' },
  { id: 'high-salinity', label: 'High Salinity', color: 'red' },
  { id: 'gov-response', label: 'Government Response', color: 'violet' },
];

export default function DemoModeSelector() {
  const { isDemoMode, currentScenario, setScenario, exitDemoMode, toggleDemoMode } = useDemoMode();
  const [, setIsOpen] = useState(false);

  const current = SCENARIOS.find(s => s.id === currentScenario);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {!isDemoMode ? (
        <button
          onClick={toggleDemoMode}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-medium transition-all active:scale-[0.985]"
        >
          <Play className="w-4 h-4" />
          DEMO MODE
        </button>
      ) : (
        <div className="bg-white border border-emerald-200 shadow-xl rounded-3xl overflow-hidden w-72">
          {/* Header */}
          <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              DEMO MODE ACTIVE
            </div>
            <button onClick={exitDemoMode} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Scenario */}
          <div className="px-4 py-3 border-b">
            <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold mb-0.5">CURRENT SCENARIO</div>
            <div className="font-semibold text-emerald-900">{current?.label || 'Custom'}</div>
            {currentScenario && (
              <div className="text-xs text-emerald-600 mt-0.5">
                {SCENARIO_CONFIG[currentScenario as DemoScenario]?.location.name}
              </div>
            )}
          </div>

          {/* Scenario Buttons */}
          <div className="p-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 px-2 mb-1.5 font-medium">SWITCH SCENARIO</div>
            <div className="grid grid-cols-1 gap-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setScenario(s.id);
                    setIsOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-2xl text-sm flex items-center justify-between transition ${
                    currentScenario === s.id 
                      ? 'bg-emerald-100 text-emerald-900 font-medium' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{s.label}</span>
                  {currentScenario === s.id && <span className="text-[10px] text-emerald-600">ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pb-3 text-[10px] text-center text-slate-500 border-t pt-2">
            All panels update instantly • Perfect for live demos
          </div>
        </div>
      )}
    </div>
  );
}

// Local reference for the component (avoids import cycle)
const SCENARIO_CONFIG: any = {
  normal: { location: { name: 'Can Tho — Normal Season' } },
  flood: { location: { name: 'Kien Giang — Flood Warning' } },
  drought: { location: { name: 'An Giang — Drought' } },
  'high-salinity': { location: { name: 'Soc Trang — High Salinity' } },
  'gov-response': { location: { name: 'Tra Vinh — Government Response' } },
};
