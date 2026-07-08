import React from 'react';
import { TopNavigation } from './TopNavigation';
import { LeftSidebar } from '../sidebar/LeftSidebar';
import { MapView } from '../map/MapView';
import { RightPanel } from '../right-panel/RightPanel';
import { BottomTimeline } from '../timeline/BottomTimeline';
import { useGeodesisTwin } from '../../../hooks/useGeodesisTwin';

/**
 * WorkspaceLayout (Batch 3 - State Wired)
 * 
 * The primary responsive shell now connected to workspace state.
 * All local useState has been replaced with context-driven state.
 * 
 * Pure UI wiring. No business logic.
 */
export const WorkspaceLayout: React.FC = () => {
  const { workspace, timeline } = useGeodesisTwin();

  const { 
    state: workspaceState, 
    setActiveTab, 
    toggleSidebar, 
    toggleRightPanel 
  } = workspace;

  const { 
    state: timelineState 
  } = timeline;

  if (workspaceState.activeTab === 'settings') {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--geodesis-background)]">
        <TopNavigation />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--geodesis-text-primary)] mb-3">
              Settings
            </h2>
            <p className="text-[var(--geodesis-text-muted)] mb-6">
              Workspace settings and preferences will live here.
            </p>
            <button
              onClick={() => setActiveTab('workspace')}
              className="px-5 py-2.5 text-sm font-medium rounded-2xl bg-[var(--geodesis-primary)] text-white hover:bg-[var(--geodesis-primary-hover)]"
            >
              Return to Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--geodesis-background)]">
      <TopNavigation />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main 3-column area */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar */}
          <div 
            className={`border-r border-[var(--geodesis-border)] bg-white transition-all duration-200 flex-shrink-0 overflow-auto ${
              workspaceState.sidebarCollapsed ? 'w-0' : 'w-72'
            }`}
          >
            {!workspaceState.sidebarCollapsed && (
              <LeftSidebar onCollapse={toggleSidebar} />
            )}
          </div>

          {/* Center: Map Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            <div className="flex-1 relative bg-[#F1F5F9]">
              <MapView 
                onLocationSelect={() => {}}
                selectedYear={timelineState.selectedYear} 
              />
            </div>
          </div>

          {/* Right Panel */}
          <div 
            className={`border-l border-[var(--geodesis-border)] bg-white transition-all duration-200 flex-shrink-0 overflow-auto ${
              workspaceState.rightPanelCollapsed ? 'w-0' : 'w-80'
            }`}
          >
            {!workspaceState.rightPanelCollapsed && (
              <RightPanel onCollapse={toggleRightPanel} />
            )}
          </div>
        </div>

        {/* Bottom Timeline - fully wired */}
        <div className="h-[92px] border-t border-[var(--geodesis-border)] bg-white flex-shrink-0">
          <BottomTimeline />
        </div>
      </div>

      {/* Collapse controls */}
      <div className="fixed bottom-20 left-3 z-50 flex flex-col gap-1 text-xs">
        {workspaceState.sidebarCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="px-2 py-1 bg-white border border-[var(--geodesis-border)] rounded text-[var(--geodesis-text-muted)] hover:text-[var(--geodesis-text-primary)]"
          >
            Show Sidebar
          </button>
        )}
      </div>
    </div>
  );
};
