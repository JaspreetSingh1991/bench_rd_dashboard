import React from 'react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentDashboard, handleDashboardSwitch, dashboards }) => {
  return (
    <>
      {/* Side Navigation */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Dashboards</h3>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="sidebar-content">
          {Object.entries(dashboards).map(([key, dashboard]) => (
            <div
              key={key}
              className={`sidebar-item ${currentDashboard === key ? 'active' : ''}`}
              onClick={() => handleDashboardSwitch(key)}
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

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
