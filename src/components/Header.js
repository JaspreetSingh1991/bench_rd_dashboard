import React from 'react';
import ExcelUploader from './ExcelUploader';

const Header = ({ sidebarOpen, setSidebarOpen, onDataLoaded, onError }) => {
  return (
    <header className={`dashboard-header ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="logo-section">
            <div className="logo-icon">📊</div>
            <div className="logo-text">
              <h1 className="logo-title">Supply Quality Dashboard</h1>
              <p className="logo-subtitle">Resource Management Dashboard</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <ExcelUploader onDataLoaded={onDataLoaded} onError={onError} />
        </div>
      </div>
    </header>
  );
};

export default Header;
