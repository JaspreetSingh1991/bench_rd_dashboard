// Business logic functions for Bench/RD Dashboard

export const calculateStatusCounts = (data) => {
  const counts = {};
  
  // Debug: Log the data being processed
  console.log('Processing data:', data.length, 'records');
  console.log('Sample record:', data[0]);
  console.log('All Bench/RD values:', data.map(r => r['Bench/RD']).filter((v, i, a) => a.indexOf(v) === i));
  
  data.forEach(record => {
    const benchRd = record['Bench/RD'];
    const grade = record['Grade'];
    const deploymentStatus = record['Deployment Status'];
    const match1 = record['Match 1'] || '';
    const match2 = record['Match 2'] || '';
    const match3 = record['Match 3'] || '';
    const locationConstraint = record['Location Constraint'] || '';
    const aging = Number(record['Aging']) || 0;
    
    // Debug: Log all records with aging > 90 to see what's happening
    if (aging > 90) {
      console.log('Record with aging > 90 found:', {
        benchRd,
        grade,
        deploymentStatus,
        aging,
        agingType: typeof aging,
        isAvailable: deploymentStatus === 'Avail_BenchRD'
      });
    }
    
    if (!counts[benchRd]) {
      counts[benchRd] = {};
    }
    if (!counts[benchRd][grade]) {
      counts[benchRd][grade] = {
        'Available - ML return constraint': 0,
        'Blocked': 0,
        'Client Blocked': 0,
        'Available - Location Constraint': 0,
        'Available - High Bench Ageing': 0
      };
    }
    
    // Check for Available - ML return constraint
    const isMLConstraint = deploymentStatus === 'Avail_BenchRD' && 
        (match1.toLowerCase().includes('ml case') || 
         match2.toLowerCase().includes('ml case') || 
         match3.toLowerCase().includes('ml case'));
    
    if (isMLConstraint) {
      // Count by Grade - same grade data
      counts[benchRd][grade]['Available - ML return constraint']++;
      
      // Debug: Log when ML return constraint is found
      console.log('ML Return Constraint found for:', {
        benchRd,
        grade,
        deploymentStatus,
        match1,
        match2,
        match3
      });
    }
    
    // Check for Blocked
    if (deploymentStatus === 'Blocked SPE') {
      counts[benchRd][grade]['Blocked']++;
    }
    
    // Check for Client Blocked
    if (deploymentStatus === 'Blocked Outside SPE') {
      counts[benchRd][grade]['Client Blocked']++;
    }
    
    // Check for Available - Location Constraint (exclude ML constraint to avoid duplication)
    if (deploymentStatus === 'Avail_BenchRD' && 
        locationConstraint.toLowerCase() === 'yes' && 
        !isMLConstraint) {
      counts[benchRd][grade]['Available - Location Constraint']++;
    }
    
    // Check for Available - High Bench Ageing
    console.log('Checking High Bench Ageing for:', {
      benchRd,
      grade,
      deploymentStatus,
      aging,
      deploymentStatusMatch: deploymentStatus === 'Avail_BenchRD',
      agingMatch: aging > 90,
      bothConditions: deploymentStatus === 'Avail_BenchRD' && aging > 90
    });
    
    if (deploymentStatus === 'Avail_BenchRD' && aging > 90) {
      // Count by Bench/RD and Grade - records with aging > 90 days
      counts[benchRd][grade]['Available - High Bench Ageing']++;
      
      // Debug: Log when High Bench Ageing is found
      console.log('High Bench Ageing found for:', {
        benchRd,
        grade,
        deploymentStatus,
        aging
      });
    }
  });
  
  console.log('Final counts structure:', counts);
  console.log('Counts keys:', Object.keys(counts));
  console.log('Bench data:', counts['Bench']);
  console.log('RD data:', counts['RD']);
  
  return counts;
};

export const generateSampleData = () => {
  // Generate sample data that matches the expected structure
  const benchRdTypes = ['Bench', 'RD'];
  const grades = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
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
