// Business logic functions for Bench/RD Dashboard

export const calculateStatusCounts = (data) => {
  const counts = {};
  
  // Memory optimization: Process data in chunks if it's very large
  const CHUNK_SIZE = 1000;
  
  const processChunk = (chunk) => {
    chunk.forEach(record => {
    const originalBenchRd = record['Bench/RD'];
    // Map ML Return to Bench to avoid creating separate rows
    const benchRd = originalBenchRd && originalBenchRd.toLowerCase().includes('ml return') ? 'Bench' : originalBenchRd;
    const grade = record['Grade'];
    const deploymentStatus = record['Deployment Status'];
    const aging = Number(record['Aging']) || 0;
    
    // Process aging data without debug logging for better performance
    
    if (!counts[benchRd]) {
      counts[benchRd] = {};
    }
    if (!counts[benchRd][grade]) {
      counts[benchRd][grade] = {
        'Client Blocked': 0,
        'Internal Blocked': 0,
        'Available - Location Constraint': 0,
        'Available - ML return constraint': 0,
        'Available - High Bench Ageing 90+': 0
      };
    }
    
    // Check for Available - ML return constraint
    const isMLReturn = originalBenchRd && originalBenchRd.toLowerCase().includes('ml return');
    const isMLDeploymentStatusAvailable = deploymentStatus && deploymentStatus.toLowerCase().includes('available');
    const isMLConstraint = isMLReturn && isMLDeploymentStatusAvailable;
    
    if (isMLConstraint) {
      // ML Return resources are already mapped to Bench row above, so count them here
      counts[benchRd][grade]['Available - ML return constraint']++;
    }
    
    // Check for Internal Blocked - case insensitive check for 'Internal Blocked' in Deployment Status
    if (deploymentStatus && deploymentStatus.toLowerCase().includes('internal blocked')) {
      counts[benchRd][grade]['Internal Blocked']++;
    }
    
    // Check for Client Blocked - case insensitive check for 'Client Blocked' in Deployment Status
    if (deploymentStatus && deploymentStatus.toLowerCase().includes('client blocked')) {
      counts[benchRd][grade]['Client Blocked']++;
    }
    
    // Check for Available - Location Constraint - check Relocation is empty or '-' and Deployment Status contains 'Available'
    const relocation = (record['Relocation'] || '').toString().trim();
    const isRelocationEmpty = relocation === '' || relocation === '-';
    const isDeploymentStatusAvailable = deploymentStatus && deploymentStatus.trim().toLowerCase().includes('available');
    
    if (isDeploymentStatusAvailable && isRelocationEmpty && !isMLConstraint) {
      counts[benchRd][grade]['Available - Location Constraint']++;
    }
    
    // Check for Available - High Bench Ageing 90+
    const isHighAgingDeploymentStatusAvailable = deploymentStatus && deploymentStatus.toLowerCase().includes('available');
    
    if (isHighAgingDeploymentStatusAvailable && aging > 90) {
      // Count by Bench/RD and Grade - records with aging > 90 days
      counts[benchRd][grade]['Available - High Bench Ageing 90+']++;
      
      // High Bench Ageing found - no debug logging for performance
    }
    });
  };
  
  // Process data in chunks for large datasets
  if (data.length > CHUNK_SIZE) {
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      processChunk(chunk);
    }
  } else {
    processChunk(data);
  }
  
  return counts;
};

export const generateSampleData = () => {
  // Generate sample data that matches the expected structure
  const benchRdTypes = ['Bench', 'RD'];
  const grades = ['B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
  const deploymentStatuses = [
    'Avail_BenchRD',
    'Blocked SPE',
    'Blocked Outside SPE'
  ];
  
  const sampleData = [];
  
  benchRdTypes.forEach(benchRd => {
    grades.forEach(grade => {
      // Generate 5-15 records for each combination
      const recordCount = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < recordCount; i++) {
        const deploymentStatus = deploymentStatuses[Math.floor(Math.random() * deploymentStatuses.length)];
        const match1 = Math.random() > 0.7 ? 'ML Case' : 'Other Case';
        const match2 = Math.random() > 0.8 ? 'ML Case' : 'Other Case';
        const match3 = Math.random() > 0.9 ? 'ML Case' : 'Other Case';
        const locationConstraint = Math.random() > 0.8 ? 'Yes' : 'No';
        const aging = Math.floor(Math.random() * 120) + 30; // 30-150 days
        
        sampleData.push({
          'Bench/RD': benchRd,
          'Grade': grade,
          'Deployment Status': deploymentStatus,
          'Match 1': match1,
          'Match 2': match2,
          'Match 3': match3,
          'Location Constraint': locationConstraint,
          'Aging': aging
        });
      }
    });
  });
  
  return sampleData;
};

export const validateExcelData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { isValid: false, error: 'Data is empty or not an array' };
  }
  
  const requiredColumns = [
    'Bench/RD',
    'Grade',
    'Deployment Status',
    'Match 1',
    'Match 2',
    'Match 3',
    'Location Constraint',
    'Aging'
  ];
  
  const firstRecord = data[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRecord));
  
  if (missingColumns.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required columns: ${missingColumns.join(', ')}` 
    };
  }
  
  return { isValid: true };
};
