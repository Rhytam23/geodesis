import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ScenarioState,
  ScenarioAction,
  DEFAULT_SCENARIO_STATE,
} from '../types/workspace';

interface ScenarioContextValue {
  state: ScenarioState;
  dispatch: React.Dispatch<ScenarioAction>;
  selectScenario: (id: string | null) => void;
  updateName: (name: string) => void;
  updateParameters: (params: Partial<ScenarioState['parameters']>) => void;
  setStatus: (status: ScenarioState['status']) => void;
  markSaved: () => void;
  resetScenario: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | undefined>(undefined);

function scenarioReducer(state: ScenarioState, action: ScenarioAction): ScenarioState {
  switch (action.type) {
    case 'SELECT_SCENARIO':
      return {
        ...state,
        selectedScenarioId: action.payload,
        hasUnsavedChanges: true,
      };
    case 'UPDATE_NAME':
      return { ...state, scenarioName: action.payload, hasUnsavedChanges: true };
    case 'UPDATE_PARAMETERS':
      return {
        ...state,
        parameters: { ...state.parameters, ...action.payload },
        hasUnsavedChanges: true,
      };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'MARK_SAVED':
      return { ...state, hasUnsavedChanges: false, status: 'saved' };
    default:
      return state;
  }
}

interface ScenarioProviderProps {
  children: ReactNode;
}

export const ScenarioProvider: React.FC<ScenarioProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(scenarioReducer, DEFAULT_SCENARIO_STATE);

  const value: ScenarioContextValue = {
    state,
    dispatch,
    selectScenario: (id) => dispatch({ type: 'SELECT_SCENARIO', payload: id }),
    updateName: (name) => dispatch({ type: 'UPDATE_NAME', payload: name }),
    updateParameters: (params) => dispatch({ type: 'UPDATE_PARAMETERS', payload: params }),
    setStatus: (status) => dispatch({ type: 'SET_STATUS', payload: status }),
    markSaved: () => dispatch({ type: 'MARK_SAVED' }),
    resetScenario: () => {
      // Reset to defaults without full reload
      dispatch({ type: 'SELECT_SCENARIO', payload: null });
      dispatch({ type: 'UPDATE_NAME', payload: DEFAULT_SCENARIO_STATE.scenarioName });
      dispatch({ type: 'UPDATE_PARAMETERS', payload: DEFAULT_SCENARIO_STATE.parameters });
      dispatch({ type: 'SET_STATUS', payload: 'draft' });
    },
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextValue => {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
