// Simple test file for business logic functions
import { calculateStatusCounts, generateSampleData, validateExcelData } from './businessLogic';

// Test data
const testData = [
  {
    'Bench/RD': 'Bench',
    'Grade': 'D1',
    'Deployment Status': 'Avail_BenchRD',
    'Match 1': 'ML Case',
    'Match 2': 'Other Case',
    'Match 3': 'Other Case',
    'Location Constraint': 'No',
    'Aging': 45
  },
  {
    'Bench/RD': 'Bench',
    'Grade': 'D1',
    'Deployment Status': 'Blocked SPE',
    'Match 1': 'Other Case',
    'Match 2': 'Other Case',
    'Match 3': 'Other Case',
    'Location Constraint': 'No',
    'Aging': 30
  },
  {
    'Bench/RD': 'RD',
    'Grade': 'B1',
    'Deployment Status': 'Avail_BenchRD',
    'Match 1': 'Other Case',
    'Match 2': 'Other Case',
    'Match 3': 'Other Case',
    'Location Constraint': 'Yes',
    'Aging': 120
  }
];

// Test functions
export const runTests = () => {
  console.log('Running business logic tests...');
  
  // Test calculateStatusCounts
  const counts = calculateStatusCounts(testData);
  console.log('Status counts:', counts);
  
  // Test generateSampleData
  const sampleData = generateSampleData();
  console.log('Sample data length:', sampleData.length);
  
  // Test validateExcelData
  const validation = validateExcelData(testData);
  console.log('Validation result:', validation);
  
  // Verify specific business rules
  const benchD1Counts = counts['Bench']['D1'];
  console.log('Bench D1 counts:', benchD1Counts);
  
  // Should have 1 ML return constraint (first record)
  console.log('ML return constraint test:', benchD1Counts['Available - ML return constraint'] === 1);
  
  // Should have 1 Internal Blocked (second record)
  console.log('Internal Blocked test:', benchD1Counts['Internal Blocked'] === 1);
  
  // RD B1 should have 1 Location Constraint and 1 High Bench Ageing (third record)
  const rdB1Counts = counts['RD']['B1'];
  console.log('RD B1 counts:', rdB1Counts);
  console.log('Location constraint test:', rdB1Counts['Available - Location Constraint'] === 1);
  console.log('High bench ageing test:', rdB1Counts['Available - High Bench Ageing'] === 1);
  
  console.log('All tests completed!');
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runBusinessLogicTests = runTests;
} else {
  // Node.js environment
  runTests();
}
