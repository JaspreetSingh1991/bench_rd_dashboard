import React from 'react';

function MatrixView({
  dataLoaded,
  dataToUse,
  grades,
  statusCounts,
  getBenchRdColor,
  handleCountClick,
  handleRowTotalClick,
  handleGradeTotalClick,
  handleGrandTotalClick
}) {
  const tableContainerRef = React.useRef(null);

  return (
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
                  {grades.map((grade) => (
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
                }).map((benchRd) => {
                  const statusTypes = benchRd === 'Bench' ? [
                    'Client Blocked',
                    'Internal Blocked',
                    'Available - Location Constraint',
                    'Available - ML return constraint',
                    'Available - High Bench Ageing 90+'
                  ] : benchRd === 'Non Deployable' ? [
                    'ML/LL',
                    'BOTP'
                  ] : [
                    'Client Blocked',
                    'Internal Blocked',
                    'Available - Location Constraint',
                    'Available - High Bench Ageing 90+'
                  ];
                  const totalRows = statusTypes.length + 1;

                  return (
                    <React.Fragment key={benchRd}>
                      {statusTypes.map((status, statusIndex) => {
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
                              onClick={() => handleGradeTotalClick(benchRd, grade, gradeTotal)}
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
  );
}

export default MatrixView;


