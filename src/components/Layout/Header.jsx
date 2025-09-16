import React from 'react';
import DataManagement from '../../components/DataManagement';
import ExcelUploader from '../../components/ExcelUploader';
import JSONUploader from '../../components/JSONUploader';

function Header({
  currentDashboard,
  dashboards,
  sidebarOpen,
  onToggleSidebar,
  onDataLoaded,
  onError
}) {
  if (currentDashboard === 'demand-planning') {
    return null;
  }

  return (
    <header className={`dashboard-header ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <button 
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
          >
            ☰
          </button>
          <div className="logo-section">
            <div className="logo-icon">{dashboards[currentDashboard]?.icon || '📊'}</div>
            <div className="logo-text">
              <h1 className="logo-title">{dashboards[currentDashboard]?.name || 'Dashboard'}</h1>
              <p className="logo-subtitle">{dashboards[currentDashboard]?.description || 'Management System'}</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <DataManagement />
          {currentDashboard === 'feedback' ? (
            <JSONUploader onDataLoaded={onDataLoaded} onError={onError} />
          ) : (
            <ExcelUploader onDataLoaded={onDataLoaded} onError={onError} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;


