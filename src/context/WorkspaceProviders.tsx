import React, { ReactNode } from 'react';
import { WorkspaceProvider } from './WorkspaceContext';
import { TimelineProvider } from './TimelineContext';
import { ScenarioProvider } from './ScenarioContext';
import { UIProvider } from './UIContext';

/**
 * WorkspaceProviders
 * 
 * Clean hierarchical composition of all workspace contexts.
 * This is the single entry point for the Geodesis state layer.
 */
interface WorkspaceProvidersProps {
  children: ReactNode;
}

export const WorkspaceProviders: React.FC<WorkspaceProvidersProps> = ({ children }) => {
  return (
    <WorkspaceProvider>
      <TimelineProvider>
        <ScenarioProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </ScenarioProvider>
      </TimelineProvider>
    </WorkspaceProvider>
  );
};
