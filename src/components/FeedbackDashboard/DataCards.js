import React, { useState, useMemo } from 'react';
import './DataCards.css';

const DataCards = ({ data, onCardClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  if (!data) return null;

  const screenRejectCount = data.screenReject ? (Array.isArray(data.screenReject) ? data.screenReject.length : 1) : 0;
  const techRejectCount = data.techReject ? (Array.isArray(data.techReject) ? data.techReject.length : 1) : 0;
  const groupOutputCount = data.groupOutput ? (Array.isArray(data.groupOutput) ? data.groupOutput.reduce((total, item) => total + (item['Row Count'] || 0), 0) : 0) : 0;

  const handleOpportunityClick = (item) => {
    if (item.uncommnonrecord && Array.isArray(item.uncommnonrecord)) {
      onCardClick('groupOutput', item.uncommnonrecord);
    }
  };

  // Pagination logic for groupOutput table
  const groupOutputData = data.groupOutput && Array.isArray(data.groupOutput) ? data.groupOutput : [];
  const totalPages = Math.ceil(groupOutputData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedData = groupOutputData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate insights and analytics
  const totalOpportunities = groupOutputData.reduce((total, item) => total + (item['Row Count'] || 0), 0);
  const totalCandidates = groupOutputData.length;
  const avgOpportunitiesPerCandidate = totalCandidates > 0 ? (totalOpportunities / totalCandidates).toFixed(1) : 0;
  
  // Calculate rejection insights
  const screenRejectData = data.screenReject && Array.isArray(data.screenReject) ? data.screenReject : [];
  const techRejectData = data.techReject && Array.isArray(data.techReject) ? data.techReject : [];
  const totalRejections = screenRejectData.length + techRejectData.length;
  const rejectionRate = totalOpportunities > 0 ? ((totalRejections / totalOpportunities) * 100).toFixed(1) : 0;
  
  // Top roles analysis - get roles from uncommnonrecord arrays in groupOutput
  const roleAnalysis = {};
  groupOutputData.forEach(item => {
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
      {/* Insights Dashboard */}
      <div className="data-cards__insights">
        <div className="data-cards__insights-grid">
          <div className="data-cards__insight-card data-cards__insight-card--primary">
            <div className="data-cards__insight-icon">📊</div>
            <div className="data-cards__insight-content">
              <h3>{totalOpportunities}</h3>
              <p>Total Opportunities</p>
              <span className="data-cards__insight-subtitle">Across {totalCandidates} candidates</span>
            </div>
          </div>
          
          <div className="data-cards__insight-card data-cards__insight-card--success">
            <div className="data-cards__insight-icon">📈</div>
            <div className="data-cards__insight-content">
              <h3>{avgOpportunitiesPerCandidate}</h3>
              <p>Avg Opportunities/Candidate</p>
              <span className="data-cards__insight-subtitle">Per candidate average</span>
            </div>
          </div>
          
          <div className="data-cards__insight-card data-cards__insight-card--warning">
            <div className="data-cards__insight-icon">⚠️</div>
            <div className="data-cards__insight-content">
              <h3>{rejectionRate}%</h3>
              <p>Rejection Rate</p>
              <span className="data-cards__insight-subtitle">{totalRejections} total rejections</span>
            </div>
          </div>
          
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

              {/* Rejection Metrics - Innovative Design */}
              <div className="data-cards__rejection-metrics">
                <div className="data-cards__rejection-grid">
                  <div
                    className="data-cards__rejection-card data-cards__rejection-card--screen"
                    onClick={() => onCardClick('screenReject', data.screenReject)}
                  >
                    <div className="data-cards__rejection-icon">
                      <div className="data-cards__rejection-icon-bg">🚫</div>
                    </div>
                    <div className="data-cards__rejection-content">
                      <div className="data-cards__rejection-count">{screenRejectCount}</div>
                      <div className="data-cards__rejection-label">Screen Rejects</div>
                    </div>
                    <div className="data-cards__rejection-footer">
                      <div className="data-cards__rejection-percentage">
                        {totalRejections > 0 ? ((screenRejectCount / totalRejections) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="data-cards__rejection-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="data-cards__rejection-divider">
                    <div className="data-cards__rejection-divider-line"></div>
                    <div className="data-cards__rejection-divider-text">vs</div>
                    <div className="data-cards__rejection-divider-line"></div>
                  </div>

                  <div
                    className="data-cards__rejection-card data-cards__rejection-card--tech"
                    onClick={() => onCardClick('techReject', data.techReject)}
                  >
                    <div className="data-cards__rejection-icon">
                      <div className="data-cards__rejection-icon-bg">⚙️</div>
                    </div>
                    <div className="data-cards__rejection-content">
                      <div className="data-cards__rejection-count">{techRejectCount}</div>
                      <div className="data-cards__rejection-label">Technical Rejects</div>
                    </div>
                    <div className="data-cards__rejection-footer">
                      <div className="data-cards__rejection-percentage">
                        {totalRejections > 0 ? ((techRejectCount / totalRejections) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="data-cards__rejection-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="data-cards__rejection-summary">
                  <div className="data-cards__rejection-summary-item">
                    <span className="data-cards__rejection-summary-label">Total Rejections</span>
                    <span className="data-cards__rejection-summary-value">{totalRejections}</span>
                  </div>
                  <div className="data-cards__rejection-summary-item">
                    <span className="data-cards__rejection-summary-label">Rejection Rate</span>
                    <span className="data-cards__rejection-summary-value">{rejectionRate}%</span>
                  </div>
                </div>
              </div>

              <div className="data-cards__table-card">
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
                    style={{ cursor: item.uncommnonrecord && Array.isArray(item.uncommnonrecord) ? 'pointer' : 'default' }}
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="data-cards__pagination">
              <div className="data-cards__pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, groupOutputData.length)} of {groupOutputData.length} entries
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`data-cards__pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
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
          <div className="data-cards__analytics-header">
            <h3>Detailed Analytics</h3>
            <p>In-depth analysis of feedback patterns and trends</p>
          </div>
          
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
