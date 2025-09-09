import React, { useState } from 'react';

import Analytics from './components/Analytics';
import TrendAnalysis from './components/TrendAnalysis';
import ResourceDetails from './components/ResourceDetails';
import ExcelUploader from './components/ExcelUploader';
import { calculateStatusCounts } from './utils/businessLogic';
import './App.css';

// Dashboard Component
const Dashboard = ({ data, error, onDataLoaded, onError }) => {
  const [activeView, setActiveView] = useState('upload');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState([]);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [, setDetailsFilters] = useState({});
  const tableContainerRef = React.useRef(null);

  // Update dataLoaded when data changes and switch to matrix view
  React.useEffect(() => {
    if (data && data.length > 0) {
      setDataLoaded(true);
      setActiveView('matrix'); // Automatically switch to matrix when data is loaded
    } else {
      setDataLoaded(false);
      setActiveView('upload'); // Switch back to upload view when no data
    }
  }, [data]);

  // Auto-focus matrix when matrix view is active
  React.useEffect(() => {
    if (activeView === 'matrix' && dataLoaded && tableContainerRef.current) {
      const timer = setTimeout(() => {
        tableContainerRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView, dataLoaded]);

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

    setDetailsData(filteredData);
    setDetailsTitle(`${status} - ${benchRd} (${grade})`);
    setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': grade,
      'Status': status
    });
    setDetailsOpen(true);
  };

  // Only use uploaded data, no default/sample data
  const dataToUse = data && data.length > 0 ? data : [];
  const statusCounts = dataToUse.length > 0 ? calculateStatusCounts(dataToUse) : {};
  
  // Debug: Log the status counts to see the structure
  // console.log('Data length:', dataToUse.length);
  // console.log('Status Counts:', statusCounts);
  const grades = ['B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
  
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
        'Available - ML return constraint': 0,
        'Available - High Bench Ageing 90+': 0
      };
    }
  });
  }

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
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">📊</div>
            <div className="logo-text">
              <h1 className="logo-title">Bench/RD Tracker</h1>
              <p className="logo-subtitle">Resource Management Dashboard</p>
            </div>
          </div>
          <div className="header-actions">
            <ExcelUploader onDataLoaded={onDataLoaded} onError={onError} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeView === 'upload' ? (
          <div className="loading-container">
            <div className="loading-content">
              <h2>Welcome to Bench/RD Tracker</h2>
              <p>Please upload an Excel file to view the dashboard</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-card-content">
                  <div className="summary-card-text">
                    <p className="summary-card-label">Total Resources</p>
                    <p className="summary-card-value">{data ? data.length : 0}</p>
                  </div>
                  <div className="summary-card-icon">👥</div>
                </div>
              </div>

              <div className="summary-card success">
                <div className="summary-card-content">
                  <div className="summary-card-text">
                    <p className="summary-card-label">Bench Resources</p>
                    <p className="summary-card-value">
                      {data ? data.filter(record => {
                        const benchRd = record['Bench/RD'];
                        return benchRd === 'Bench' || (benchRd && benchRd.toLowerCase().includes('ml return'));
                      }).length : 0}
                    </p>
                  </div>
                  <div className="summary-card-icon">🎯</div>
                </div>
              </div>

              <div className="summary-card warning">
                <div className="summary-card-content">
                  <div className="summary-card-text">
                    <p className="summary-card-label">RD Resources</p>
                    <p className="summary-card-value">
                      {data ? data.filter(record => record['Bench/RD'] === 'RD').length : 0}
                    </p>
                  </div>
                  <div className="summary-card-icon">⚡</div>
                </div>
              </div>

              <div className="summary-card error">
                <div className="summary-card-content">
                  <div className="summary-card-text">
                    <p className="summary-card-label">Available</p>
                    <p className="summary-card-value">
                      {data ? data.filter(record => record['Deployment Status'] === 'Avail_BenchRD').length : 0}
                    </p>
                  </div>
                  <div className="summary-card-icon">✅</div>
                </div>
              </div>
            </div>

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
                  className={`tab-button ${activeView === 'details' ? 'active' : ''}`}
                onClick={() => setActiveView('details')}
                >
                  Details View
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
            <div className="matrix-container">
              <div className="matrix-header">
                <h2 className="matrix-title">Resource Matrix</h2>
                <p className="matrix-subtitle">Comprehensive view of all resources by type, status, and grade</p>
              </div>
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
                    Upload an Excel file to view the resource matrix
                  </p>
                </div>
              ) : (
                <div 
                    ref={tableContainerRef}
                    tabIndex={0}
                  style={{ 
                      overflow: 'auto',
                    maxHeight: 'calc(100vh - 300px)',
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
                        const statusTypes = [
                          'Client Blocked',
                          'Internal Blocked',
                          'Available - Location Constraint',
                          'Available - ML return constraint',
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
                                      className={`${benchRd === 'Bench' ? 'bench-rd-cell' : 'rd-cell'}`} 
                                      rowSpan={totalRows}
                                      style={{ 
                                        verticalAlign: 'top',
                                        textAlign: 'left',
                                        padding: '12px 16px'
                                      }}
                                    >
                                      <div style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '600',
                                        fontSize: '14px'
                                      }}>
                                        <div style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          backgroundColor: benchRd === 'Bench' ? '#10b981' : '#f59e0b',
                                          flexShrink: 0
                                        }}></div>
                              {benchRd}
                                      </div>
                                    </td>
                                  )}
                                  <td className="status-cell">
                                    <div className="status-indicator">
                                      <div className={`status-dot ${
                                        status.includes('Client Blocked') ? 'red' :
                                        status.includes('Internal Blocked') ? 'orange' :
                                        status.includes('Available - Location') ? 'blue' :
                                        status.includes('Available - ML') ? 'blue' :
                                        status.includes('Available - High') ? 'purple' : 'gray'
                                      }`}></div>
                              {status}
                                    </div>
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
                                              count > 15 ? 'red' :
                                              count > 10 ? 'orange' :
                                              count > 5 ? 'blue' :
                                              count > 2 ? 'green' : 'gray'
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
                                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                    {rowTotal > 0 ? (
                                      <span className="matrix-badge green">{rowTotal}</span>
                                    ) : (
                                      <span className="matrix-badge zero">0</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          
                          {/* Total row for this Bench/RD */}
                            <tr className="total-row">
                              <td colSpan={2} style={{ fontWeight: 'bold', paddingLeft: '16px' }}>
                                  {benchRd} TOTAL
                              </td>
                              {grades.map(grade => {
                                const gradeTotal = statusTypes.reduce((sum, status) => {
                                  return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                }, 0);
                                  return (
                                  <td key={grade} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                      {gradeTotal > 0 ? (
                                      <span className="matrix-badge green">{gradeTotal}</span>
                                    ) : (
                                      <span className="matrix-badge zero">0</span>
                                    )}
                                  </td>
                                  );
                                })}
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {grades.reduce((total, grade) => {
                                  return total + statusTypes.reduce((sum, status) => {
                                    return sum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                                  }, 0);
                                }, 0)}
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

            {/* Details View */}
            {activeView === 'details' && (
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
                        Upload an Excel file to view the resource details
                      </p>
                    </div>
                  ) : (
                    <ResourceDetails 
                      data={data} 
                      statusCounts={statusCounts}
                      onCountClick={handleCountClick}
                    />
                  )}
                </div>
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
        )}
      </div>

      {/* Details Modal */}
      {detailsOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '100%',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
            <div style={{
              padding: 'var(--spacing-lg)',
              borderBottom: '1px solid var(--border-light)',
                          display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                {detailsTitle} ({detailsData.length} records)
              </h2>
              <button
                onClick={() => setDetailsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: 'var(--spacing-lg)'
            }}>
              {detailsData.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: 'var(--spacing-md)',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
                }}>
                  {detailsData.map((record, index) => (
                    <div key={index} style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}>
                      <h4 style={{
                        margin: '0 0 var(--spacing-sm) 0',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}>
                        {record['Name'] || 'Unknown'}
                      </h4>
                      <div style={{ display: 'grid', gap: '4px' }}>
                        <div><strong>Grade:</strong> {record['Grade'] || 'N/A'}</div>
                        <div><strong>Bench/RD:</strong> {record['Bench/RD'] || 'N/A'}</div>
                        <div><strong>Status:</strong> {record['Deployment Status'] || 'N/A'}</div>
                        <div><strong>Aging:</strong> {record['Aging'] || 'N/A'} days</div>
                        <div><strong>Location:</strong> {record['Location'] || 'N/A'}</div>
                        <div><strong>Relocation:</strong> {record['Relocation'] || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-xl)',
                  color: 'var(--text-secondary)'
                }}>
                  No records found for the selected criteria.
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
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataLoaded = (newData) => {
    setData(newData);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setData(null);
  };

  // No sample data loaded by default - user must upload Excel file

  return (
    <div className="App">
          <Dashboard 
        data={data} 
        error={error} 
        onDataLoaded={handleDataLoaded} 
        onError={handleError} 
      />
    </div>
  );
}

export default App;