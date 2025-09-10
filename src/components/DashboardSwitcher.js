import React from 'react';
import Analytics from './Analytics';
import TrendAnalysis from './TrendAnalysis';
import MatrixView from './MatrixView';

const DashboardSwitcher = ({ 
  currentDashboard, 
  activeView, 
  setActiveView, 
  data, 
  dataLoaded,
  // Matrix View props
  statusTypes,
  benchRdTypes,
  grades,
  statusCounts,
  handleCountClick,
  handleRowTotalClick,
  handleGradeTotalClick,
  getBenchRdBadgeStyle,
  getAgingTagClass,
  tableContainerRef,
  // Dummy dashboard props
  dashboards
}) => {
  // Dummy Dashboard Component for other dashboards
  const DummyDashboard = ({ title, icon, description }) => (
    <div className="dummy-dashboard">
      <div className="dummy-content">
        <div className="dummy-icon">{icon}</div>
        <h2 className="dummy-title">{title}</h2>
        <p className="dummy-description">{description}</p>
        <div className="dummy-status">
          <div className="dummy-status-item">
            <span className="dummy-status-label">Status:</span>
            <span className="dummy-status-value">Coming Soon</span>
          </div>
          <div className="dummy-status-item">
            <span className="dummy-status-label">Development:</span>
            <span className="dummy-status-value">In Progress</span>
          </div>
        </div>
        <div className="dummy-features">
          <h3>Planned Features:</h3>
          <ul>
            <li>Advanced analytics and reporting</li>
            <li>Real-time data visualization</li>
            <li>Customizable dashboards</li>
            <li>Export capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );

  if (currentDashboard === 'supply-quality') {
    return (
      <>
        {activeView === 'upload' ? (
          <div className="loading-container">
            <div className="loading-content">
              <h2>Welcome to Supply Quality Dashboard</h2>
              <p>Please upload an Excel file to view the dashboard</p>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs - Only show when not in upload view */}
            {activeView !== 'upload' && (
              <div className="nav-tabs">
                <div className="tab-list">
                  <button
                    className={`tab-button ${activeView === 'matrix' ? 'active' : ''}`}
                    onClick={() => setActiveView('matrix')}
                  >
                    Matrix View
                  </button>
                  <button
                    className={`tab-button ${activeView === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveView('analytics')}
                  >
                    Analytics
                  </button>
                  <button
                    className={`tab-button ${activeView === 'trends' ? 'active' : ''}`}
                    onClick={() => setActiveView('trends')}
                  >
                    Trends
                  </button>
                </div>
              </div>
            )}

            {/* Matrix View */}
            {activeView === 'matrix' && (
              <div className="matrix-view">
                <MatrixView
                  data={data}
                  dataLoaded={dataLoaded}
                  activeView={activeView}
                  setActiveView={setActiveView}
                  statusTypes={statusTypes}
                  benchRdTypes={benchRdTypes}
                  grades={grades}
                  statusCounts={statusCounts}
                  handleCountClick={handleCountClick}
                  handleRowTotalClick={handleRowTotalClick}
                  handleGradeTotalClick={handleGradeTotalClick}
                  getBenchRdBadgeStyle={getBenchRdBadgeStyle}
                  getAgingTagClass={getAgingTagClass}
                  tableContainerRef={tableContainerRef}
                />
              </div>
            )}

            {/* Analytics View */}
            {activeView === 'analytics' && (
              <div className="analytics-view">
                {!dataLoaded ? (
                  <div className="loading-container">
                    <div className="loading-content">
                      <h2>Analytics</h2>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        margin: '0'
                      }}>
                        Upload an Excel file to view the analytics
                      </p>
                    </div>
                  </div>
                ) : (
                  <Analytics data={data} />
                )}
              </div>
            )}

            {/* Trends View */}
            {activeView === 'trends' && (
              <div className="trends-view">
                {!dataLoaded ? (
                  <div className="loading-container">
                    <div className="loading-content">
                      <h2>Trend Analysis</h2>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        margin: '0'
                      }}>
                        Upload an Excel file to view the trend analysis
                      </p>
                    </div>
                  </div>
                ) : (
                  <TrendAnalysis data={data} />
                )}
              </div>
            )}
          </>
        )}
      </>
    );
  } else {
    // Other dashboards - show dummy content
    return (
      <DummyDashboard 
        title={dashboards[currentDashboard].name}
        icon={dashboards[currentDashboard].icon}
        description={dashboards[currentDashboard].description}
      />
    );
  }
};

export default DashboardSwitcher;
