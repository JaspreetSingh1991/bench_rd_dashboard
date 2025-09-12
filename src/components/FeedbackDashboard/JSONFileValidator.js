import React from 'react';

const JSONFileValidator = {
  // Expected file names
  expectedFiles: ['Screen_Reject.json', 'Tech_Reject.json', 'groupoutput.json'],
  
  // Validate uploaded files
  validateFiles: (files) => {
    const errors = [];
    const fileNames = files.map(file => file.name);
    
    // Check if exactly 3 files are uploaded
    if (files.length !== 3) {
      errors.push('Please upload exactly 3 JSON files');
      return { isValid: false, errors };
    }
    
    // Check if all expected files are present
    const missingFiles = JSONFileValidator.expectedFiles.filter(expectedFile => 
      !fileNames.includes(expectedFile)
    );
    
    if (missingFiles.length > 0) {
      errors.push(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    // Check for unexpected files
    const unexpectedFiles = fileNames.filter(fileName => 
      !JSONFileValidator.expectedFiles.includes(fileName)
    );
    
    if (unexpectedFiles.length > 0) {
      errors.push(`Unexpected files detected: ${unexpectedFiles.join(', ')}. Please upload only Screen_Reject.json, Tech_Reject.json, and groupoutput.json`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Process and organize the validated files
  processFiles: (fileData) => {
    const processedData = {
      screenReject: null,
      techReject: null,
      groupOutput: null
    };
    
    // Map files by their actual names
    Object.entries(fileData).forEach(([fileName, data]) => {
      if (fileName === 'Screen_Reject.json') {
        processedData.screenReject = data;
      } else if (fileName === 'Tech_Reject.json') {
        processedData.techReject = data;
      } else if (fileName === 'groupoutput.json') {
        processedData.groupOutput = data;
      }
    });
    
    return processedData;
  }
};

export default JSONFileValidator;
