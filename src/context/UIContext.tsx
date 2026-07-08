import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  UIState,
  UIAction,
  DEFAULT_UI_STATE,
} from '../types/workspace';

interface UIContextValue {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  setTab: (tab: string) => void;
  openDrawer: (id: string | null) => void;
  openDialog: (id: string | null) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  dismissNotification: (id: string) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, selectedTab: action.payload };
    case 'OPEN_DRAWER':
      return { ...state, activeDrawer: action.payload };
    case 'OPEN_DIALOG':
      return { ...state, openDialog: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    default:
      return state;
  }
}

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, DEFAULT_UI_STATE);

  const value: UIContextValue = {
    state,
    dispatch,
    setTab: (tab) => dispatch({ type: 'SET_TAB', payload: tab }),
    openDrawer: (id) => dispatch({ type: 'OPEN_DRAWER', payload: id }),
    openDialog: (id) => dispatch({ type: 'OPEN_DIALOG', payload: id }),
    addNotification: (notif) => {
      const id = `notif-${Date.now()}`;
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { ...notif, id },
      });
    },
    dismissNotification: (id) => dispatch({ type: 'DISMISS_NOTIFICATION', payload: id }),
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextValue => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
