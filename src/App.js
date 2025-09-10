import React, { useState } from 'react';

import Analytics from './components/Analytics';
import TrendAnalysis from './components/TrendAnalysis';
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

  // Function to get unique color for Bench/RD values
  const getBenchRdColor = (benchRd) => {
    const colors = {
      'Bench': '#6b7280',      // Grey
      'RD': '#f59e0b',         // Orange
      'ML Return': '#8b5cf6',  // Purple
      'Contract': '#ef4444',   // Red
      'Permanent': '#06b6d4',  // Cyan
      'Temporary': '#f97316',  // Orange-red
      'Consultant': '#84cc16', // Lime
      'Intern': '#ec4899'      // Pink
    };
    
    // Return specific color if defined, otherwise generate a unique color
    if (colors[benchRd]) {
      return colors[benchRd];
    }
    
    // Generate a unique color based on the string value
    const hash = benchRd.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Function to get badge styling for Bench/RD values
  const getBenchRdBadgeStyle = (benchRd) => {
    const badgeStyles = {
      'Bench': {
        backgroundColor: '#FFF8E1',  // Light creamy yellow
        color: '#8D6E63',           // Dark brown
        borderColor: '#D4AF37'      // Gold border
      },
      'RD': {
        backgroundColor: '#E3F2FD',  // Light blue
        color: '#1565C0',           // Dark blue
        borderColor: '#1976D2'      // Blue border
      },
      'Non Deployable': {
        backgroundColor: '#FFF3E0',  // Light orange
        color: '#E65100',           // Dark orange
        borderColor: '#FF9800'      // Orange border
      },
      'Contract': {
        backgroundColor: '#FFEBEE',  // Light red
        color: '#C62828',           // Dark red
        borderColor: '#D32F2F'      // Red border
      },
      'Consultant': {
        backgroundColor: '#E0F2F1',  // Light teal
        color: '#00695C',           // Dark teal
        borderColor: '#00796B'      // Teal border
      },
      'Temporary': {
        backgroundColor: '#FFF3E0',  // Light orange
        color: '#E65100',           // Dark orange
        borderColor: '#FF9800'      // Orange border
      },
      'RDjj': {
        backgroundColor: '#F1F8E9',  // Light lime
        color: '#558B2F',           // Dark lime
        borderColor: '#689F38'      // Lime border
      },
      'RDSAMple': {
        backgroundColor: '#FCE4EC',  // Light pink
        color: '#AD1457',           // Dark pink
        borderColor: '#C2185B'      // Pink border
      }
    };
    
    // Return specific badge style if defined, otherwise generate a unique style
    if (badgeStyles[benchRd]) {
      return badgeStyles[benchRd];
    }
    
    // Generate a unique badge style based on the string value
    const hash = benchRd.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    let hue = Math.abs(hash) % 360;
    
    // Replace purple colors (hue around 270-300) with orange (hue around 30-60)
    if (hue >= 270 && hue <= 300) {
      hue = 30 + (hue - 270) * 0.5; // Map purple range to orange range
    }
    
    return {
      backgroundColor: `hsl(${hue}, 30%, 95%)`,
      color: `hsl(${hue}, 70%, 30%)`,
      borderColor: `hsl(${hue}, 50%, 50%)`
    };
  };

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
    
    setDetailsData(filteredData);
    setDetailsTitle(`${benchRd} - ${status} - All Grades`);
    setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': 'All Grades',
      'Status': status
    });
    setDetailsOpen(true);
  };

  // Handle grade total click (All Statuses for a specific Grade across all Bench/RD)
  const handleGradeTotalClick = (grade, count) => {
    if (count === 0) return;
    
    const filteredData = data.filter(record => {
      return record['Grade'] === grade;
    });
    
    setDetailsData(filteredData);
    setDetailsTitle(`${grade} - All Statuses - All Types`);
    setDetailsFilters({
      'Bench/RD': 'All Types',
      'Grade': grade,
      'Status': 'All Statuses'
    });
    setDetailsOpen(true);
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
    
    setDetailsData(filteredData);
    setDetailsTitle(`${benchRd} - All Statuses - All Grades`);
    setDetailsFilters({
      'Bench/RD': benchRd,
      'Grade': 'All Grades',
      'Status': 'All Statuses'
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
            <div className="matrix-container">
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
                                      className={`${benchRd === 'Bench' ? 'bench-rd-cell' : 'rd-cell'}`} 
                                      rowSpan={totalRows}
                                      style={{ 
                                        verticalAlign: 'middle',
                                        textAlign: 'center',
                                        padding: '6px 16px',
                                        backgroundColor: getBenchRdBadgeStyle(benchRd).backgroundColor
                                      }}
                                    >
                                      <span 
                                        style={{
                                          display: 'inline-block',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: '500',
                                          textAlign: 'center',
                                          minWidth: '80px',
                                          border: '1px solid',
                                          ...getBenchRdBadgeStyle(benchRd)
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
                                          padding: '4px 8px'
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
                            <tr className="total-row">
                              <td style={{ fontWeight: 'bold', paddingLeft: '16px' }}>
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
                onClick={() => setDetailsOpen(false)}
                title="Close modal"
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

                        const getTypeTagClass = (type) => {
                          if (type?.toLowerCase().includes('ml return')) return 'modal-tag-ml-return';
                          if (type?.toLowerCase().includes('bench')) return 'modal-tag-bench';
                          if (type?.toLowerCase().includes('rd')) return 'modal-tag-rd';
                          return 'modal-tag-bench';
                        };

                        const getAgingTagClass = (aging) => {
                          const age = parseInt(aging) || 0;
                          if (age > 90) return 'modal-tag-aging-high';
                          if (age > 30) return 'modal-tag-aging-medium';
                          return 'modal-tag-aging-low';
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
                          if (status.toLowerCase().includes('location constraint')) {
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