import { useCallback, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import dataService from '../services/dataService';

// Custom hook for dashboard data management
export const useDashboardData = () => {
  const { state, actions } = useAppContext();

  // Load data for current dashboard
  const loadDashboardData = useCallback(async (dashboardId) => {
    try {
      // Set loading state
      actions.setDashboardLoading(dashboardId, true);

      // Check if data is already cached
      const cachedData = dataService.loadData(dashboardId);
      if (cachedData) {
        actions.setDashboardData(dashboardId, cachedData);
        actions.setDashboardLoading(dashboardId, false);
        return cachedData;
      }

      // If no cached data, return null (data should be loaded via ExcelUploader)
      actions.setDashboardLoading(dashboardId, false);
      return null;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      actions.setError(error.message);
      actions.setDashboardLoading(dashboardId, false);
      return null;
    }
  }, [actions]);

  // Save data for current dashboard
  const saveDashboardData = useCallback((dashboardId, data) => {
    try {
      const success = dataService.saveData(dashboardId, data);
      if (success) {
        actions.setDashboardData(dashboardId, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving dashboard data:', error);
      actions.setError(error.message);
      return false;
    }
  }, [actions]);

  // Clear data for specific dashboard
  const clearDashboardData = useCallback((dashboardId) => {
    try {
      const success = dataService.clearDashboardData(dashboardId);
      if (success) {
        actions.clearDashboardData(dashboardId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing dashboard data:', error);
      return false;
    }
  }, [actions]);

  // Switch dashboard and load its data
  const switchDashboard = useCallback(async (dashboardId) => {
    try {
      // Update current dashboard
      actions.setCurrentDashboard(dashboardId);
      
      // Only load data if we don't already have it
      const hasCachedData = dataService.hasData(dashboardId);
      if (!hasCachedData) {
        await loadDashboardData(dashboardId);
      }
    } catch (error) {
      console.error('Error switching dashboard:', error);
      actions.setError(error.message);
    }
  }, [actions, loadDashboardData]);

  // Get current dashboard data
  const getCurrentDashboardData = useCallback(() => {
    return state.dashboardData[state.currentDashboard] || state.data;
  }, [state.dashboardData, state.currentDashboard, state.data]);

  // Check if current dashboard has data
  const hasCurrentDashboardData = useCallback(() => {
    return dataService.hasData(state.currentDashboard) || state.dataLoaded;
  }, [state.currentDashboard, state.dataLoaded]);

  // Get data age for current dashboard
  const getCurrentDataAge = useCallback(() => {
    return dataService.getDataAge(state.currentDashboard);
  }, [state.currentDashboard]);

  // Auto-load data when dashboard changes
  useEffect(() => {
    if (state.currentDashboard && !state.dataLoaded) {
      loadDashboardData(state.currentDashboard);
    }
  }, [state.currentDashboard, state.dataLoaded, loadDashboardData]);

  return {
    // State
    currentDashboard: state.currentDashboard,
    data: getCurrentDashboardData(),
    dataLoaded: state.dataLoaded,
    error: state.error,
    isLoading: state.dashboardLoading[state.currentDashboard] || false,
    
    // Actions
    loadDashboardData,
    saveDashboardData,
    clearDashboardData,
    switchDashboard,
    
    // Utilities
    hasCurrentDashboardData,
    getCurrentDataAge,
    
    // Data service stats
    getDataStats: () => dataService.getDataStats(),
    cleanupOldData: () => dataService.cleanupOldData(),
    exportData: () => dataService.exportData(),
    importData: (jsonData) => dataService.importData(jsonData)
  };
};

export default useDashboardData;
