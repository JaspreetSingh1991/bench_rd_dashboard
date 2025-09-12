import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { FileUploadOutlined } from '@mui/icons-material';
// No sample data import needed

const ExcelUploader = ({ onDataLoaded, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAutoLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're running in Electron
      if (window.electronAPI) {
        const data = await window.electronAPI.loadExcelFile();
        onDataLoaded(data);
      } else {
        // No fallback data - user must upload Excel file
        onError('Please upload an Excel file to view data');
      }
    } catch (err) {
      const errorMessage = `Error loading file: ${err.message}`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded, onError]);

  // Auto-load Excel file when Electron app starts
  useEffect(() => {
    if (window.electronAPI) {
      const handleAutoLoadEvent = async () => {
        console.log('Auto-loading Excel file...');
        await handleAutoLoad();
      };
      
      window.electronAPI.onAutoLoadExcel(handleAutoLoadEvent);
      
      // Cleanup function to remove event listener
      return () => {
        if (window.electronAPI && window.electronAPI.removeAutoLoadExcel) {
          window.electronAPI.removeAutoLoadExcel(handleAutoLoadEvent);
        }
      };
    }
  }, [handleAutoLoad]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await readExcelFile(file);
      onDataLoaded(data);
    } catch (err) {
      const errorMessage = `Error reading Excel file: ${err.message}`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
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
          
          // Clean up memory - variables will be garbage collected automatically
          
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
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      {window.electronAPI && (
        <button
          className="btn btn-outline"
          onClick={handleAutoLoad}
          disabled={loading}
        >
          🔄 Auto Load
        </button>
      )}
      
      <input
        id="file-input"
        type="file"
        style={{ display: 'none' }}
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
      />
      
      <button
        className="btn btn-primary"
        onClick={() => document.getElementById('file-input').click()}
        disabled={loading}
      >
        <FileUploadOutlined className="upload-icon" />
        Upload Excel
      </button>
      
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
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading...</span>
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: 'var(--error-100)', 
          color: 'var(--error-600)', 
          borderRadius: '6px',
          fontSize: '0.875rem',
          border: '1px solid var(--error-200)',
          maxWidth: '300px'
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

export default ExcelUploader;
