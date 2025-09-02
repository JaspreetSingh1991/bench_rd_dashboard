# Bench/RD Dashboard

A React-based dashboard application for tracking and analyzing Bench/RD data from Excel files.

## Features

- **Two Views**: Matrix View and Details View for different data visualization
- **Excel File Support**: Automatically reads Excel files with specific sheet requirements
- **Status Analysis**: Calculates counts for 5 different status types based on complex business rules
- **Grade-based Filtering**: Supports A1, A2, B1, B2, B3, B4 grade types
- **Cross-platform**: Works as both web application and desktop application (Electron)

## Status Types Analyzed

1. **Available - ML return constraint**: Counts records with "Avail_BenchRD" deployment status AND "ML Case" in any of Match 1/2/3 columns
2. **Blocked**: Counts records with "Blocked SPE" deployment status
3. **Client Blocked**: Counts records with "Blocked Outside SPE" deployment status
4. **Available - Location Constraint**: Counts records with "Avail_BenchRD" deployment status AND "Yes" in Location Constraint column
5. **Available - High Bench Ageing**: Counts records with "Avail_BenchRD" deployment status AND Aging > 90 days

## Excel File Requirements

The application expects an Excel file named `Bench_RD Tracker_update.xlsx` with the following specifications:

- **File Location**: Documents folder (for auto-load feature)
- **Sheet Name**: `RD_BENCH_Tracker`
- **Required Columns**:
  - `Bench/RD`: Identifies if record is Bench or RD
  - `Grade`: Grade type (A1, A2, B1, B2, B3, B4)
  - `Deployment Status`: Current deployment status
  - `Match 1`, `Match 2`, `Match 3`: Match information
  - `Location Constraint`: Location constraint information
  - `Aging`: Aging in days

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Web Application
```bash
npm start
```
This will start the React development server at `http://localhost:3000`

### Desktop Application (Electron)
```bash
# Development mode
npm run electron-dev

# Production build
npm run electron-pack
```

## How to Use

1. **Start the application** (web or desktop version)
2. **Load Data** using one of the following methods:
   - **Upload Excel File**: Click "Upload Excel File" to select and upload your Excel file
   - **Select Excel File**: Click "Select Excel File" to browse and select an Excel file (Electron only)
   - **Auto Load**: Click "Auto Load from Documents" to automatically load the file from Documents folder (Electron only)
   - **Sample Data**: Click "Load Sample Data" to load demonstration data (web version)

3. **View Data** in two different formats:
   - **Matrix View**: Shows a comprehensive table with all Bench/RD types, grades, and status counts
   - **Details View**: Shows separate cards for Bench and RD with detailed breakdowns

## File Structure

```
bench-rd-dashboard/
├── public/
│   ├── electron.js          # Electron main process
│   ├── preload.js           # Electron preload script
│   └── index.html
├── src/
│   ├── components/
│   │   └── ExcelUploader.js # Excel file handling component
│   ├── App.js               # Main application component
│   └── index.js
└── package.json
```

## Technical Details

### Dependencies
- **React**: Frontend framework
- **Material-UI**: UI component library
- **XLSX**: Excel file parsing
- **React Router**: Navigation
- **Electron**: Desktop application framework (optional)

### Business Logic
The application implements complex business rules to categorize records:

1. **ML Return Constraint**: Checks for "Avail_BenchRD" status AND "ML Case" in match columns
2. **Blocked Status**: Direct mapping from deployment status
3. **Location Constraint**: Checks for "Avail_BenchRD" status AND location constraint
4. **High Bench Ageing**: Checks for "Avail_BenchRD" status AND aging > 90 days

### Data Processing
- Automatically reads Excel files from specified location
- Validates required sheet and column structure
- Processes data according to business rules
- Generates real-time counts and statistics
- Provides both matrix and detailed views

## Troubleshooting

### Common Issues

1. **Excel file not found**: Ensure the file is named exactly `Bench_RD Tracker_update.xlsx` and located in the Documents folder
2. **Sheet not found**: Verify the Excel file contains a sheet named `RD_BENCH_Tracker`
3. **Missing columns**: Ensure all required columns are present in the Excel file
4. **Permission errors**: Make sure the application has permission to access the Documents folder

### Error Messages
- "Excel file not found in Documents folder": File doesn't exist or is in wrong location
- "Sheet 'RD_BENCH_Tracker' not found": Wrong sheet name in Excel file
- "Excel file is empty or has no data rows": File structure issue

## Development

### Adding New Status Types
To add new status types, modify the `calculateStatusCounts` function in `App.js` and update the `statusTypes` array.

### Modifying Business Rules
Business rules are implemented in the `calculateStatusCounts` function. Update the conditions to match new requirements.

### Styling
The application uses Material-UI for styling. Modify the `sx` props or create custom themes as needed.

## License

This project is created for internal use. Please ensure compliance with your organization's policies.
