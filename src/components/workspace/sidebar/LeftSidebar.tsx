import React from 'react';
import { Button } from '../../common/Button';
import { EmptyState } from '../../common/EmptyState';
import { useGeodesisTwin } from '../../../hooks/useGeodesisTwin';

/**
 * LeftSidebar (Batch 3 - State Wired)
 */
interface LeftSidebarProps {
  onCollapse?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onCollapse }) => {
  const { scenario, timeline } = useGeodesisTwin();
  const { state: scenarioState, selectScenario, updateName } = scenario;
  const { setYear } = timeline;

  const demoRegions = [
    'An Giang Province',
    'Kien Giang Province',
    'Soc Trang Province',
    'Dong Thap Province',
    'Can Tho City',
  ];

  const demoScenarios = [
    { id: 'baseline', name: 'Baseline 2026', year: 2026 },
    { id: 'drought', name: 'Moderate Drought', year: 2030 },
    { id: 'salinity', name: 'Salinity Spike', year: 2035 },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-white text-sm">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="font-semibold tracking-tight">Scenarios</div>
        {onCollapse && (
          <button onClick={onCollapse} className="text-xs text-[var(--geodesis-text-muted)] hover:text-[var(--geodesis-text-secondary)]">
            Collapse
          </button>
        )}
      </div>

      {/* Scenario Library */}
      <div className="p-4 space-y-2">
        <div className="uppercase tracking-[1px] text-[10px] font-semibold text-[var(--geodesis-text-muted)] mb-1">
          SAVED SCENARIOS
        </div>

        {demoScenarios.map((sc) => (
          <div 
            key={sc.id}
            onClick={() => {
              selectScenario(sc.id);
              setYear(sc.year);
            }}
            className={`px-3 py-2 rounded-2xl border cursor-pointer transition-colors ${
              scenarioState.selectedScenarioId === sc.id 
                ? 'border-[var(--geodesis-primary)] bg-emerald-50' 
                : 'border-[var(--geodesis-border)] hover:border-[var(--geodesis-primary)]'
            }`}
          >
            <div className="font-medium">{sc.name}</div>
            <div className="text-[10px] text-[var(--geodesis-text-muted)]">{sc.year}</div>
          </div>
        ))}

        <Button 
          variant="secondary" 
          size="sm" 
          fullWidth 
          className="mt-2"
          onClick={() => {
            updateName('New Scenario');
            selectScenario('new');
          }}
        >
          + New Scenario
        </Button>
      </div>

      {/* Region Explorer */}
      <div className="px-4 pt-4 border-t">
        <div className="uppercase tracking-[1px] text-[10px] font-semibold text-[var(--geodesis-text-muted)] mb-2">
          QUICK REGIONS
        </div>

        <div className="space-y-1">
          {demoRegions.map((region, i) => (
            <button
              key={i}
              onClick={() => timeline.setYear(2026)}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-50 text-[var(--geodesis-text-secondary)] text-sm"
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t">
        <EmptyState
          title="No saved projects"
          description="Create scenarios to see them here"
          className="text-center py-4"
        />
      </div>
    </div>
  );
};
