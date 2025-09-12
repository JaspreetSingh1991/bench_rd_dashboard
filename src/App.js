import React from 'react';

import Analytics from './components/Analytics';
import TrendAnalysis from './components/TrendAnalysis';
import ExcelUploader from './components/ExcelUploader';
import DataManagement from './components/DataManagement';
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
    'demand-forecast': {
      name: 'Demand Forecast Dashboard',
      icon: '📈',
      description: 'Resource Planning & Forecasting'
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
    }
  };

  const handleDashboardSwitch = (dashboardKey) => {
    actions.setSidebarOpen(false);
    
    // Set appropriate view based on dashboard and data availability
    if (dashboardKey === 'supply-quality') {
      // Check if we have data for this dashboard
      const hasData = state.dashboardData[dashboardKey] || state.dataLoaded;
      
      if (hasData) {
        actions.setActiveView('matrix');
      } else {
        actions.setActiveView('upload');
      }
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
  const dataToUse = data && data.length > 0 ? data : [];
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
  });
  }

  // Handle count click to show details
  const handleCountClick = (benchRd, grade, status, count) => {
    if (count === 0) return;
    
    let filteredData = data.filter(record => {
      const recordBenchRd = record['Bench/RD'];
      const recordGrade = record['Grade'];
      
      // Check grade match first
      if (recordGrade !== grade) return false;
      
      // Check Bench/RD match with special handling for Bench row
      if (benchRd === 'Bench') {
        // For Bench row, include both Bench and ML Return records
        return recordBenchRd === 'Bench' || 
               (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
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
      case 'Available - Relocation Constraint':
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
          return isDeploymentStatusAvailable && aging > 90;
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
    
    const filteredData = data.filter(record => {
      const recordBenchRd = record['Bench/RD'];
      const recordStatus = record['Deployment Status'] || '';
      
      // Check Bench/RD match with special handling for Bench row
      if (benchRd === 'Bench') {
        // For Bench row, include both Bench and ML Return records
        const isBench = recordBenchRd === 'Bench' || 
               (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
        if (!isBench) return false;
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
        return recordStatus.toLowerCase().includes('available') && aging > 90;
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

  // Handle grade total click (All Statuses for a specific Grade across all Bench/RD)
  const handleGradeTotalClick = (grade, count) => {
    if (count === 0) return;
    
    const filteredData = data.filter(record => {
      return record['Grade'] === grade;
    });
    
    actions.setDetailsData(filteredData);
    actions.setDetailsTitle(`${grade} - All Statuses - All Types`);
    actions.setDetailsFilters({
      'Bench/RD': 'All Types',
      'Grade': grade,
      'Status': 'All Statuses'
    });
    actions.setDetailsOpen(true);
  };

  // Handle grand total click (All records for a specific Bench/RD)
  const handleGrandTotalClick = (benchRd, count) => {
    if (count === 0) return;
    
    const filteredData = data.filter(record => {
      const recordBenchRd = record['Bench/RD'];
      
      // Check Bench/RD match with special handling for Bench row
      if (benchRd === 'Bench') {
        // For Bench row, include both Bench and ML Return records
        return recordBenchRd === 'Bench' || 
               (recordBenchRd && recordBenchRd.toLowerCase().includes('ml return'));
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
      <header className={`dashboard-header ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="header-content">
          <div className="header-left">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => actions.setSidebarOpen(!sidebarOpen)}
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
            <ExcelUploader onDataLoaded={handleDataLoaded} onError={handleError} />
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Dashboards</h3>
          <button 
            className="sidebar-close-btn"
            onClick={() => actions.setSidebarOpen(false)}
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
          onClick={() => actions.setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`dashboard-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
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
            <div className="matrix-container">
              {!dataLoaded ? (
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
                    Upload an Excel file to view the resource matrix
                  </p>
                </div>
              ) : (
                <div 
                    ref={tableContainerRef}
                    tabIndex={0}
                  style={{ 
                        outline: 'none'
                  }}
                >
                  {dataToUse.length > 0 ? (
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th style={{ minWidth: '120px' }}>Bench/RD</th>
                          <th style={{ minWidth: '120px' }}>Status</th>
                          {grades.map((grade, index) => (
                            <th key={grade} style={{ minWidth: '80px' }}>
                            {grade}
                            </th>
                          ))}
                          <th style={{ minWidth: '100px' }}>Grand Total</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Object.keys(statusCounts).sort((a, b) => {
                        if (a === 'Bench' && b === 'RD') return -1;
                        if (a === 'RD' && b === 'Bench') return 1;
                        return 0;
                      }).map((benchRd, benchIndex) => {
                        // Define status types based on Bench/RD type
                        const statusTypes = benchRd === 'Bench' ? [
                          'Client Blocked',
                          'Internal Blocked',
                          'Available - Location Constraint',
                          'Available - ML return constraint',
                          'Available - High Bench Ageing 90+'
                        ] : [
                          'Client Blocked',
                          'Internal Blocked',
                          'Available - Location Constraint',
                          'Available - High Bench Ageing 90+'
                        ];
                        const totalRows = statusTypes.length + 1; // +1 for the total row
                        
                        return (
                          <React.Fragment key={benchRd}>
                            {statusTypes.map((status, statusIndex) => {
                              // Get the data for this specific status across all grades
                              const rowData = {};
                              grades.forEach(grade => {
                                rowData[grade] = statusCounts[benchRd]?.[grade]?.[status] || 0;
                              });
                              const rowTotal = Object.values(rowData).reduce((sum, count) => sum + count, 0);

                              return (
                                <tr key={`${benchRd}-${status}`}>
                                  {statusIndex === 0 && (
                                    <td 
                                      className="bench-rd-cell"
                                      rowSpan={totalRows}
                                      style={{ 
                                        verticalAlign: 'middle',
                                        textAlign: 'center',
                                        padding: '12px 8px',
                                        backgroundColor: getBenchRdColor(benchRd).bg
                                      }}
                                    >
                                      <span 
                                        className="bench-rd-badge"
                                        style={{
                                          backgroundColor: getBenchRdColor(benchRd).bg,
                                          color: getBenchRdColor(benchRd).text,
                                          borderColor: getBenchRdColor(benchRd).border
                                        }}
                                      >
                              {benchRd}
                                      </span>
                                    </td>
                                  )}
                                  <td className="status-cell">
                              {status}
                                  </td>
                                  {grades.map(grade => {
                                    const count = rowData[grade] || 0;
                                return (
                                      <td 
                                    key={grade} 
                                        style={{ 
                                          textAlign: 'center',
                                      cursor: count > 0 ? 'pointer' : 'default',
                                          padding: '8px'
                                    }}
                                    onClick={() => handleCountClick(benchRd, grade, status, count)}
                                        title={count > 0 ? `Click to view ${count} records` : 'No records'}
                                  >
                                    {count > 0 ? (
                                          <span 
                                            className={`matrix-badge ${
                                              status === 'Client Blocked' ? 'red' :
                                              status === 'Internal Blocked' ? 'orange' :
                                              status === 'Available - Location Constraint' ? 'blue' :
                                              status === 'Available - ML return constraint' ? 'blue' :
                                              status === 'Available - High Bench Ageing 90+' ? 'purple' :
                                              'green'
                                            }`}
                                            style={{
                                              cursor: 'pointer',
                                      transition: 'all 0.2s ease-in-out',
                                              display: 'inline-block'
                                            }}
                                            onMouseEnter={(e) => {
                                              if (count > 0) {
                                                e.target.style.transform = 'scale(1.1)';
                                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.target.style.transform = 'scale(1)';
                                              e.target.style.boxShadow = 'none';
                                            }}
                                          >
                                        {count}
                                          </span>
                                    ) : (
                                          <span className="matrix-badge zero">0</span>
                                    )}
                                      </td>
                                );
                              })}
                                  <td 
                                    style={{ 
                                      textAlign: 'center', 
                                      fontWeight: 'bold',
                                      cursor: rowTotal > 0 ? 'pointer' : 'default'
                                    }}
                                    onClick={() => handleRowTotalClick(benchRd, status, rowTotal)}
                                    title={rowTotal > 0 ? `Click to view ${rowTotal} records` : 'No records'}
                                  >
                                    {rowTotal > 0 ? (
                                      <span className="matrix-badge total">{rowTotal}</span>
                                    ) : (
                                      <span className="matrix-badge zero">0</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          
                          {/* Total row for this Bench/RD */}
                            <tr className="total-row" style={{ backgroundColor: getBenchRdColor(benchRd).bg + '20' }}>
                              <td 
                                style={{ 
                                  fontWeight: 'bold', 
                                  paddingLeft: '16px',
                                  backgroundColor: getBenchRdColor(benchRd).bg
                                }}
                              >
                                  {benchRd} TOTAL
                              </td>
                              {grades.map(grade => {
                                const gradeTotal = statusTypes.reduce((sum, status) => {
                                  return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                }, 0);
                                  return (
                                  <td 
                                    key={grade} 
                                    style={{ 
                                      textAlign: 'center', 
                                      fontWeight: 'bold',
                                      cursor: gradeTotal > 0 ? 'pointer' : 'default'
                                    }}
                                    onClick={() => handleGradeTotalClick(grade, gradeTotal)}
                                    title={gradeTotal > 0 ? `Click to view ${gradeTotal} records` : 'No records'}
                                  >
                                      {gradeTotal > 0 ? (
                                      <span className="matrix-badge total">{gradeTotal}</span>
                                    ) : (
                                      <span className="matrix-badge zero">0</span>
                                    )}
                                  </td>
                                  );
                                })}
                              <td 
                                style={{ 
                                  textAlign: 'center', 
                                  fontWeight: 'bold',
                                  cursor: (() => {
                                    const grandTotal = grades.reduce((total, grade) => {
                                      return total + statusTypes.reduce((sum, status) => {
                                        return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                      }, 0);
                                    }, 0);
                                    return grandTotal > 0 ? 'pointer' : 'default';
                                  })()
                                }}
                                onClick={() => {
                                  const grandTotal = grades.reduce((total, grade) => {
                                    return total + statusTypes.reduce((sum, status) => {
                                      return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                    }, 0);
                                  }, 0);
                                  handleGrandTotalClick(benchRd, grandTotal);
                                }}
                                title={(() => {
                                  const grandTotal = grades.reduce((total, grade) => {
                                    return total + statusTypes.reduce((sum, status) => {
                                      return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                    }, 0);
                                  }, 0);
                                  return grandTotal > 0 ? `Click to view ${grandTotal} records` : 'No records';
                                })()}
                              >
                                {(() => {
                                  const grandTotal = grades.reduce((total, grade) => {
                                    return total + statusTypes.reduce((sum, status) => {
                                      return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                    }, 0);
                                  }, 0);
                                  return grandTotal > 0 ? (
                                    <span className="matrix-badge total">{grandTotal}</span>
                                  ) : (
                                    <span className="matrix-badge zero">0</span>
                            );
                          })()}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  ) : null}
                </div>
              )}
            </div>
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
                    <Analytics data={data} />
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
                <TrendAnalysis data={data} />
                  )}
                </div>
              </div>
            )}
          </>
          )
        ) : (
          // Other dashboards - show dummy content
          <DummyDashboard 
            title={dashboards[currentDashboard].name}
            icon={dashboards[currentDashboard].icon}
            description={dashboards[currentDashboard].description}
          />
        )}
      </div>

      {/* Professional Details Modal */}
      {detailsOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {detailsTitle}
                <span className="modal-count-badge">
                  {detailsData.length} records
                </span>
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => actions.setDetailsOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              {detailsData.length > 0 ? (
                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Resource</th>
                        <th>Grade</th>
                        <th>Skill Set</th>
                        <th>Match 1</th>
                        <th>Match 2</th>
                        <th>Aging</th>
                        <th>Location</th>
                        <th>Relocation</th>
                        <th>Insights</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsData.map((record, index) => {
                        const getStatusTagClass = (status) => {
                          if (status?.toLowerCase().includes('available')) return 'modal-tag-status-available';
                          if (status?.toLowerCase().includes('blocked')) return 'modal-tag-status-blocked';
                          if (status?.toLowerCase().includes('constraint')) return 'modal-tag-status-constraint';
                          if (status?.toLowerCase().includes('aging')) return 'modal-tag-status-aging';
                          return 'modal-tag-status-available';
                        };

                        const getGradeTagClass = (grade) => {
                          return 'modal-tag-grade';
                        };

                        const getInsightTags = (record) => {
                          const tags = [];
                          const aging = parseInt(record['Aging']) || 0;
                          const status = record['Deployment Status'] || '';
                          const type = record['Bench/RD'] || '';
                          const relocation = record['Relocation'] || '';

                          // High aging insight
                          if (aging > 90) {
                            tags.push({ text: 'High Aging', class: 'modal-tag-aging-high' });
                          } else if (aging > 30) {
                            tags.push({ text: 'Medium Aging', class: 'modal-tag-aging-medium' });
                          }

                          // ML Return insight
                          if (type.toLowerCase().includes('ml return')) {
                            tags.push({ text: 'ML Return', class: 'modal-tag-ml-return' });
                          }

                          // Location constraint insight
                          if (status.toLowerCase().includes('constraint')) {
                            tags.push({ text: 'Location Constraint', class: 'modal-tag-status-constraint' });
                          }

                          // Relocation insight
                          if (relocation && relocation !== '-' && relocation !== '') {
                            tags.push({ text: 'Relocatable', class: 'modal-tag-relocation' });
                          }

                          return tags;
                        };

                        const insightTags = getInsightTags(record);

                        return (
                          <tr key={index}>
                            <td>
                              <div className="modal-resource-name">
                                {record['Name'] || record['Employee Name'] || record['Resource Name'] || record['Employee'] || record['Resource'] || `Resource ${index + 1}`}
                              </div>
                            </td>
                            <td>
                              <span className={`modal-tag ${getGradeTagClass(record['Grade'])}`}>
                                {record['Grade'] || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="modal-tag modal-tag-skill">
                                {record['Skill Set'] || record['Skills'] || record['Skill'] || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="modal-tag modal-tag-match">
                                {record['Match 1']?.toLowerCase().includes('ml case') ? 'ML Case' : (record['Match 1'] || 'N/A')}
                              </span>
                            </td>
                            <td>
                              <span className="modal-tag modal-tag-match">
                                {record['Match 2']?.toLowerCase().includes('ml case') ? 'ML Case' : (record['Match 2'] || 'N/A')}
                              </span>
                            </td>
                            <td>
                              <span className={`modal-tag ${getAgingTagClass(record['Aging'])}`}>
                                {record['Aging'] || 'N/A'} days
                              </span>
                            </td>
                            <td>
                              <span className="modal-tag modal-tag-location">
                                {record['Location'] || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="modal-tag modal-tag-location">
                                {record['Relocation'] || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <div className="modal-tag-container">
                                {insightTags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className={`modal-tag ${tag.class}`}>
                                    {tag.text}
                                  </span>
                                ))}
                                {insightTags.length === 0 && (
                                  <span className="modal-tag modal-tag-location">
                                    Standard
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="modal-empty-state">
                  <div className="modal-empty-icon">📋</div>
                  <div className="modal-empty-title">No Records Found</div>
                  <div className="modal-empty-description">
                    No records found for the selected criteria.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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