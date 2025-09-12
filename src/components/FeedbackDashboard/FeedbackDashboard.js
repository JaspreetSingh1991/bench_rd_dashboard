import React, { useState } from 'react';
import DataCards from './DataCards';
import DataTable from './DataTable';
import JSONFileValidator from './JSONFileValidator';
import './FeedbackDashboard.css';

const FeedbackDashboard = ({ data, onDataLoaded, onError }) => {
  const [processedData, setProcessedData] = useState(null);
  const [selectedTableData, setSelectedTableData] = useState(null);
  const [selectedTableType, setSelectedTableType] = useState(null);
  const [showTable, setShowTable] = useState(false);

  // Process data when it changes
  React.useEffect(() => {
    // Only process data if it's valid JSON data (not Excel data)
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      // Validate the uploaded files
      const validation = JSONFileValidator.validateFiles(
        Object.keys(data).map(key => ({ name: key }))
      );

      if (!validation.isValid) {
        onError(validation.errors.join('. '));
        setProcessedData(null); // Clear any previous data
        return;
      }

      // Process the validated files
      const processed = JSONFileValidator.processFiles(data);
      setProcessedData(processed);
    } else {
      // Reset processed data when no data is available
      setProcessedData(null);
    }
  }, [data, onError]);

  // Handle card click to show table
  const handleCardClick = (type, tableData) => {
    if (tableData) {
      setSelectedTableData(tableData);
      setSelectedTableType(type);
      setShowTable(true);
    }
  };

  // Handle table close
  const handleTableClose = () => {
    setShowTable(false);
    setSelectedTableData(null);
    setSelectedTableType(null);
  };

  // Check if all 3 required files are present
  const hasAllRequiredFiles = data && typeof data === 'object' && !Array.isArray(data) && 
    data['Screen_Reject.json'] && data['Tech_Reject.json'] && data['groupoutput.json'];

  return (
    <div className="feedback-dashboard">
      {/* Header Message for Incomplete File Selection */}
      {data && !hasAllRequiredFiles && (
        <div className="feedback-dashboard__header-message">
          <div className="feedback-dashboard__message-icon">⚠️</div>
          <div className="feedback-dashboard__message-content">
            <h4>Please select all 3 JSON files</h4>
            <p>Currently selected: {data ? Object.keys(data).length : 0} of 3 required files</p>
          </div>
        </div>
      )}

      {!processedData ? (
        <div className="feedback-dashboard__empty-state">
          <div className="feedback-dashboard__empty-icon">📁</div>
          <h3>No Data Available</h3>
          <p>Upload the required JSON files to view feedback analysis</p>
          <div className="feedback-dashboard__required-files">
            <h4>Required Files:</h4>
            <ul>
              <li>Screen_Reject.json</li>
              <li>Tech_Reject.json</li>
              <li>groupoutput.json</li>
            </ul>
          </div>
        </div>
      ) : (
        <DataCards 
          data={processedData} 
          onCardClick={handleCardClick}
        />
      )}

      {/* Data Table Modal */}
      {showTable && (
        <DataTable
          data={selectedTableData}
          type={selectedTableType}
          onClose={handleTableClose}
        />
      )}
    </div>
  );
};

export default FeedbackDashboard;
