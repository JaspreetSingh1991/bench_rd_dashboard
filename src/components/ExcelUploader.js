import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper
} from '@mui/material';
import * as XLSX from 'xlsx';
import { generateSampleData } from '../utils/businessLogic';

const ExcelUploader = ({ onDataLoaded, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

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

  const handleAutoLoad = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're running in Electron
      if (window.electronAPI) {
        const data = await window.electronAPI.loadExcelFile();
        onDataLoaded(data);
      } else {
        // Fallback to sample data for web version
        const sampleData = generateSampleData();
        onDataLoaded(sampleData);
      }
    } catch (err) {
      const errorMessage = `Error loading file: ${err.message}`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.selectExcelFile();
        if (data) {
          onDataLoaded(data);
        }
      } else {
        // For web version, trigger file input
        document.getElementById('file-input').click();
      }
    } catch (err) {
      const errorMessage = `Error selecting file: ${err.message}`;
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
          
          // Clean up memory
          data = null;
          workbook = null;
          worksheet = null;
          jsonData = null;
          
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
    <Paper sx={{ 
      p: 1, 
      mb: 1,
      borderRadius: 2,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {window.electronAPI && (
          <Button
            variant="outlined"
            onClick={handleAutoLoad}
            disabled={loading}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              px: 3,
              py: 1,
              borderColor: '#34495e',
              color: '#34495e',
              '&:hover': {
                borderColor: '#2c3e50',
                backgroundColor: 'rgba(52, 73, 94, 0.08)'
              },
              '&:disabled': {
                borderColor: '#bdbdbd',
                color: '#bdbdbd'
              }
            }}
          >
            🔄 Auto Load from Documents
          </Button>
        )}
      
      <input
        id="file-input"
        type="file"
        hidden
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
      />
      
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <Typography variant="body2" fontSize="0.875rem">Loading...</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}
      </Box>
    </Paper>
  );
};

export default ExcelUploader;
