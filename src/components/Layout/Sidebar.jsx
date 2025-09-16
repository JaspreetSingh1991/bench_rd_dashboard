import React from 'react';

function Sidebar({ dashboards, currentDashboard, sidebarOpen, onClose, onSelectDashboard }) {
  return (
    <>
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Dashboards</h3>
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="sidebar-content">
          {Object.entries(dashboards).map(([key, dashboard]) => (
            <div
              key={key}
              className={`sidebar-item ${currentDashboard === key ? 'active' : ''}`}
              onClick={() => onSelectDashboard(key)}
            >
              <div className="sidebar-item-icon">{dashboard.icon}</div>
              <div className="sidebar-item-content">
                <div className="sidebar-item-title">{dashboard.name}</div>
                <div className="sidebar-item-description">{dashboard.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;


