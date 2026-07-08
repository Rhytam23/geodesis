import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  WorkspaceState,
  WorkspaceAction,
  DEFAULT_WORKSPACE_STATE,
} from '../types/workspace';

interface WorkspaceContextValue {
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  // Convenience methods
  setActiveTab: (tab: 'workspace' | 'settings') => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setPanelMode: (mode: WorkspaceState['activePanelMode']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'TOGGLE_RIGHT_PANEL':
      return { ...state, rightPanelCollapsed: !state.rightPanelCollapsed };
    case 'SET_PANEL_MODE':
      return { ...state, activePanelMode: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, DEFAULT_WORKSPACE_STATE);

  const value: WorkspaceContextValue = {
    state,
    dispatch,
    setActiveTab: (tab) => dispatch({ type: 'SET_TAB', payload: tab }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    toggleRightPanel: () => dispatch({ type: 'TOGGLE_RIGHT_PANEL' }),
    setPanelMode: (mode) => dispatch({ type: 'SET_PANEL_MODE', payload: mode }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextValue => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
