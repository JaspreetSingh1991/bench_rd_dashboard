import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // Dashboard data
  data: null,
  error: null,
  dataLoaded: false,
  
  // UI state
  activeView: 'upload',
  sidebarOpen: false,
  currentDashboard: 'supply-quality',
  
  // Modal state
  detailsOpen: false,
  detailsData: [],
  detailsTitle: '',
  detailsFilters: {},
  
  // Data cache for each dashboard
  dashboardData: {
    'supply-quality': null,
    'demand-forecast': null,
    'performance-analytics': null,
    'capacity-planning': null
  },
  
  // Loading states for each dashboard
  dashboardLoading: {
    'supply-quality': false,
    'demand-forecast': false,
    'performance-analytics': false,
    'capacity-planning': false
  }
};

// Action types
export const ActionTypes = {
  // Data actions
  SET_DATA: 'SET_DATA',
  SET_ERROR: 'SET_ERROR',
  SET_DATA_LOADED: 'SET_DATA_LOADED',
  CLEAR_DATA: 'CLEAR_DATA',
  
  // UI actions
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_CURRENT_DASHBOARD: 'SET_CURRENT_DASHBOARD',
  
  // Modal actions
  SET_DETAILS_OPEN: 'SET_DETAILS_OPEN',
  SET_DETAILS_DATA: 'SET_DETAILS_DATA',
  SET_DETAILS_TITLE: 'SET_DETAILS_TITLE',
  SET_DETAILS_FILTERS: 'SET_DETAILS_FILTERS',
  
  // Dashboard data actions
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_DASHBOARD_LOADING: 'SET_DASHBOARD_LOADING',
  CLEAR_DASHBOARD_DATA: 'CLEAR_DASHBOARD_DATA',
  
  // Bulk actions
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_DATA:
      return {
        ...state,
        data: action.payload,
        error: null,
        dataLoaded: true
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        dataLoaded: false
      };
      
    case ActionTypes.SET_DATA_LOADED:
      return {
        ...state,
        dataLoaded: action.payload
      };
      
    case ActionTypes.CLEAR_DATA:
      return {
        ...state,
        data: null,
        error: null,
        dataLoaded: false
      };
      
    case ActionTypes.SET_ACTIVE_VIEW:
      return {
        ...state,
        activeView: action.payload
      };
      
    case ActionTypes.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload
      };
      
    case ActionTypes.SET_CURRENT_DASHBOARD:
      const hasCachedData = state.dashboardData[action.payload];
      return {
        ...state,
        currentDashboard: action.payload,
        // Load cached data for the new dashboard if available
        data: hasCachedData || state.data,
        dataLoaded: hasCachedData ? true : (state.data ? true : false)
      };
      
    case ActionTypes.SET_DETAILS_OPEN:
      return {
        ...state,
        detailsOpen: action.payload
      };
      
    case ActionTypes.SET_DETAILS_DATA:
      return {
        ...state,
        detailsData: action.payload
      };
      
    case ActionTypes.SET_DETAILS_TITLE:
      return {
        ...state,
        detailsTitle: action.payload
      };
      
    case ActionTypes.SET_DETAILS_FILTERS:
      return {
        ...state,
        detailsFilters: action.payload
      };
      
    case ActionTypes.SET_DASHBOARD_DATA:
      const isCurrentDashboard = action.payload.dashboardId === state.currentDashboard;
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          [action.payload.dashboardId]: action.payload.data
        },
        // If this is the current dashboard, also update the main data
        data: isCurrentDashboard ? action.payload.data : state.data
      };
      
    case ActionTypes.SET_DASHBOARD_LOADING:
      return {
        ...state,
        dashboardLoading: {
          ...state.dashboardLoading,
          [action.payload.dashboardId]: action.payload.loading
        }
      };
      
    case ActionTypes.CLEAR_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          [action.payload]: null
        }
      };
      
    case ActionTypes.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist data to localStorage when it changes
  useEffect(() => {
    if (state.data && state.dataLoaded) {
      localStorage.setItem('dashboardData', JSON.stringify({
        data: state.data,
        dashboardData: state.dashboardData,
        currentDashboard: state.currentDashboard
      }));
    }
  }, [state.data, state.dataLoaded, state.dashboardData, state.currentDashboard]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.data) {
          dispatch({
            type: ActionTypes.SET_DATA,
            payload: parsedData.data
          });
        }
        if (parsedData.dashboardData) {
          Object.entries(parsedData.dashboardData).forEach(([dashboardId, data]) => {
            if (data) {
              dispatch({
                type: ActionTypes.SET_DASHBOARD_DATA,
                payload: { dashboardId, data }
              });
            }
          });
        }
        if (parsedData.currentDashboard) {
          dispatch({
            type: ActionTypes.SET_CURRENT_DASHBOARD,
            payload: parsedData.currentDashboard
          });
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Action creators
  const actions = {
    // Data actions
    setData: (data) => dispatch({ type: ActionTypes.SET_DATA, payload: data }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    setDataLoaded: (loaded) => dispatch({ type: ActionTypes.SET_DATA_LOADED, payload: loaded }),
    clearData: () => dispatch({ type: ActionTypes.CLEAR_DATA }),
    
    // UI actions
    setActiveView: (view) => dispatch({ type: ActionTypes.SET_ACTIVE_VIEW, payload: view }),
    setSidebarOpen: (open) => dispatch({ type: ActionTypes.SET_SIDEBAR_OPEN, payload: open }),
    setCurrentDashboard: (dashboard) => dispatch({ type: ActionTypes.SET_CURRENT_DASHBOARD, payload: dashboard }),
    
    // Modal actions
    setDetailsOpen: (open) => dispatch({ type: ActionTypes.SET_DETAILS_OPEN, payload: open }),
    setDetailsData: (data) => dispatch({ type: ActionTypes.SET_DETAILS_DATA, payload: data }),
    setDetailsTitle: (title) => dispatch({ type: ActionTypes.SET_DETAILS_TITLE, payload: title }),
    setDetailsFilters: (filters) => dispatch({ type: ActionTypes.SET_DETAILS_FILTERS, payload: filters }),
    
    // Dashboard data actions
    setDashboardData: (dashboardId, data) => dispatch({ 
      type: ActionTypes.SET_DASHBOARD_DATA, 
      payload: { dashboardId, data } 
    }),
    setDashboardLoading: (dashboardId, loading) => dispatch({ 
      type: ActionTypes.SET_DASHBOARD_LOADING, 
      payload: { dashboardId, loading } 
    }),
    clearDashboardData: (dashboardId) => dispatch({ 
      type: ActionTypes.CLEAR_DASHBOARD_DATA, 
      payload: dashboardId 
    }),
    
    // Bulk actions
    resetState: () => dispatch({ type: ActionTypes.RESET_STATE })
  };

  const value = {
    state,
    actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
