import React, { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import './DataManagement.css';

const DataManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);

  const {
    getDataStats,
    cleanupOldData,
    exportData,
    importData: importDataFunc,
    clearDashboardData,
    getCurrentDataAge
  } = useDashboardData();

  const stats = getDataStats();
  const dataAge = getCurrentDataAge();

  const handleExport = () => {
    const data = exportData();
    if (data) {
      setShowExport(true);
    }
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = importDataFunc(importData);
      if (success) {
        alert('Data imported successfully!');
        setImportData('');
        setShowImport(false);
        setIsOpen(false);
      } else {
        alert('Error importing data. Please check the format.');
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
      Object.keys(stats.dashboardIds).forEach(dashboardId => {
        clearDashboardData(dashboardId);
      });
      alert('All cached data cleared!');
    }
  };

  const handleCleanup = () => {
    const cleaned = cleanupOldData();
    if (cleaned) {
      alert('Old data cleaned up successfully!');
    } else {
      alert('No old data found to clean up.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Data copied to clipboard!');
    });
  };

  return (
    <div className="data-management">
      <button 
        className="data-management-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Data Management"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="data-management-panel">
          <div className="data-management-header">
            <h3>Data Management</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="data-management-content">
            <div className="data-stats">
              <h4>Cache Statistics</h4>
              <div className="stat-item">
                <span>Total Dashboards:</span>
                <span>{stats.totalDashboards}</span>
              </div>
              <div className="stat-item">
                <span>Cached Dashboards:</span>
                <span>{stats.cachedDashboards}</span>
              </div>
              <div className="stat-item">
                <span>Current Data Age:</span>
                <span>{dataAge ? `${dataAge} minutes` : 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span>Last Updated:</span>
                <span>{stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}</span>
              </div>
            </div>

            <div className="data-actions">
              <h4>Actions</h4>
              
              <div className="action-group">
                <button 
                  className="action-btn export-btn"
                  onClick={handleExport}
                >
                  📤 Export Data
                </button>
                <button 
                  className="action-btn import-btn"
                  onClick={() => setShowImport(!showImport)}
                >
                  📥 Import Data
                </button>
              </div>

              <div className="action-group">
                <button 
                  className="action-btn cleanup-btn"
                  onClick={handleCleanup}
                >
                  🧹 Cleanup Old Data
                </button>
                <button 
                  className="action-btn clear-btn"
                  onClick={handleClearAll}
                >
                  🗑️ Clear All Data
                </button>
              </div>

              {showImport && (
                <div className="import-section">
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste exported data here..."
                    rows={6}
                  />
                  <div className="import-actions">
                    <button onClick={handleImport}>Import</button>
                    <button onClick={() => setShowImport(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {showExport && (
                <div className="export-section">
                  <textarea
                    value={exportData()}
                    readOnly
                    rows={6}
                  />
                  <div className="export-actions">
                    <button onClick={() => copyToClipboard(exportData())}>Copy</button>
                    <button onClick={() => setShowExport(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>

            <div className="data-info">
              <h4>Info</h4>
              <p>Data is automatically cached when you upload files. You can export your data for backup or import previously exported data.</p>
              <p>Old data (older than 7 days) can be cleaned up to save space.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
