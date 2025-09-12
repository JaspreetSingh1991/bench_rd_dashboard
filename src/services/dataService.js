// Data persistence service for dashboard data
class DataService {
  constructor() {
    this.storageKey = 'bench-rd-dashboard-data';
    this.cache = new Map();
    this.maxCacheSize = 10; // Maximum number of datasets to cache
  }

  // Save data to localStorage and memory cache
  saveData(dashboardId, data) {
    try {
      const timestamp = Date.now();
      const dataWithTimestamp = {
        ...data,
        _metadata: {
          timestamp,
          dashboardId,
          version: '1.0.0'
        }
      };

      // Save to memory cache
      this.cache.set(dashboardId, dataWithTimestamp);

      // Save to localStorage
      const savedData = this.getStoredData();
      savedData.dashboardData[dashboardId] = dataWithTimestamp;
      savedData.lastUpdated = timestamp;
      
      localStorage.setItem(this.storageKey, JSON.stringify(savedData));
      
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  // Load data from cache or localStorage
  loadData(dashboardId) {
    try {
      // First check memory cache
      if (this.cache.has(dashboardId)) {
        const cachedData = this.cache.get(dashboardId);
        // Check if data is not too old (24 hours)
        const isExpired = Date.now() - cachedData._metadata.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          // Return the actual data array, not the metadata object
          const { _metadata, ...actualData } = cachedData;
          return actualData;
        } else {
          this.cache.delete(dashboardId);
        }
      }

      // Load from localStorage
      const savedData = this.getStoredData();
      if (savedData.dashboardData[dashboardId]) {
        const dataWithMetadata = savedData.dashboardData[dashboardId];
        // Extract actual data from metadata object
        const { _metadata, ...actualData } = dataWithMetadata;
        // Cache it
        this.cache.set(dashboardId, dataWithMetadata);
        return actualData;
      }

      return null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  // Get all stored data
  getStoredData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error parsing stored data:', error);
    }
    
    return {
      dashboardData: {},
      lastUpdated: null
    };
  }

  // Clear data for specific dashboard
  clearDashboardData(dashboardId) {
    try {
      // Remove from cache
      this.cache.delete(dashboardId);

      // Remove from localStorage
      const savedData = this.getStoredData();
      delete savedData.dashboardData[dashboardId];
      localStorage.setItem(this.storageKey, JSON.stringify(savedData));
      
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData() {
    try {
      this.cache.clear();
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Get data statistics
  getDataStats() {
    const savedData = this.getStoredData();
    const dashboardIds = Object.keys(savedData.dashboardData);
    
    return {
      totalDashboards: dashboardIds.length,
      cachedDashboards: this.cache.size,
      lastUpdated: savedData.lastUpdated,
      dashboardIds,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize
    };
  }

  // Check if data exists for dashboard
  hasData(dashboardId) {
    return this.cache.has(dashboardId) || this.getStoredData().dashboardData[dashboardId] !== undefined;
  }

  // Get data age in minutes
  getDataAge(dashboardId) {
    try {
      // Check memory cache first
      if (this.cache.has(dashboardId)) {
        const cachedData = this.cache.get(dashboardId);
        if (cachedData._metadata) {
          return Math.floor((Date.now() - cachedData._metadata.timestamp) / (1000 * 60));
        }
      }

      // Check localStorage
      const savedData = this.getStoredData();
      if (savedData.dashboardData[dashboardId] && savedData.dashboardData[dashboardId]._metadata) {
        return Math.floor((Date.now() - savedData.dashboardData[dashboardId]._metadata.timestamp) / (1000 * 60));
      }
      
      return null;
    } catch (error) {
      console.error('Error getting data age:', error);
      return null;
    }
  }

  // Clean up old data (older than 7 days)
  cleanupOldData() {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const savedData = this.getStoredData();
      let cleaned = false;

      Object.keys(savedData.dashboardData).forEach(dashboardId => {
        const data = savedData.dashboardData[dashboardId];
        if (data._metadata && data._metadata.timestamp < sevenDaysAgo) {
          delete savedData.dashboardData[dashboardId];
          this.cache.delete(dashboardId);
          cleaned = true;
        }
      });

      if (cleaned) {
        localStorage.setItem(this.storageKey, JSON.stringify(savedData));
      }

      return cleaned;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return false;
    }
  }

  // Export data for backup
  exportData() {
    try {
      const savedData = this.getStoredData();
      const exportData = {
        ...savedData,
        exportedAt: Date.now(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data from backup
  importData(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate the data structure
      if (importedData.dashboardData && typeof importedData.dashboardData === 'object') {
        localStorage.setItem(this.storageKey, JSON.stringify(importedData));
        
        // Clear cache and reload
        this.cache.clear();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
