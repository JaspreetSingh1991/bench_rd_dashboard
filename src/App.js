import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert
} from '@mui/material';
import ExcelUploader from './components/ExcelUploader';
import Analytics from './components/Analytics';
import TrendAnalysis from './components/TrendAnalysis';
import ResourceDetails from './components/ResourceDetails';
import { calculateStatusCounts, generateSampleData } from './utils/businessLogic';
import './App.css';

// Dashboard Component
const Dashboard = ({ data, error, onDataLoaded, onError }) => {
  const [activeView, setActiveView] = useState('matrix');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState([]);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsFilters, setDetailsFilters] = useState({});
  const tableContainerRef = React.useRef(null);

  // Update dataLoaded when data changes
  React.useEffect(() => {
    if (data && data.length > 0) {
      setDataLoaded(true);
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

  const handleDataLoaded = (excelData) => {
    onDataLoaded(excelData);
    setDataLoaded(true);
  };

  const handleError = (errorMessage) => {
    onError(errorMessage);
    setDataLoaded(false);
  };

  const handleCountClick = (benchRd, grade, status, count) => {
    if (count === 0) return;
    
    let filteredData = data.filter(record => 
      record['Bench/RD'] === benchRd && 
      record['Grade'] === grade
    );

    // Apply status-specific filters
    switch (status) {
      case 'Available - ML return constraint':
        filteredData = filteredData.filter(record => 
          record['Deployment Status'] === 'Avail_BenchRD' && 
          (record['Match 1']?.toLowerCase().includes('ml case') || 
           record['Match 2']?.toLowerCase().includes('ml case') || 
           record['Match 3']?.toLowerCase().includes('ml case'))
        );
        break;
      case 'Internal Blocked':
        filteredData = filteredData.filter(record => 
          record['Deployment Status'] === 'Blocked SPE'
        );
        break;
      case 'Client Blocked':
        filteredData = filteredData.filter(record => 
          record['Deployment Status'] === 'Blocked Outside SPE'
        );
        break;
      case 'Available - Location Constraint':
        filteredData = filteredData.filter(record => 
          record['Deployment Status'] === 'Avail_BenchRD' && 
          record['Location Constraint']?.toLowerCase() === 'yes' &&
          !(record['Match 1']?.toLowerCase().includes('ml case') || 
            record['Match 2']?.toLowerCase().includes('ml case') || 
            record['Match 3']?.toLowerCase().includes('ml case'))
        );
        break;
      case 'Available - High Bench Ageing 90+':
        filteredData = filteredData.filter(record => 
          record['Deployment Status'] === 'Avail_BenchRD' && 
          Number(record['Aging']) > 90
        );
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







  // Use sample data if no data is loaded
  const dataToUse = data && data.length > 0 ? data : generateSampleData();
  const statusCounts = calculateStatusCounts(dataToUse);
  const grades = ['B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
  
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
  const statusTypes = [
    'Client Blocked',
    'Internal Blocked',
    'Available - Location Constraint',
    'Available - ML return constraint',
    'Available - High Bench Ageing 90+'
  ];



  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {!dataLoaded ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Please upload an Excel file or load sample data to view the dashboard
            </Typography>
          </Paper>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Paper sx={{ 
              p: 1, 
              mb: 2,
              mt: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
              <Button 
                variant={activeView === 'matrix' ? 'contained' : 'outlined'} 
                onClick={() => setActiveView('matrix')}
                  sx={{ 
                    mr: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    ...(activeView === 'matrix' ? {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        boxShadow: '0 6px 16px rgba(52, 73, 94, 0.5)'
                      }
                    } : {
                      borderColor: '#34495e',
                      color: '#34495e',
                      '&:hover': {
                        borderColor: '#2c3e50',
                        backgroundColor: 'rgba(52, 73, 94, 0.08)'
                      }
                    })
                  }}
                >
                  📊 Matrix View
              </Button>
              <Button 
                variant={activeView === 'details' ? 'contained' : 'outlined'} 
                onClick={() => setActiveView('details')}
                  sx={{ 
                    mr: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    ...(activeView === 'details' ? {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        boxShadow: '0 6px 16px rgba(52, 73, 94, 0.5)'
                      }
                    } : {
                      borderColor: '#34495e',
                      color: '#34495e',
                      '&:hover': {
                        borderColor: '#2c3e50',
                        backgroundColor: 'rgba(52, 73, 94, 0.08)'
                      }
                    })
                  }}
                >
                  📋 Details View
                </Button>
                <Button 
                  variant={activeView === 'analytics' ? 'contained' : 'outlined'} 
                  onClick={() => setActiveView('analytics')}
                  sx={{ 
                    mr: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    ...(activeView === 'analytics' ? {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        boxShadow: '0 6px 16px rgba(52, 73, 94, 0.5)'
                      }
                    } : {
                      borderColor: '#34495e',
                      color: '#34495e',
                      '&:hover': {
                        borderColor: '#2c3e50',
                        backgroundColor: 'rgba(52, 73, 94, 0.08)'
                      }
                    })
                  }}
                >
                  📈 Analytics
                </Button>
                <Button 
                  variant={activeView === 'trends' ? 'contained' : 'outlined'} 
                  onClick={() => setActiveView('trends')}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    ...(activeView === 'trends' ? {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        boxShadow: '0 6px 16px rgba(52, 73, 94, 0.5)'
                      }
                    } : {
                      borderColor: '#34495e',
                      color: '#34495e',
                      '&:hover': {
                        borderColor: '#2c3e50',
                        backgroundColor: 'rgba(52, 73, 94, 0.08)'
                      }
                    })
                  }}
                >
                  📊 Trends
              </Button>
            </Box>
            </Paper>

            {activeView === 'matrix' && (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Paper sx={{ 
                  p: 1, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <TableContainer 
                    ref={tableContainerRef}
                    tabIndex={0}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'auto',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      flex: 1,
                      maxHeight: 'calc(100vh - 160px)',
                      outline: 'none',
                      '&:focus': {
                        outline: 'none'
                      },
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#a8a8a8'
                        }
                      }
                    }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#34495e' }}>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRight: '2px solid #2c3e50',
                          backgroundColor: '#34495e !important',
                          position: 'sticky',
                          left: 0,
                          zIndex: 2
                        }}>
                          Bench/RD
                        </TableCell>
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRight: '2px solid #2c3e50',
                          backgroundColor: '#34495e !important',
                          position: 'sticky',
                          left: '120px',
                          zIndex: 2
                        }}>
                          Status
                        </TableCell>
                        {grades.map((grade, index) => (
                          <TableCell 
                            key={grade} 
                            align="center"
                            sx={{ 
                              color: 'white', 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              backgroundColor: index % 2 === 0 ? '#34495e' : '#2c3e50',
                              borderRight: '1px solid #5a6c7d'
                            }}
                          >
                            {grade}
                          </TableCell>
                        ))}
                        <TableCell 
                          align="center"
                          sx={{ 
                            color: 'white', 
                            fontWeight: 700,
                            fontSize: '1rem',
                            backgroundColor: '#2c3e50',
                            borderRight: 'none'
                          }}
                        >
                          Grand Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(statusCounts).sort((a, b) => {
                        // Sort Bench first, then RD
                        if (a === 'Bench' && b === 'RD') return -1;
                        if (a === 'RD' && b === 'Bench') return 1;
                        return 0;
                      }).map((benchRd, benchIndex) => (
                        <>
                          {/* Regular status rows for this Bench/RD */}
                          {statusTypes.map((status, statusIndex) => (
                            <TableRow 
                              key={`${benchRd}-${status}`}
                              sx={{ 
                                backgroundColor: (benchIndex + statusIndex) % 2 === 0 ? '#f8f9fa' : '#ffffff',
                                '&:hover': {
                                  backgroundColor: '#e3f2fd',
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            >
                                                          <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '1rem',
                              color: '#2c3e50',
                              borderRight: '2px solid #e0e0e0',
                              backgroundColor: benchRd === 'Bench' ? '#e8f5e8' : '#fff3e0',
                              position: 'sticky',
                              left: 0,
                              zIndex: 1
                            }}>
                              {benchRd}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#2c3e50',
                              borderRight: '2px solid #e0e0e0',
                              backgroundColor: statusIndex % 2 === 0 ? '#f5f5f5' : '#ffffff',
                              position: 'sticky',
                              left: '120px',
                              zIndex: 1
                            }}>
                              {status}
                            </TableCell>
                              {grades.map((grade, gradeIndex) => {
                                const count = statusCounts[benchRd][grade]?.[status] || 0;
                                const getStatusColor = (status) => {
                                  switch (status) {
                                    case 'Available - ML return constraint':
                                      return '#ff9800';
                                    case 'Internal Blocked':
                                      return '#f44336';
                                    case 'Client Blocked':
                                      return '#ff5722';
                                    case 'Available - Location Constraint':
                                      return '#2196f3';
                                    case 'Available - High Bench Ageing 90+':
                                      return '#9c27b0';
                                    default:
                                      return '#757575';
                                  }
                                };
                                
                                return (
                                  <TableCell 
                                    key={grade} 
                                    align="center"
                                    sx={{ 
                                      cursor: count > 0 ? 'pointer' : 'default',
                                      fontWeight: count > 0 ? 600 : 400,
                                      fontSize: count > 0 ? '1.1rem' : '1rem',
                                      color: count > 0 ? getStatusColor(status) : '#9e9e9e',
                                      backgroundColor: count > 0 ? `${getStatusColor(status)}15` : 'transparent',
                                      borderRight: '1px solid #e0e0e0',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': count > 0 ? { 
                                        backgroundColor: `${getStatusColor(status)}25`,
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                        zIndex: 1,
                                        position: 'relative'
                                      } : {}
                                    }}
                                    onClick={() => handleCountClick(benchRd, grade, status, count)}
                                  >
                                    {count > 0 ? (
                                      <Box sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '32px',
                                        height: '32px',
                                        borderRadius: '16px',
                                        backgroundColor: getStatusColor(status),
                                        color: 'white',
                                        fontWeight: 600,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                      }}>
                                        {count}
                                      </Box>
                                    ) : (
                                      count
                                    )}
                                  </TableCell>
                                );
                              })}
                              
                              {/* Grand Total column for this row */}
                              {(() => {
                                // Calculate grand total for this Bench/RD + Status across all grades
                                let grandTotal = 0;
                                grades.forEach(grade => {
                                  grandTotal += statusCounts[benchRd][grade]?.[status] || 0;
                                });
                                
                                const getStatusColor = (status) => {
                                  switch (status) {
                                    case 'Available - ML return constraint':
                                      return '#ff9800';
                                    case 'Internal Blocked':
                                      return '#f44336';
                                    case 'Client Blocked':
                                      return '#ff5722';
                                    case 'Available - Location Constraint':
                                      return '#2196f3';
                                    case 'Available - High Bench Ageing 90+':
                                      return '#9c27b0';
                                    default:
                                      return '#757575';
                                  }
                                };
                                
                                return (
                                  <TableCell 
                                    align="center"
                                    sx={{ 
                                      cursor: grandTotal > 0 ? 'pointer' : 'default',
                                      fontWeight: 700,
                                      fontSize: '1.2rem',
                                      color: '#2c3e50',
                                      backgroundColor: '#f8f9fa',
                                      borderRight: 'none',
                                      borderLeft: '2px solid #34495e',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': grandTotal > 0 ? { 
                                        backgroundColor: '#e3f2fd',
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                        zIndex: 1,
                                        position: 'relative'
                                      } : {}
                                    }}
                                    onClick={() => {
                                      if (grandTotal > 0) {
                                        // Show all records for this Bench/RD + Status across all grades
                                        let filteredData = data.filter(record => 
                                          record['Bench/RD'] === benchRd
                                        );

                                        // Apply status-specific filters
                                        switch (status) {
                                          case 'Available - ML return constraint':
                                            filteredData = filteredData.filter(record => 
                                              record['Deployment Status'] === 'Avail_BenchRD' && 
                                              (record['Match 1']?.toLowerCase().includes('ml case') || 
                                               record['Match 2']?.toLowerCase().includes('ml case') || 
                                               record['Match 3']?.toLowerCase().includes('ml case'))
                                            );
                                            break;
                                          case 'Internal Blocked':
                                            filteredData = filteredData.filter(record => 
                                              record['Deployment Status'] === 'Blocked SPE'
                                            );
                                            break;
                                          case 'Client Blocked':
                                            filteredData = filteredData.filter(record => 
                                              record['Deployment Status'] === 'Blocked Outside SPE'
                                            );
                                            break;
                                          case 'Available - Location Constraint':
                                            filteredData = filteredData.filter(record => 
                                              record['Deployment Status'] === 'Avail_BenchRD' && 
                                              record['Location Constraint']?.toLowerCase() === 'yes' &&
                                              !(record['Match 1']?.toLowerCase().includes('ml case') || 
                                                record['Match 2']?.toLowerCase().includes('ml case') || 
                                                record['Match 3']?.toLowerCase().includes('ml case'))
                                            );
                                            break;
                                          case 'Available - High Bench Ageing 90+':
                                            filteredData = filteredData.filter(record => 
                                              record['Deployment Status'] === 'Avail_BenchRD' && 
                                              Number(record['Aging']) > 90
                                            );
                                            break;
                                          default:
                                            break;
                                        }

                                        setDetailsData(filteredData);
                                        setDetailsTitle(`${status} - ${benchRd} (All Grades - Total: ${grandTotal})`);
                                        setDetailsFilters({
                                          'Bench/RD': benchRd,
                                          'Status': status,
                                          'Total': grandTotal
                                        });
                                        setDetailsOpen(true);
                                      }
                                    }}
                                  >
                                    {grandTotal > 0 ? (
                                      <Box sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '40px',
                                        height: '40px',
                                        borderRadius: '20px',
                                        backgroundColor: '#34495e',
                                        color: 'white',
                                        fontWeight: 700,
                                        boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
                                      }}>
                                        {grandTotal}
                                      </Box>
                                    ) : (
                                      grandTotal
                                    )}
                              </TableCell>
                                );
                              })()}
                            </TableRow>
                          ))}
                          
                          {/* Total row for this Bench/RD */}
                          {(() => {
                            // Calculate totals for this Bench/RD across all statuses and grades
                            let totalForBenchRd = 0;
                            const totalsByGrade = {};
                            
                            grades.forEach(grade => {
                              totalsByGrade[grade] = 0;
                              statusTypes.forEach(status => {
                                const count = statusCounts[benchRd][grade]?.[status] || 0;
                                totalsByGrade[grade] += count;
                                totalForBenchRd += count;
                              });
                            });
                            
                            return (
                              <TableRow 
                                key={`${benchRd}-TOTAL`}
                                sx={{ 
                                  backgroundColor: benchRd === 'Bench' ? '#e8f5e8' : '#fff3e0',
                                  borderTop: '3px solid #34495e',
                                  '&:hover': {
                                    backgroundColor: benchRd === 'Bench' ? '#d4edda' : '#ffe0b2',
                                    transform: 'scale(1.01)',
                                    transition: 'all 0.2s ease-in-out'
                                  }
                                }}
                              >
                                <TableCell sx={{ 
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  color: '#2c3e50',
                                  borderRight: '2px solid #e0e0e0',
                                  backgroundColor: benchRd === 'Bench' ? '#c8e6c9' : '#ffcc80',
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1
                                }}>
                                  {benchRd} TOTAL
                                </TableCell>
                                <TableCell sx={{ 
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  color: '#2c3e50',
                                  borderRight: '2px solid #e0e0e0',
                                  backgroundColor: benchRd === 'Bench' ? '#c8e6c9' : '#ffcc80',
                                  position: 'sticky',
                                  left: '120px',
                                  zIndex: 1
                                }}>
                                  All Statuses
                                </TableCell>
                                {grades.map((grade, gradeIndex) => {
                                  const gradeTotal = totalsByGrade[grade];
                                  
                                  return (
                                    <TableCell 
                                      key={`${benchRd}-TOTAL-${grade}`}
                                      align="center"
                                      sx={{ 
                                        cursor: gradeTotal > 0 ? 'pointer' : 'default',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        color: '#2c3e50',
                                        backgroundColor: benchRd === 'Bench' ? '#c8e6c9' : '#ffcc80',
                                        borderRight: '1px solid #e0e0e0',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': gradeTotal > 0 ? { 
                                          backgroundColor: benchRd === 'Bench' ? '#a5d6a7' : '#ffb74d',
                                          transform: 'scale(1.05)',
                                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                          zIndex: 1,
                                          position: 'relative'
                                        } : {}
                                      }}
                                      onClick={() => {
                                        if (gradeTotal > 0) {
                                          // Show all records for this Bench/RD + Grade across all statuses
                                          let filteredData = data.filter(record => 
                                            record['Bench/RD'] === benchRd && 
                                            record['Grade'] === grade
                                          );

                                          setDetailsData(filteredData);
                                          setDetailsTitle(`${benchRd} TOTAL - ${grade} (All Statuses - Total: ${gradeTotal})`);
                                          setDetailsFilters({
                                            'Bench/RD': benchRd,
                                            'Grade': grade,
                                            'Total': gradeTotal
                                          });
                                          setDetailsOpen(true);
                                        }
                                      }}
                                    >
                                      {gradeTotal > 0 ? (
                                        <Box sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          minWidth: '36px',
                                          height: '36px',
                                          borderRadius: '18px',
                                          backgroundColor: benchRd === 'Bench' ? '#4caf50' : '#ff9800',
                                          color: 'white',
                                          fontWeight: 700,
                                          boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
                                        }}>
                                          {gradeTotal}
                                        </Box>
                                      ) : (
                                        gradeTotal
                                      )}
                                    </TableCell>
                                  );
                                })}
                                
                                {/* Grand Total for this Bench/RD TOTAL row */}
                                <TableCell 
                                  align="center"
                                  sx={{ 
                                    cursor: totalForBenchRd > 0 ? 'pointer' : 'default',
                                    fontWeight: 700,
                                    fontSize: '1.3rem',
                                    color: '#2c3e50',
                                    backgroundColor: benchRd === 'Bench' ? '#c8e6c9' : '#ffcc80',
                                    borderRight: 'none',
                                    borderLeft: '3px solid #34495e',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': totalForBenchRd > 0 ? { 
                                      backgroundColor: benchRd === 'Bench' ? '#a5d6a7' : '#ffb74d',
                                      transform: 'scale(1.05)',
                                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                      zIndex: 1,
                                      position: 'relative'
                                    } : {}
                                  }}
                                  onClick={() => {
                                    if (totalForBenchRd > 0) {
                                      // Show all records for this Bench/RD across all statuses and grades
                                      let filteredData = data.filter(record => 
                                        record['Bench/RD'] === benchRd
                                      );

                                      setDetailsData(filteredData);
                                      setDetailsTitle(`${benchRd} TOTAL (All Statuses & Grades - Total: ${totalForBenchRd})`);
                                      setDetailsFilters({
                                        'Bench/RD': benchRd,
                                        'Total': totalForBenchRd
                                      });
                                      setDetailsOpen(true);
                                    }
                                  }}
                                >
                                  {totalForBenchRd > 0 ? (
                                    <Box sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '44px',
                                      height: '44px',
                                      borderRadius: '22px',
                                      backgroundColor: '#34495e',
                                      color: 'white',
                                      fontWeight: 700,
                                      boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                                    }}>
                                      {totalForBenchRd}
                                    </Box>
                                  ) : (
                                    totalForBenchRd
                                  )}
                                </TableCell>
                          </TableRow>
                            );
                          })()}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              </Box>
            )}

            {activeView === 'details' && (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}>

                <Grid container spacing={1} sx={{ flex: 1, height: '100%', justifyContent: 'center' }}>
                {['Bench', 'RD'].sort((a, b) => {
                  // Sort Bench first, then RD
                  if (a === 'Bench' && b === 'RD') return -1;
                  if (a === 'RD' && b === 'Bench') return 1;
                  return 0;
                }).map(benchRd => (
                    <Grid item xs={12} sm={5.8} key={benchRd} sx={{ height: '100%', minHeight: '220px' }}>
                      <Paper sx={{ 
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        background: benchRd === 'Bench' 
                          ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                          : 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: benchRd === 'Bench' ? '3px solid #4caf50' : '3px solid #ff9800'
                      }}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: benchRd === 'Bench' ? '#4caf50' : '#ff9800',
                          color: 'white',
                          flexShrink: 0
                        }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                            {benchRd} Resources
                        </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          flex: 1, 
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <TableContainer sx={{ 
                            flex: 1,
                            overflow: 'auto',
                            borderRadius: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            maxHeight: 'calc(100vh - 250px)',
                            paddingBottom: '20px',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                              height: '8px'
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: '#f1f1f1',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#c1c1c1',
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: '#a8a8a8'
                              }
                            }
                          }}>
                            <Table 
                              size="small" 
                              stickyHeader
                              sx={{
                                height: '100%',
                                '& .MuiTableBody-root': {
                                  height: '100%'
                                },
                                '& .MuiTableRow-root': {
                                  height: 'auto'
                                }
                              }}
                            >
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#34495e' }}>
                                  <TableCell sx={{ 
                                    color: 'white', 
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    borderRight: '2px solid #2c3e50',
                                    position: 'sticky',
                                    top: 0,
                                    left: 0,
                                    zIndex: 3,
                                    padding: '6px',
                                    minWidth: '60px',
                                    backgroundColor: '#34495e !important'
                                  }}>
                                    Grade
                                  </TableCell>
                                  {statusTypes.map((status, index) => (
                                    <TableCell 
                                      key={status} 
                                      align="center"
                                      sx={{ 
                                        color: 'white', 
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        backgroundColor: index % 2 === 0 ? '#34495e' : '#2c3e50',
                                        borderRight: index === statusTypes.length - 1 ? 'none' : '1px solid #5a6c7d',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                        padding: '6px',
                                        minWidth: '80px'
                                      }}
                                    >
                                    {status.split(' - ')[0]}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                                {grades.map((grade, gradeIndex) => (
                                  <TableRow 
                                    key={grade}
                                    sx={{ 
                                      backgroundColor: gradeIndex % 2 === 0 ? '#f8f9fa' : '#ffffff',
                                      height: '35px',

                                      '&:hover': {
                                        backgroundColor: '#e3f2fd',
                                        transform: 'scale(1.01)',
                                        transition: 'all 0.2s ease-in-out'
                                      }
                                    }}
                                  >
                                    <TableCell sx={{ 
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      color: '#2c3e50',
                                      borderRight: '2px solid #e0e0e0',
                                      backgroundColor: grade.startsWith('A') ? '#e3f2fd' : 
                                                       grade.startsWith('B') ? '#f3e5f5' : '#fff8e1',
                                      position: 'sticky',
                                      left: 0,
                                      zIndex: 2,
                                      padding: '6px',
                                      minWidth: '60px'
                                    }}>
                                      {grade}
                                    </TableCell>
                                    {statusTypes.map((status, statusIndex) => {
                                      const count = statusCounts[benchRd][grade]?.[status] || 0;
                                      const getStatusColor = (status) => {
                                        switch (status) {
                                          case 'Available - ML return constraint':
                                            return '#ff9800';
                                          case 'Blocked':
                                            return '#f44336';
                                          case 'Client Blocked':
                                            return '#ff5722';
                                          case 'Available - Location Constraint':
                                            return '#2196f3';
                                          case 'Available - High Bench Ageing':
                                            return '#9c27b0';
                                          default:
                                            return '#757575';
                                        }
                                      };
                                      
                                      return (
                                        <TableCell 
                                          key={status} 
                                          align="center"
                                          sx={{ 
                                            cursor: count > 0 ? 'pointer' : 'default',
                                            fontWeight: count > 0 ? 600 : 400,
                                            fontSize: count > 0 ? '1rem' : '0.9rem',
                                            color: count > 0 ? getStatusColor(status) : '#9e9e9e',
                                            backgroundColor: count > 0 ? `${getStatusColor(status)}15` : 'transparent',
                                            borderRight: statusIndex === statusTypes.length - 1 ? 'none' : '1px solid #e0e0e0',
                                            transition: 'all 0.2s ease-in-out',
                                            padding: '6px',
                                            minWidth: '80px',
                                            '&:hover': count > 0 ? { 
                                              backgroundColor: `${getStatusColor(status)}25`,
                                              transform: 'scale(1.05)',
                                              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                              zIndex: 1,
                                              position: 'relative'
                                            } : {}
                                          }}
                                          onClick={() => handleCountClick(benchRd, grade, status, count)}
                                        >
                                          {count > 0 ? (
                                            <Box sx={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              minWidth: '30px',
                                              height: '30px',
                                              borderRadius: '15px',
                                              backgroundColor: getStatusColor(status),
                                              color: 'white',
                                              fontWeight: 700,
                                              fontSize: '0.9rem',
                                              boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
                                            }}>
                                              {count}
                                            </Box>
                                          ) : (
                                            <span style={{ fontSize: '1rem', color: '#ccc' }}>0</span>
                                          )}
                                        </TableCell>
                                      );
                                    })}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        </Box>
                      </Paper>
                  </Grid>
                ))}
              </Grid>
              </Box>
            )}

            {activeView === 'analytics' && (
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                p: 1
              }}>
                <Analytics data={data} />
              </Box>
            )}

            {activeView === 'trends' && (
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                p: 1
              }}>
                <TrendAnalysis data={data} />
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      <ResourceDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={detailsData}
        title={detailsTitle}
        filters={detailsFilters}
      />
    </Box>
  );
};

// Main App Component
function App() {
  const [dashboardData, setDashboardData] = useState([]);
  const [dashboardError, setDashboardError] = useState(null);

  // File input handler for header button
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setDashboardError(null);

    try {
      const data = await readExcelFile(file);
      setDashboardData(data);
    } catch (err) {
      const errorMessage = `Error reading Excel file: ${err.message}`;
      setDashboardError(errorMessage);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Look for the specific sheet
          const sheetName = 'RD_BENCH_Tracker';
          const worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            reject(new Error(`Sheet "${sheetName}" not found in the Excel file`));
            return;
          }
          
          // Convert sheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file is empty or has no data rows'));
            return;
          }
          
          // Convert to array of objects with headers
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          const processedData = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          resolve(processedData);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <Router>
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <AppBar position="static" sx={{ 
          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          flexShrink: 0
        }}>
          <Toolbar sx={{ minHeight: '56px !important' }}>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              Bench/RD Tracker Dashboard
            </Typography>
            <Button
              variant="outlined"
              onClick={() => document.getElementById('header-file-input').click()}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                px: { xs: 2, sm: 3 },
                py: 1,
                borderColor: 'rgba(255,255,255,0.7)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              📁 Select Excel File
            </Button>
            <input
              id="header-file-input"
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
            />
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Dashboard 
            data={dashboardData}
            error={dashboardError}
            onDataLoaded={setDashboardData}
            onError={setDashboardError}
          />
        </Box>
      </Box>
    </Router>
  );
}

export default App;
