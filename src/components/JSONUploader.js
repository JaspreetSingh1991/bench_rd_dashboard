import React, { useState } from 'react';
import { FileUploadOutlined } from '@mui/icons-material';

const JSONUploader = ({ onDataLoaded, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Validate file count
      if (files.length > 3) {
        throw new Error('Please select maximum 3 JSON files');
      }

      // Validate file types
      const invalidFiles = files.filter(file => !file.name.toLowerCase().endsWith('.json'));
      if (invalidFiles.length > 0) {
        throw new Error('Please select only JSON files');
      }

      // Process files
      const fileData = {};

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = await readJSONFile(file);
        fileData[file.name] = data;
      }

      // Check if we have all 3 files
      if (Object.keys(fileData).length < 3) {
        setError(`Please select all 3 JSON files. Currently selected: ${Object.keys(fileData).length}/3`);
        setLoading(false);
        return;
      }

      // All 3 files selected, process the data
      onDataLoaded(fileData);
    } catch (err) {
      const errorMessage = `Error reading JSON files: ${err.message}`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const readJSONFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (err) {
          reject(new Error(`Invalid JSON in file ${file.name}: ${err.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file ${file.name}`));
      };
      
      reader.readAsText(file);
    });
  };

  const handleClearAll = () => {
    setError(null);
    // Reset the file input
    const fileInput = document.getElementById('json-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          id="json-file-input"
          type="file"
          style={{ display: 'none' }}
          accept=".json"
          multiple
          onChange={handleFileUpload}
          ref={(input) => {
            if (input) {
              input.setAttribute('multiple', 'multiple');
            }
          }}
        />
        
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('json-file-input').click()}
          disabled={loading}
        >
          <FileUploadOutlined className="upload-icon" />
          Upload JSONs
        </button>

        <button
          className="btn btn-outline"
          onClick={handleClearAll}
          disabled={loading}
        >
          Clear
        </button>
      </div>

      {/* Progress Indicator */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            border: '2px solid var(--primary-200)',
            borderTop: '2px solid var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Processing JSON files...
          </span>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: 'var(--error-100)', 
          color: 'var(--error-600)', 
          borderRadius: '6px',
          fontSize: '0.875rem',
          border: '1px solid var(--error-200)',
          maxWidth: '400px',
          width: '100%'
        }}>
          {error}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JSONUploader;
