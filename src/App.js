import React from 'react';

import Analytics from './components/Analytics';
import TrendAnalysis from './components/TrendAnalysis';
import MatrixView from './components/MatrixView/MatrixView';
import ExcelUploader from './components/ExcelUploader';
import JSONUploader from './components/JSONUploader';
import FeedbackDashboard from './components/FeedbackDashboard/FeedbackDashboard';
import DemandDashboard from './components/DemandDashboard/DemandDashboard';
import DataManagement from './components/DataManagement';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Sidebar from './components/Layout/Sidebar';
import DetailsModal from './components/DetailsModal/DetailsModal';
import { calculateStatusCounts } from './utils/businessLogic';
import { AppProvider, useAppContext } from './context/AppContext';
import { useDashboardData } from './hooks/useDashboardData';
import './App.css';

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

// Dashboard Component
const Dashboard = () => {
  const { state, actions } = useAppContext();
  const {
    data,
    dataLoaded,
    error,
    currentDashboard,
    activeView,
    detailsOpen,
    detailsData,
    detailsTitle,
    detailsFilters,
    sidebarOpen
  } = state;


  const {
    switchDashboard,
    saveDashboardData,
    hasCurrentDashboardData
  } = useDashboardData();

  const tableContainerRef = React.useRef(null);

  // Dashboard configurations
  const dashboards = {
    'supply-quality': {
      name: 'Supply Quality Dashboard',
      icon: '📊',
      description: 'Resource Management System'
    },
    'feedback': {
      name: 'Feedback Dashboard',
      icon: '📈',
      description: 'Feedback Collection & Analysis'
    },
    'performance-analytics': {
      name: 'Performance Analytics',
      icon: '⚡',
      description: 'Resource Performance Metrics'
    },
    'capacity-planning': {
      name: 'Capacity Planning',
      icon: '🏗️',
      description: 'Resource Capacity Management'
    },
    'demand-planning': {
      name: 'Demand Planning',
      icon: '🏗️',
      description: 'Demand Management'
    }
  };

  const handleDashboardSwitch = (dashboardKey) => {
    actions.setSidebarOpen(false);
    
    // Clear any existing errors when switching dashboards
    actions.setError(null);
    
    // Set appropriate view based on dashboard and data availability
    if (dashboardKey === 'supply-quality') {
      // Check if we have data for this dashboard
      const hasData = state.dashboardData[dashboardKey] || state.dataLoaded;
      
      if (hasData) {
        actions.setActiveView('matrix');
      } else {
        actions.setActiveView('upload');
      }
    } else if (dashboardKey === 'feedback') {
      // For Feedback Dashboard, show the dashboard directly
      actions.setActiveView('dummy');
    } else {
      // For other dashboards, show dummy content
      actions.setActiveView('dummy');
    }
    
    // Switch dashboard after setting the view
    switchDashboard(dashboardKey);
  };



  // Function to get aging tag class
  const getAgingTagClass = (aging) => {
    const days = parseInt(aging) || 0;
    if (days >= 90) return 'modal-tag-aging-high';
    if (days >= 30) return 'modal-tag-aging-medium';
    return 'modal-tag-aging-low';
  };

  // Handle data loading
  const handleDataLoaded = (newData) => {
    actions.setData(newData);
    actions.setDataLoaded(true);
    actions.setActiveView('matrix');
    // Save data for current dashboard
    saveDashboardData(currentDashboard, newData);
  };

  // Handle errors
  const handleError = (errorMessage) => {
    actions.setError(errorMessage);
    actions.setDataLoaded(false);
  };

  // Define status types and other constants
  const grades = ['B1', 'B2', 'C1', 'C2', 'D1', 'D2'];

  // Function to generate consistent colors for each unique Bench/RD value
  const getBenchRdColor = (value) => {
    const colors = [
      { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }, // Blue
      { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }, // Orange
      { bg: '#f3e8ff', border: '#8b5cf6', text: '#6b21a8' }, // Purple
      { bg: '#ecfdf5', border: '#10b981', text: '#065f46' }, // Green
      { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }, // Red
      { bg: '#f0f9ff', border: '#06b6d4', text: '#155e75' }, // Cyan
      { bg: '#fefce8', border: '#eab308', text: '#a16207' }, // Yellow
      { bg: '#fdf2f8', border: '#ec4899', text: '#be185d' }, // Pink
    ];
    
    // Create a simple hash from the string to get consistent color
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Only use uploaded data, no default/sample data
  const currentDashboardData = state.dashboardData[currentDashboard] || data;
  const dataToUse = currentDashboardData && currentDashboardData.length > 0 ? currentDashboardData : [];
  const statusCounts = dataToUse.length > 0 ? calculateStatusCounts(dataToUse) : {};
  
  
  // Debug: Log the status counts to see the structure
  // console.log('Data length:', dataToUse.length);
  // console.log('Status Counts:', statusCounts);
  
  // Only create structure if we have data
  if (dataToUse.length > 0) {
  // Ensure both Bench and RD are present with proper structure
  if (!statusCounts['Bench']) {
    statusCounts['Bench'] = {};
  }
  if (!statusCounts['RD']) {
    statusCounts['RD'] = {};
  }
  // Ensure Non Deployable structure exists
  if (!statusCounts['Non Deployable']) {
    statusCounts['Non Deployable'] = {};
  }
  
  // Ensure each grade has the proper structure for both Bench and RD
  grades.forEach(grade => {
    if (!statusCounts['Bench'][grade]) {
      statusCounts['Bench'][grade] = {
        'Client Blocked': 0,
        'Internal Blocked': 0,
        'Available - Location Constraint': 0,
        'Available - ML return constraint': 0,
        'Available - High Bench Ageing 90+': 0
      };
    }
    if (!statusCounts['RD'][grade]) {
      statusCounts['RD'][grade] = {
        'Client Blocked': 0,
        'Internal Blocked': 0,
        'Available - Location Constraint': 0,
        'Available - High Bench Ageing 90+': 0
      };
    }
    if (!statusCounts['Non Deployable'][grade]) {
      statusCounts['Non Deployable'][grade] = {
        'ML/LL': 0,
        'BOTP': 0
      };
    }
  });
  
  // Populate Non Deployable counts (ML/LL and BOTP) based on business rules
  dataToUse.forEach(record => {
    const recordBenchRd = record['Bench/RD'];
    if (recordBenchRd !== 'Non Deployable') return;
    const grade = record['Grade'];
    if (!grades.includes(grade)) return;
    const deploymentStatus = (record['Deployment Status'] || '').toLowerCase();
    const match1 = (record['Match 1'] || '').toString().toLowerCase();
    // ML/LL: Non Deployable + Deployment Status includes 'Available' + Match 1 contains 'ML Case'
    const isAvailable = deploymentStatus.includes('available');
    if (isAvailable && match1.includes('ml case')) {
      statusCounts['Non Deployable'][grade]['ML/LL'] = (statusCounts['Non Deployable'][grade]['ML/LL'] || 0) + 1;
    }
    // BOTP: Non Deployable + Deployment Status includes 'Available' + Match 1 does NOT contain 'ML Case'
    if (isAvailable && !match1.includes('ml case')) {
      statusCounts['Non Deployable'][grade]['BOTP'] = (statusCounts['Non Deployable'][grade]['BOTP'] || 0) + 1;
    }
  });
  }

  // Handle count click to show details
  const handleCountClick = (benchRd, grade, status, count) => {
    if (count === 0) return;
    
    let filteredData = dataToUse.filter(record => {
      const recordBenchRd = record['Bench/RD'];
      const recordGrade = record['Grade'];
      
      // Check grade match first
      if (recordGrade !== grade) return false;
      
      // Check Bench/RD match with special handling for Bench row
      if (benchRd === 'Bench') {
        // For Bench row, include both Bench and ML Return records
        return recordBenchRd === 'Bench' || 
               (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
      } else if (benchRd === 'Non Deployable') {
        return recordBenchRd === 'Non Deployable';
      } else {
        return recordBenchRd === benchRd;
      }
    });

    // Filter by status
    switch (status) {
      case 'Available - ML return constraint':
        filteredData = filteredData.filter(record => {
          const benchRd = record['Bench/RD'] || '';
          const deploymentStatus = record['Deployment Status'] || '';
          return benchRd.toLowerCase().includes('ml return') && 
                 deploymentStatus.toLowerCase().includes('available');
        });
        break;
      case 'Internal Blocked':
        filteredData = filteredData.filter(record => {
          const deploymentStatus = record['Deployment Status'] || '';
          return deploymentStatus.toLowerCase().includes('internal blocked');
        });
        break;
      case 'Client Blocked':
        filteredData = filteredData.filter(record => {
          const deploymentStatus = record['Deployment Status'] || '';
          return deploymentStatus.toLowerCase().includes('client blocked');
        });
        break;
      case 'Available - Location Constraint':
        filteredData = filteredData.filter(record => {
          const relocation = (record['Relocation'] || '').toString().trim();
          const isRelocationEmpty = relocation === '' || relocation === '-';
          const isDeploymentStatusAvailable = record['Deployment Status'] && record['Deployment Status'].trim().toLowerCase().includes('available');
          const isMLConstraint = (record['Bench/RD'] || '').toLowerCase().includes('ml return') && 
            (record['Deployment Status'] || '').toLowerCase().includes('available');
          
          return isDeploymentStatusAvailable && isRelocationEmpty && !isMLConstraint;
        });
        break;
      
      case 'Available - High Bench Ageing 90+':
        filteredData = filteredData.filter(record => {
          const deploymentStatus = record['Deployment Status'] || '';
          const aging = Number(record['Aging']) || 0;
          const isDeploymentStatusAvailable = deploymentStatus.toLowerCase().includes('available');
          return isDeploymentStatusAvailable && aging >= 90;
        });
        break;
      case 'ML/LL':
        filteredData = filteredData.filter(record => {
          const deploymentStatus = (record['Deployment Status'] || '').toLowerCase();
          const match1 = (record['Match 1'] || '').toString().toLowerCase();
          const isAvailable = deploymentStatus.includes('available');
          return isAvailable && match1.includes('ml case');
        });
        break;
      case 'BOTP':
        filteredData = filteredData.filter(record => {
          const deploymentStatus = (record['Deployment Status'] || '').toLowerCase();
          const match1 = (record['Match 1'] || '').toString().toLowerCase();
          const isAvailable = deploymentStatus.includes('available');
          return isAvailable && !match1.includes('ml case');
        });
        break;
      default:
        break;
    }

    actions.setDetailsData(filteredData);
    actions.setDetailsTitle(`${status} - ${benchRd} (${grade})`);
    actions.setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': grade,
      'Status': status
    });
    actions.setDetailsOpen(true);
  };

  // Handle row total click (All Grades for a specific Bench/RD and Status)
  const handleRowTotalClick = (benchRd, status, count) => {
    if (count === 0) return;
    
    const filteredData = dataToUse.filter(record => {
      const recordBenchRd = record['Bench/RD'];
      const recordStatus = record['Deployment Status'] || '';
      
      // Check Bench/RD match with special handling for Bench row
      if (benchRd === 'Bench') {
        // For Bench row, include both Bench and ML Return records
        const isBench = recordBenchRd === 'Bench' || 
               (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
        if (!isBench) return false;
      } else if (benchRd === 'Non Deployable') {
        if (recordBenchRd !== 'Non Deployable') return false;
      } else {
        if (recordBenchRd !== benchRd) return false;
      }
      
      // Check status match
      if (status === 'Available - ML return constraint') {
        return recordBenchRd?.toLowerCase().includes('ml return') && 
               recordStatus.toLowerCase().includes('available');
      } else if (status === 'Available - Location Constraint') {
        const relocation = (record['Relocation'] || '').toString().trim();
        const isRelocationEmpty = relocation === '' || relocation === '-';
        const isDeploymentStatusAvailable = recordStatus.toLowerCase().includes('available');
        const isMLConstraint = recordBenchRd?.toLowerCase().includes('ml return') && 
          recordStatus.toLowerCase().includes('available');
        return isDeploymentStatusAvailable && isRelocationEmpty && !isMLConstraint;
      } else if (status === 'Available - High Bench Ageing 90+') {
        const aging = Number(record['Aging']) || 0;
        return recordStatus.toLowerCase().includes('available') && aging >= 90;
      } else if (status === 'ML/LL') {
        const isAvailable = recordStatus.toLowerCase().includes('available');
        const match1 = (record['Match 1'] || '').toString().toLowerCase();
        return isAvailable && match1.includes('ml case');
      } else if (status === 'ML/LL') {
        const isAvailable = recordStatus.toLowerCase().includes('available');
        const match1 = (record['Match 1'] || '').toString().toLowerCase();
        return isAvailable && match1.includes('ml case');
      } else if (status === 'BOTP') {
        const isAvailable = recordStatus.toLowerCase().includes('available');
        const match1 = (record['Match 1'] || '').toString().toLowerCase();
        return isAvailable && !match1.includes('ml case');
      } else {
        return recordStatus.toLowerCase().includes(status.toLowerCase());
      }
    });
    
    actions.setDetailsData(filteredData);
    actions.setDetailsTitle(`${benchRd} - ${status} - All Grades`);
    actions.setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': 'All Grades',
      'Status': status
    });
    actions.setDetailsOpen(true);
  };

  // Handle grade total click (All Statuses for a specific Grade within a specific Bench/RD)
  const handleGradeTotalClick = (benchRd, grade, count) => {
    if (count === 0) return;
    
    const filteredData = dataToUse.filter(record => {
      if (record['Grade'] !== grade) return false;
      const recordBenchRd = record['Bench/RD'];
      if (benchRd === 'Bench') {
        return recordBenchRd === 'Bench' || (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
      } else if (benchRd === 'Non Deployable') {
        return recordBenchRd === 'Non Deployable';
      } else {
        return recordBenchRd === benchRd;
      }
    });
    
    actions.setDetailsData(filteredData);
    actions.setDetailsTitle(`${benchRd} - ${grade} - All Statuses`);
    actions.setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': grade,
      'Status': 'All Statuses'
    });
    actions.setDetailsOpen(true);
  };

  // Handle grand total click (All records for a specific Bench/RD)
  const handleGrandTotalClick = (benchRd, count) => {
    if (count === 0) return;
    
    const filteredData = dataToUse.filter(record => {
      const recordBenchRd = record['Bench/RD'];
      
      // Check Bench/RD match with special handling for Bench row
      if (benchRd === 'Bench') {
        // For Bench row, include both Bench and ML Return records
        return recordBenchRd === 'Bench' || 
               (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
      } else if (benchRd === 'Non Deployable') {
        return recordBenchRd === 'Non Deployable';
      } else {
        return recordBenchRd === benchRd;
      }
    });
    
    actions.setDetailsData(filteredData);
    actions.setDetailsTitle(`${benchRd} - All Statuses - All Grades`);
    actions.setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': 'All Grades',
      'Status': 'All Statuses'
    });
    actions.setDetailsOpen(true);
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <Header
        currentDashboard={currentDashboard}
        dashboards={dashboards}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => actions.setSidebarOpen(!sidebarOpen)}
        onDataLoaded={handleDataLoaded}
        onError={handleError}
      />
      {/* Side Navigation */}
      <Sidebar
        dashboards={dashboards}
        currentDashboard={currentDashboard}
        sidebarOpen={sidebarOpen}
        onClose={() => actions.setSidebarOpen(false)}
        onSelectDashboard={handleDashboardSwitch}
      />

      {/* Main Content */}
      <div className={`${currentDashboard === 'demand-planning' ? '' : 'dashboard-content'} ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Show different dashboards based on current selection */}
        {currentDashboard === 'supply-quality' ? (
          activeView === 'upload' ? (
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
                onClick={() => actions.setActiveView('matrix')}
                >
                  Matrix View
                </button>
                <button
                  className={`tab-button ${activeView === 'analytics' ? 'active' : ''}`}
                  onClick={() => actions.setActiveView('analytics')}
                >
                  Analytics
                </button>
                <button
                  className={`tab-button ${activeView === 'trends' ? 'active' : ''}`}
                  onClick={() => actions.setActiveView('trends')}
                >
                  Trends
                </button>
                
              </div>
            </div>
            )}

            {/* Matrix View */}
            {activeView === 'matrix' && (
              <MatrixView
                dataLoaded={dataLoaded}
                dataToUse={dataToUse}
                grades={grades}
                statusCounts={statusCounts}
                getBenchRdColor={getBenchRdColor}
                handleCountClick={handleCountClick}
                handleRowTotalClick={handleRowTotalClick}
                handleGradeTotalClick={handleGradeTotalClick}
                handleGrandTotalClick={handleGrandTotalClick}
              />
            )}

            {/* Analytics View */}
            {activeView === 'analytics' && (
              <div className="card">
                <div className="card-body">
                  {dataToUse.length === 0 ? (
                    <div style={{
                      padding: '60px 20px',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      margin: '20px'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        color: '#9ca3af',
                        marginBottom: '16px'
                      }}>
                        📊
                      </div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 8px 0'
                      }}>
                        Please upload the excel
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0'
                      }}>
                        Upload an Excel file to view the analytics
                      </p>
                    </div>
                  ) : (
                    <Analytics data={dataToUse} />
                  )}
                </div>
              </div>
            )}

            {/* Trends View */}
            {activeView === 'trends' && (
              <div className="card">
                <div className="card-body">
                  {dataToUse.length === 0 ? (
                    <div style={{
                      padding: '60px 20px',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      margin: '20px'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        color: '#9ca3af',
                        marginBottom: '16px'
                      }}>
                        📊
                      </div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 8px 0'
                      }}>
                        Please upload the excel
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0'
                      }}>
                        Upload an Excel file to view the trend analysis
                      </p>
                    </div>
                  ) : (
                <TrendAnalysis data={dataToUse} />
                  )}
                </div>
              </div>
            )}
            
          </>
          )
        ) : currentDashboard === 'feedback' ? (
          // Feedback Dashboard
         
          <FeedbackDashboard 
            data={state.dashboardData['feedback'] || null}
            onDataLoaded={handleDataLoaded}
            onError={handleError}
          />
        ) : currentDashboard === 'demand-planning' ? (
          // Analytics Dashboard
          <DemandDashboard/>
        ) : (
          // Other dashboards - show dummy content
          <DummyDashboard 
            title={dashboards[currentDashboard]?.name}
            icon={dashboards[currentDashboard]?.icon}
            description={dashboards[currentDashboard]?.description}
          />
        )}
      </div>

      {/* Professional Details Modal */}
      <DetailsModal
        open={detailsOpen}
        title={detailsTitle}
        data={detailsData}
        onClose={() => actions.setDetailsOpen(false)}
        getAgingTagClass={getAgingTagClass}
      />
      <Footer />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AppProvider>
    <div className="App">
        <Dashboard />
    </div>
    </AppProvider>
  );
}

export default App;