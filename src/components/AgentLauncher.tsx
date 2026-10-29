import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { useGeodesisTwin } from '../hooks/useGeodesisTwin';
import { buildAgentContext } from '../services/agentContext';
import AgentDrawer from './AgentDrawer';

/**
 * Entry point for the Geodesis Agent. Hands the agent exactly the state shown in the
 * workspace (location, year, metrics, scenario, projections) and opens the drawer.
 */
export default function AgentLauncher() {
  const { selectedLocation, currentYear, liveMetrics, simulationResults, scenario } = useGeodesisTwin();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { scenarioName, parameters } = scenario.state;

  const context = useMemo(
    () =>
      buildAgentContext({
        selectedLocation,
        currentYear,
        liveMetrics,
        simulationResults,
        scenario: {
          name: scenarioName || 'Custom scenario',
          rainfallDelta: parameters.rainfallDelta,
          salinityDelta: parameters.salinityDelta,
          awdAdoption: parameters.awdAdoption,
        },
      }),
    [selectedLocation, currentYear, liveMetrics, simulationResults, scenarioName, parameters.rainfallDelta, parameters.salinityDelta, parameters.awdAdoption],
  );

  const close = () => {
    setOpen(false);
    window.setTimeout(() => buttonRef.current?.focus(), 0);
  };

  return (
    <div className="pt-2">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--geodesis-text-muted)]">GEODESIS AGENT</div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <p className="text-xs leading-relaxed text-slate-600">
          Ask a question about this place and scenario. The agent plans its research, pulls a live forecast and web evidence,
          reasons with Nemotron, then checks every citation.
        </p>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--geodesis-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--geodesis-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--geodesis-primary)] focus:ring-offset-2"
        >
          <Sparkles className="h-4 w-4" aria-hidden /> Ask the agent
        </button>
        <div className="mt-2 text-center text-[10px] text-slate-500">Nemotron on Nebius Token Factory · evidence via Tavily</div>
      </div>
      {open && createPortal(<AgentDrawer context={context} onClose={close} />, document.body)}
    </div>
  );
}
