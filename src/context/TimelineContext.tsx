import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  TimelineState,
  TimelineAction,
  DEFAULT_TIMELINE_STATE,
  Year,
} from '../types/workspace';

interface TimelineContextValue {
  state: TimelineState;
  dispatch: React.Dispatch<TimelineAction>;
  // Convenience API
  setYear: (year: Year) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  goToNextYear: () => void;
  goToPreviousYear: () => void;
}

const TimelineContext = createContext<TimelineContextValue | undefined>(undefined);

function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case 'SET_YEAR': {
      const validYear = state.years.includes(action.payload) ? action.payload : state.currentYear;
      return { ...state, selectedYear: validYear };
    }
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_SPEED':
      return { ...state, playbackSpeed: Math.max(0.5, Math.min(4, action.payload)) };
    default:
      return state;
  }
}

interface TimelineProviderProps {
  children: ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, DEFAULT_TIMELINE_STATE);

  const value: TimelineContextValue = {
    state,
    dispatch,
    setYear: (year) => dispatch({ type: 'SET_YEAR', payload: year }),
    togglePlay: () => dispatch({ type: 'TOGGLE_PLAY' }),
    setSpeed: (speed) => dispatch({ type: 'SET_SPEED', payload: speed }),
    goToNextYear: () => {
      const idx = state.years.indexOf(state.selectedYear);
      const next = state.years[Math.min(idx + 1, state.years.length - 1)];
      dispatch({ type: 'SET_YEAR', payload: next });
    },
    goToPreviousYear: () => {
      const idx = state.years.indexOf(state.selectedYear);
      const prev = state.years[Math.max(idx - 1, 0)];
      dispatch({ type: 'SET_YEAR', payload: prev });
    },
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = (): TimelineContextValue => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};
