import React from 'react';
import { MetricCard } from '../../common/MetricCard';
import { Button } from '../../common/Button';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { useGeodesisTwin } from '../../../hooks/useGeodesisTwin';
import { InsightsPanel } from './InsightsPanel';

/**
 * RightPanel - The live command center of the Digital Twin.
 * 
 * Fully reactive to:
 * - Location selection
 * - Timeline year
 * - Scenario parameters
 * - Simulation completion
 */
interface RightPanelProps {
  onCollapse?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onCollapse }) => {
  const {
    scenario,
    selectedLocation,
    currentYear,
    liveMetrics,
    simulationResults,
    isSimulationRunning,
    runSimulation,
  } = useGeodesisTwin();

  const { state: sc, updateParameters } = scenario;

  const locationInfo = selectedLocation
    ? `${selectedLocation.lat.toFixed(3)}, ${selectedLocation.lng.toFixed(3)}`
    : 'No location selected (click map)';

  const hasSimulation = !!simulationResults && !!simulationResults[currentYear];

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-white text-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <div className="font-semibold tracking-tight">Insights</div>
        {onCollapse && (
          <button onClick={onCollapse} className="text-xs px-2 py-1 text-[var(--geodesis-text-muted)] hover:text-[var(--geodesis-text-secondary)]">
            Hide
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Current State - LIVE from twin */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="uppercase text-[10px] font-semibold tracking-widest text-[var(--geodesis-text-muted)]">CURRENT STATE</div>
            <div className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
              {locationInfo} • {currentYear}
            </div>
          </div>

          {isSimulationRunning ? (
            <div className="space-y-3">
              <LoadingSkeleton lines={4} height="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 transition-all">
              <MetricCard 
                label="Yield" 
                value={liveMetrics.yield} 
                unit="t/ha" 
                delta={hasSimulation ? "+0.3" : undefined} 
                trend="up" 
              />
              <MetricCard 
                label="Salinity" 
                value={liveMetrics.salinity} 
                unit="dS/m" 
                delta={liveMetrics.salinity > 5 ? "+0.6" : "-0.2"} 
                trend={liveMetrics.salinity > 5 ? "up" : "down"} 
              />
              <MetricCard label="Water Index" value={liveMetrics.waterIndex} />
              <MetricCard 
                label="Risk Score" 
                value={liveMetrics.riskScore} 
                unit="" 
                delta={liveMetrics.riskScore > 50 ? "+8" : undefined}
                trend="up" 
              />
            </div>
          )}
        </div>

        {/* Scenario Builder */}
        <div className="pt-2">
          <div className="uppercase text-[10px] font-semibold tracking-widest text-[var(--geodesis-text-muted)] mb-3">SCENARIO BUILDER</div>

          <div className="space-y-3 border border-[var(--geodesis-border)] rounded-2xl p-4 bg-slate-50/50">
            <div className="text-sm font-medium">{sc.scenarioName} • {currentYear}</div>
            
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Rainfall Change</span>
                  <span className="font-mono">{sc.parameters.rainfallDelta}%</span>
                </div>
                <input 
                  type="range" 
                  min="-40" max="20" step="5"
                  value={sc.parameters.rainfallDelta}
                  onChange={(e) => updateParameters({ rainfallDelta: parseInt(e.target.value) })}
                  className="w-full accent-[var(--geodesis-primary)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Salinity Increase</span>
                  <span className="font-mono">+{sc.parameters.salinityDelta}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="4" step="0.2"
                  value={sc.parameters.salinityDelta}
                  onChange={(e) => updateParameters({ salinityDelta: parseFloat(e.target.value) })}
                  className="w-full accent-[var(--geodesis-primary)]"
                />
              </div>
            </div>

            <Button 
              fullWidth 
              variant="primary" 
              size="sm"
              onClick={runSimulation}
              disabled={isSimulationRunning}
            >
              {isSimulationRunning ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </div>
        </div>

        {/* AI Insights + Economic — fully wired via InsightsPanel (reuses DecisionIntelligence + EconomicDecision) */}
        <InsightsPanel />

        {simulationResults && (
          <div className="text-[10px] text-emerald-600 bg-emerald-50 p-2 rounded mt-2">
            Simulation complete for {Object.keys(simulationResults).join(', ')}. Timeline reflects projected outcomes.
          </div>
        )}
      </div>
    </div>
  );
};
