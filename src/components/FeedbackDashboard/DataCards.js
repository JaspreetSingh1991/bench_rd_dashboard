import React, { useState, useMemo, useEffect } from 'react';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import './DataCards.css';

const DataCards = ({ data, onCardClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isTableMaximized, setIsTableMaximized] = useState(false);
  const recordsPerPage = isTableMaximized ? 10 : 5;

  // Reset to first page when table is maximized/minimized
  useEffect(() => {
    setCurrentPage(1);
  }, [isTableMaximized]);

  if (!data) return null;

  const screenRejectCount = data.screenReject ? (Array.isArray(data.screenReject) ? data.screenReject.length : 1) : 0;
  const techRejectCount = data.techReject ? (Array.isArray(data.techReject) ? data.techReject.length : 1) : 0;
  const groupOutputCount = data.groupOutput ? (Array.isArray(data.groupOutput) ? data.groupOutput.reduce((total, item) => total + (item['Row Count'] || 0), 0) : 0) : 0;

  const handleOpportunityClick = (item) => {
    // Create a simple record with candidate name for display
    const candidateName = Array.isArray(item['Candidate Name']) 
      ? item['Candidate Name'].join(', ') 
      : item['Candidate Name'] || 'Unknown';
    
    const candidateRecord = {
      'Candidate Name': candidateName,
      'Candidate GGID': item['Candidate GGID'] || '-',
      'No of Opportunities': item['Row Count'] || 0
    };
    
    onCardClick('groupOutput', [candidateRecord]);
  };

  // Pagination logic for groupOutput table
  const groupOutputData = data.groupOutput && Array.isArray(data.groupOutput) ? data.groupOutput : [];
  
  // Sort by "No of Opportunities" (Row Count) from highest to lowest
  const sortedGroupOutputData = [...groupOutputData].sort((a, b) => {
    const aCount = a['Row Count'] || 0;
    const bCount = b['Row Count'] || 0;
    return bCount - aCount; // Descending order (highest to lowest)
  });
  
  const totalPages = Math.ceil(sortedGroupOutputData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedData = sortedGroupOutputData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleTableMaximize = () => {
    setIsTableMaximized(!isTableMaximized);
  };

  // Calculate insights and analytics
  const totalOpportunities = sortedGroupOutputData.reduce((total, item) => total + (item['Row Count'] || 0), 0);
  const totalCandidates = sortedGroupOutputData.length;
  const avgOpportunitiesPerCandidate = totalCandidates > 0 ? (totalOpportunities / totalCandidates).toFixed(1) : 0;
  
  // Calculate rejection insights
  const screenRejectData = data.screenReject && Array.isArray(data.screenReject) ? data.screenReject : [];
  const techRejectData = data.techReject && Array.isArray(data.techReject) ? data.techReject : [];
  const totalRejections = screenRejectData.length + techRejectData.length;
  const rejectionRate = totalOpportunities > 0 ? ((totalRejections / totalOpportunities) * 100).toFixed(1) : 0;
  
  // Top roles analysis - get roles from uncommnonrecord arrays in groupOutput
  const roleAnalysis = {};
  sortedGroupOutputData.forEach(item => {
    if (item.uncommnonrecord && Array.isArray(item.uncommnonrecord)) {
      item.uncommnonrecord.forEach(record => {
        // Handle both variations of the field name (with and without \u00a0)
        const role = record['Role for which interviewed\u00a0'] || 
                    record['Role for which interviewed '] || 
                    record['Role for which interviewed'] || 
                    'Unknown';
        roleAnalysis[role] = (roleAnalysis[role] || 0) + 1;
      });
    }
  });
  const topRoles = Object.entries(roleAnalysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([role, count]) => ({ role, count }));

  return (
    <div className="data-cards">
      {/* All 5 Cards in First Row */}
      <div className="data-cards__insights">
        <div className="data-cards__insights-grid data-cards__insights-grid--five-cards">
          {/* Screen Rejects Card */}
          <div
            className="data-cards__insight-card data-cards__insight-card--screen"
            onClick={() => onCardClick('screenReject', data.screenReject)}
            style={{ cursor: 'pointer' }}
          >
            <div className="data-cards__insight-icon">🚫</div>
            <div className="data-cards__insight-content">
              <h3>{screenRejectCount}</h3>
              <p>Screen Rejects</p>
              <span className="data-cards__insight-subtitle">
                {totalRejections > 0 ? ((screenRejectCount / totalRejections) * 100).toFixed(1) : 0}% of total
              </span>
            </div>
          </div>

          {/* Technical Rejects Card */}
          <div
            className="data-cards__insight-card data-cards__insight-card--tech"
            onClick={() => onCardClick('techReject', data.techReject)}
            style={{ cursor: 'pointer' }}
          >
            <div className="data-cards__insight-icon">⚙️</div>
            <div className="data-cards__insight-content">
              <h3>{techRejectCount}</h3>
              <p>Technical Rejects</p>
              <span className="data-cards__insight-subtitle">
                {totalRejections > 0 ? ((techRejectCount / totalRejections) * 100).toFixed(1) : 0}% of total
              </span>
            </div>
          </div>

          {/* Avg Opportunities Card */}
          <div className="data-cards__insight-card data-cards__insight-card--success">
            <div className="data-cards__insight-icon">📈</div>
            <div className="data-cards__insight-content">
              <h3>{avgOpportunitiesPerCandidate}</h3>
              <p>Avg Opportunities/Candidate</p>
              <span className="data-cards__insight-subtitle">Per candidate average</span>
            </div>
          </div>
          
          {/* Rejection Rate Card */}
          <div className="data-cards__insight-card data-cards__insight-card--warning">
            <div className="data-cards__insight-icon">⚠️</div>
            <div className="data-cards__insight-content">
              <h3>{rejectionRate}%</h3>
              <p>Rejection Rate</p>
              <span className="data-cards__insight-subtitle">{totalRejections} total rejections</span>
            </div>
          </div>

          {/* Top Interviewed Role Card */}
          <div className="data-cards__insight-card data-cards__insight-card--info">
            <div className="data-cards__insight-icon">🎯</div>
            <div className="data-cards__insight-content">
              <h3>{topRoles.length > 0 ? topRoles[0].role : 'N/A'}</h3>
              <p>Top Interviewed Role</p>
              <span className="data-cards__insight-subtitle">
                {topRoles.length > 0 ? `${topRoles[0].count} interviews` : 'No data'}
              </span>
            </div>
          </div>
        </div>
      </div>


              <div className={`data-cards__table-card ${isTableMaximized ? 'data-cards__table-card--maximized' : ''}`}>
                <div className="data-cards__table-header">
                  <h3>Opportunities Data</h3>
                  <button 
                    className="data-cards__maximize-btn"
                    onClick={toggleTableMaximize}
                    title={isTableMaximized ? 'Minimize' : 'Maximize'}
                  >
                    {isTableMaximized ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                  </button>
                </div>
                <div className="data-cards__table-container">
                  <table className="data-cards__table">
            <thead>
              <tr>
                <th>Candidate GGID</th>
                <th>Candidate Name</th>
                <th>No of Opportunities</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                <tr key={startIndex + index}>
                  <td>{item['Candidate GGID'] || '-'}</td>
                  <td>
                    {Array.isArray(item['Candidate Name']) 
                      ? item['Candidate Name'].join(', ') 
                      : item['Candidate Name'] || '-'
                    }
                  </td>
                  <td 
                    className="data-cards__opportunity-count"
                    onClick={() => handleOpportunityClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item['Row Count'] || 0}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
            <div className="data-cards__pagination">
              <div className="data-cards__pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedGroupOutputData.length)} of {sortedGroupOutputData.length} entries
              </div>
              <div className="data-cards__pagination-controls">
                <button 
                  className="data-cards__pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="data-cards__pagination-numbers">
                  {(() => {
                    const maxVisiblePages = 5;
                    const halfVisible = Math.floor(maxVisiblePages / 2);
                    let startPage = Math.max(1, currentPage - halfVisible);
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Adjust startPage if we're near the end
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    const pages = [];
                    
                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          className="data-cards__pagination-number"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className="data-cards__pagination-ellipsis">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Add visible page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`data-cards__pagination-number ${currentPage === i ? 'active' : ''}`}
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Add last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="data-cards__pagination-ellipsis">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          className="data-cards__pagination-number"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button 
                  className="data-cards__pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
                )}
              </div>
        
        {/* Detailed Analytics Section */}
        <div className="data-cards__analytics">
          
          <div className="data-cards__analytics-grid">
            <div className="data-cards__analytics-card">
              <h4>Rejection Breakdown</h4>
              <div className="data-cards__analytics-content">
                <div className="data-cards__analytics-item">
                  <span className="data-cards__analytics-label">Screen Rejects</span>
                  <span className="data-cards__analytics-value">{screenRejectData.length}</span>
                </div>
                <div className="data-cards__analytics-item">
                  <span className="data-cards__analytics-label">Technical Rejects</span>
                  <span className="data-cards__analytics-value">{techRejectData.length}</span>
                </div>
                <div className="data-cards__analytics-item data-cards__analytics-item--total">
                  <span className="data-cards__analytics-label">Total Rejections</span>
                  <span className="data-cards__analytics-value">{totalRejections}</span>
                </div>
              </div>
            </div>
            
            <div className="data-cards__analytics-card">
              <h4>Top Interviewed Roles</h4>
              <div className="data-cards__analytics-content">
                {topRoles.length > 0 ? topRoles.map((role, index) => (
                  <div key={index} className="data-cards__analytics-item">
                    <span className="data-cards__analytics-label">{role.role}</span>
                    <span className="data-cards__analytics-value">{role.count}</span>
                  </div>
                )) : (
                  <div className="data-cards__analytics-item">
                    <span className="data-cards__analytics-label">No data available</span>
                    <span className="data-cards__analytics-value">-</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="data-cards__analytics-card">
              <h4>Performance Metrics</h4>
              <div className="data-cards__analytics-content">
                <div className="data-cards__analytics-item">
                  <span className="data-cards__analytics-label">Success Rate</span>
                  <span className="data-cards__analytics-value">
                    {totalOpportunities > 0 ? (100 - parseFloat(rejectionRate)).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="data-cards__analytics-item">
                  <span className="data-cards__analytics-label">Opportunity Density</span>
                  <span className="data-cards__analytics-value">
                    {totalCandidates > 0 ? (totalOpportunities / totalCandidates).toFixed(2) : 0}
                  </span>
                </div>
                <div className="data-cards__analytics-item">
                  <span className="data-cards__analytics-label">Data Quality</span>
                  <span className="data-cards__analytics-value">
                    {totalOpportunities > 0 ? 'High' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DataCards;
