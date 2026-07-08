/**
 * Geodesis Workspace State Types
 * 
 * All types for the Workspace orchestration layer (Batch 3).
 * Local state only. No backend, no simulation.
 */

export type Year = number;

export type PanelMode = 'current' | 'scenario' | 'insights' | 'compare';

export type ScenarioStatus = 'draft' | 'saved' | 'running' | 'complete';

export interface WorkspaceState {
  activeTab: 'workspace' | 'settings';
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  activePanelMode: PanelMode;
  isLoading: boolean;
  error: string | null;
  selectedLocation: { lat: number; lng: number; meta?: any } | null;
  simulationResults: Record<number, { yield: number; profit: number; waterUse: number; riskScore: number }> | null;
  isSimulationRunning: boolean;
}

export interface TimelineState {
  currentYear: Year;
  selectedYear: Year;
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, etc.
  years: Year[];
  isVisible: boolean;
}

export interface ScenarioState {
  selectedScenarioId: string | null;
  scenarioName: string;
  status: ScenarioStatus;
  hasUnsavedChanges: boolean;
  // Simple mock parameters (no engine connection)
  parameters: {
    rainfallDelta: number;   // %
    salinityDelta: number;   // dS/m
    awdAdoption: number;     // %
  };
}

export interface UIState {
  selectedTab: string;
  activeDrawer: string | null;
  openDialog: string | null;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning';
  }>;
  panelSizes: {
    sidebarWidth: number;
    rightPanelWidth: number;
  };
}

export type WorkspaceAction =
  | { type: 'SET_TAB'; payload: 'workspace' | 'settings' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_RIGHT_PANEL' }
  | { type: 'SET_PANEL_MODE'; payload: PanelMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOCATION'; payload: { lat: number; lng: number; meta?: any } | null }
  | { type: 'SET_SIMULATION_RESULTS'; payload: any | null }
  | { type: 'SET_SIMULATION_RUNNING'; payload: boolean };

export type TimelineAction =
  | { type: 'SET_YEAR'; payload: Year }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_SPEED'; payload: number };

export type ScenarioAction =
  | { type: 'SELECT_SCENARIO'; payload: string | null }
  | { type: 'UPDATE_NAME'; payload: string }
  | { type: 'UPDATE_PARAMETERS'; payload: Partial<ScenarioState['parameters']> }
  | { type: 'SET_STATUS'; payload: ScenarioStatus }
  | { type: 'MARK_SAVED' };

export type UIAction =
  | { type: 'SET_TAB'; payload: string }
  | { type: 'OPEN_DRAWER'; payload: string | null }
  | { type: 'OPEN_DIALOG'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: UIState['notifications'][0] }
  | { type: 'DISMISS_NOTIFICATION'; payload: string };

// Default values (mock data)
export const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  activeTab: 'workspace',
  sidebarCollapsed: false,
  rightPanelCollapsed: false,
  activePanelMode: 'current',
  isLoading: false,
  error: null,
  selectedLocation: null,
  simulationResults: null,
  isSimulationRunning: false,
};

export const DEFAULT_TIMELINE_STATE: TimelineState = {
  currentYear: 2026,
  selectedYear: 2026,
  isPlaying: false,
  playbackSpeed: 1,
  years: [2026, 2027, 2028, 2029, 2030, 2035, 2040, 2050],
  isVisible: true,
};

export const DEFAULT_SCENARIO_STATE: ScenarioState = {
  selectedScenarioId: null,
  scenarioName: 'New Scenario',
  status: 'draft',
  hasUnsavedChanges: false,
  parameters: {
    rainfallDelta: -15,
    salinityDelta: 0.8,
    awdAdoption: 35,
  },
};

export const DEFAULT_UI_STATE: UIState = {
  selectedTab: 'insights',
  activeDrawer: null,
  openDialog: null,
  notifications: [],
  panelSizes: {
    sidebarWidth: 280,
    rightPanelWidth: 320,
  },
};
