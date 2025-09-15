import React, { useMemo } from 'react';
import './DataTable.css';

const DataTable = ({ data, type, onClose }) => {
  // Columns to hide for Screen Rejects and Technical Rejects
  const hiddenColumns = [
    'Start time',
    'Completion time',
    'Communication Skills',
    'Specify Assessed Technical Skill - 2',
    'Rating according to Technical Skill - 2',
    'Specify Assessed Technical Skill - 3',
    'Rating according to Technical Skill - 3'
  ];

  // Get table headers from the first record and filter out hidden columns
  let allHeaders = [];
  if (data && data.length > 0) {
    if (type === 'groupOutput') {
      // Check if data is already flattened (uncommnonrecord array) or needs flattening
      if (data[0].hasOwnProperty('Id')) {
        // Data is already flattened uncommnonrecord array
        allHeaders = Object.keys(data[0]);
      } else {
        // Data needs to be flattened from groupOutput structure
        const firstRecord = data.find(item => item.uncommnonrecord && item.uncommnonrecord.length > 0);
        if (firstRecord && firstRecord.uncommnonrecord[0]) {
          allHeaders = Object.keys(firstRecord.uncommnonrecord[0]);
        }
      }
    } else {
      allHeaders = Object.keys(data[0]);
    }
  }
  const headers = allHeaders.filter(header => !hiddenColumns.includes(header));


  // Process data without filtering
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    // For groupOutput data, check if it's already flattened (uncommnonrecord array) or needs flattening
    let dataToProcess = data;
    if (type === 'groupOutput') {
      // Check if data is already the uncommnonrecord array (flattened)
      if (data.length > 0 && data[0].hasOwnProperty('Id')) {
        // Data is already flattened uncommnonrecord array
        dataToProcess = data;
      } else {
        // Data needs to be flattened from groupOutput structure
        dataToProcess = [];
        data.forEach(item => {
          if (item.uncommnonrecord && Array.isArray(item.uncommnonrecord)) {
            dataToProcess.push(...item.uncommnonrecord);
          }
        });
      }
    }
    
    return dataToProcess;
  }, [data, type]);

  if (!data || !Array.isArray(data)) return null;

  const getTableTitle = () => {
    switch (type) {
      case 'screenReject':
        return 'Screen Reject Records';
      case 'techReject':
        return 'Tech Reject Records';
      case 'groupOutput':
        return 'Opportunities';
      default:
        return 'Data Records';
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="data-table-overlay" onClick={onClose}>
      <div className="data-table-container" onClick={(e) => e.stopPropagation()}>
        <div className="data-table-header">
          <div className="data-table-header-content">
            <h2>{getTableTitle()}</h2>
                    <div className="data-table-badge">
                      <span className="data-table-badge-icon">📊</span>
                      <span className="data-table-badge-text">
                        {processedData.length} of {
                          type === 'groupOutput' 
                            ? (data.length > 0 && data[0].hasOwnProperty('Id')) 
                              ? data.length 
                              : data.reduce((total, item) => total + (item.uncommnonrecord ? item.uncommnonrecord.length : 0), 0)
                            : data.length
                        } Records
                      </span>
                    </div>
          </div>
          <button className="data-table-close" onClick={onClose}>×</button>
        </div>
        

        <div className="data-table-content">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="data-table-header-cell">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedData.map((record, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <td key={colIndex}>
                        {formatValue(record[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
