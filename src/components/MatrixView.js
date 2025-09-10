import React from 'react';

const MatrixView = ({ 
  data, 
  dataLoaded, 
  activeView, 
  setActiveView, 
  statusTypes, 
  benchRdTypes, 
  grades, 
  statusCounts, 
  handleCountClick, 
  handleRowTotalClick, 
  handleGradeTotalClick, 
  getBenchRdBadgeStyle, 
  getAgingTagClass,
  tableContainerRef 
}) => {
  if (!dataLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h2>Matrix View</h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0'
          }}>
            Upload an Excel file to view the resource matrix
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={tableContainerRef}
      tabIndex={0}
      style={{ 
        outline: 'none'
      }}
    >
      <div className="matrix-container">
        <div className="matrix-header">
          <div className="matrix-title">Resource Matrix</div>
          <div className="matrix-subtitle">Click on counts to view detailed records</div>
        </div>
        <table className="matrix-table">
          <thead>
            <tr>
              <th rowSpan="2" className="bench-rd-header">Bench/RD</th>
              <th rowSpan="2" className="grade-header">Grade</th>
              {statusTypes.map((status) => (
                <th key={status} className="status-header">
                  {status}
                </th>
              ))}
              <th rowSpan="2" className="total-header">Total</th>
            </tr>
            <tr>
              {statusTypes.map((status) => (
                <th key={`sub-${status}`} className="status-sub-header">
                  Count
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {benchRdTypes.map((benchRd, benchRdIndex) => (
              <React.Fragment key={benchRd}>
                {grades.map((grade, gradeIndex) => (
                  <tr key={`${benchRd}-${grade}`}>
                    {gradeIndex === 0 && (
                      <td 
                        rowSpan={grades.length} 
                        className="bench-rd-cell"
                        style={{
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          backgroundColor: getBenchRdBadgeStyle(benchRd).backgroundColor
                        }}
                      >
                        <span 
                          style={getBenchRdBadgeStyle(benchRd)}
                        >
                          {benchRd}
                        </span>
                      </td>
                    )}
                    <td className="grade-cell">{grade}</td>
                    {statusTypes.map((status) => {
                      const count = statusCounts[benchRd]?.[grade]?.[status] || 0;
                      return (
                        <td key={status} className="status-cell">
                          {count > 0 ? (
                            <span 
                              className="matrix-badge"
                              onClick={() => handleCountClick(benchRd, grade, status, count)}
                              title={`Click to view ${count} records`}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
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
                    {gradeIndex === 0 && (
                      <td 
                        rowSpan={grades.length} 
                        className="total-cell"
                        onClick={() => {
                          const rowTotal = grades.reduce((sum, grade) => {
                            return sum + statusTypes.reduce((gradeSum, statusType) => {
                              return gradeSum + (statusCounts[benchRd]?.[grade]?.[statusType] || 0);
                            }, 0);
                          }, 0);
                          handleRowTotalClick(benchRd, 'all', rowTotal);
                        }}
                        title="Click to view all records for this Bench/RD type"
                      >
                        {(() => {
                          const rowTotal = grades.reduce((sum, grade) => {
                            return sum + statusTypes.reduce((gradeSum, statusType) => {
                              return gradeSum + (statusCounts[benchRd]?.[grade]?.[statusType] || 0);
                            }, 0);
                          }, 0);
                          return rowTotal > 0 ? (
                            <span className="matrix-badge total">{rowTotal}</span>
                          ) : (
                            <span className="matrix-badge zero">0</span>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            <tr className="total-row">
              <td className="total-label">Total</td>
              <td className="total-label">All Grades</td>
              {statusTypes.map((status) => {
                const statusTotal = benchRdTypes.reduce((sum, benchRd) => {
                  return sum + grades.reduce((gradeSum, grade) => {
                    return gradeSum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                  }, 0);
                }, 0);
                return (
                  <td key={status} className="total-cell">
                    {statusTotal > 0 ? (
                      <span className="matrix-badge total">{statusTotal}</span>
                    ) : (
                      <span className="matrix-badge zero">0</span>
                    )}
                  </td>
                );
              })}
              <td className="total-cell">
                {(() => {
                  const grandTotal = benchRdTypes.reduce((sum, benchRd) => {
                    return sum + grades.reduce((gradeSum, grade) => {
                      return gradeSum + statusTypes.reduce((statusSum, status) => {
                        return statusSum + (statusCounts[benchRd]?.[grade]?.[status] || 0);
                      }, 0);
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatrixView;
