import React from 'react';
import { Button } from '../../common/Button';
import { useGeodesisTwin } from '../../../hooks/useGeodesisTwin';

/**
 * TopNavigation (Batch 3 - State Wired)
 * 
 * Minimal top bar connected to WorkspaceContext.
 */
export const TopNavigation: React.FC = () => {
  const { workspace } = useGeodesisTwin();
  const { state, setActiveTab } = workspace;

  return (
    <header className="h-14 border-b border-[var(--geodesis-border)] bg-white flex items-center px-6 shrink-0 z-40">
      <div className="flex items-center justify-between w-full">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--geodesis-primary)] rounded-2xl flex items-center justify-center text-white font-bold text-lg tracking-tighter">
            G
          </div>
          <div>
            <span className="font-semibold tracking-tight text-lg text-[var(--geodesis-text-primary)]">Geodesis</span>
            <span className="ml-1.5 text-[10px] font-mono tracking-[2px] text-[var(--geodesis-text-muted)]">DIGITAL TWIN</span>
          </div>
        </div>

        {/* Workspace Tabs */}
        <nav className="flex items-center gap-1 text-sm">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-1.5 rounded-2xl font-medium transition-colors ${
              state.activeTab === 'workspace'
                ? 'bg-[var(--geodesis-primary)] text-white'
                : 'text-[var(--geodesis-text-secondary)] hover:bg-slate-100'
            }`}
            aria-current={state.activeTab === 'workspace' ? 'page' : undefined}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded-2xl font-medium transition-colors ${
              state.activeTab === 'settings'
                ? 'bg-[var(--geodesis-primary)] text-white'
                : 'text-[var(--geodesis-text-secondary)] hover:bg-slate-100'
            }`}
            aria-current={state.activeTab === 'settings' ? 'page' : undefined}
          >
            Settings
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            DEMO MODE
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
              JD
            </div>
            <span className="hidden md:block text-[var(--geodesis-text-secondary)]">Jane Doe</span>
          </div>

          <Button variant="secondary" size="sm">
            Export
          </Button>
        </div>
      </div>
    </header>
  );
};
