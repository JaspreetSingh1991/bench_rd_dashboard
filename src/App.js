import React, { useState } from 'react';
import { calculateStatusCounts } from './utils/businessLogic';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardSwitcher from './components/DashboardSwitcher';
import Modal from './components/Modal';
import './App.css';

// Dashboard Component
const Dashboard = ({ data, error, onDataLoaded, onError }) => {
  const [activeView, setActiveView] = useState('upload');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState([]);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [, setDetailsFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState('supply-quality');
  const tableContainerRef = React.useRef(null);

  // Dashboard configurations
  const dashboards = {
    'supply-quality': {
      name: 'Supply Quality Dashboard',
      icon: '📊',
      description: 'Resource Management System'
    },
    'demand-forecast': {
      name: 'Demand Forecast Dashboard',
      icon: '📈',
      description: 'Resource Planning & Forecasting'
    },
    'performance-analytics': {
      name: 'Performance Analytics',
      icon: '⚡',
      description: 'Resource Performance Metrics'
    },
    'capacity-planning': {
      name: 'Capacity Planning',
      icon: '🏗️',
      description: 'Resource Capacity Management'
    }
  };

  const handleDashboardSwitch = (dashboardKey) => {
    setCurrentDashboard(dashboardKey);
    setSidebarOpen(false);
    
    // Only reset data when switching away from Supply Quality Dashboard
    if (currentDashboard === 'supply-quality' && dashboardKey !== 'supply-quality') {
      setActiveView('upload');
      setDataLoaded(false);
    } else if (dashboardKey === 'supply-quality') {
      // When switching back to Supply Quality Dashboard, keep current state
      // Don't reset data or view
    } else {
      // For other dashboards, show dummy content
      setActiveView('dummy');
    }
  };

  // Function to get unique color for Bench/RD values
  const getBenchRdColor = (benchRd) => {
    const colors = {
      'Bench': '#6b7280',      // Grey
      'RD': '#f59e0b',         // Orange
      'ML Return': '#8b5cf6',  // Purple
      'Contract': '#ef4444',   // Red
      'Permanent': '#06b6d4',  // Cyan
      'Temporary': '#f97316',  // Orange-red
      'Consultant': '#84cc16', // Lime
      'Intern': '#ec4899'      // Pink
    };
    return colors[benchRd] || '#6b7280';
  };

  // Function to get background color for Bench/RD values
  const getBenchRdBackgroundColor = (benchRd) => {
    const backgroundColors = {
      'Bench': '#f3f4f6',      // Light grey
      'RD': '#fef3c7',         // Light orange
      'ML Return': '#e0e7ff',  // Light purple
      'Contract': '#fef2f2',   // Light red
      'Permanent': '#ecfeff',  // Light cyan
      'Temporary': '#fff7ed',  // Light orange-red
      'Consultant': '#f0fdf4', // Light lime
      'Intern': '#fdf2f8'      // Light pink
    };
    return backgroundColors[benchRd] || '#f3f4f6';
  };

  // Function to get badge style for Bench/RD values
  const getBenchRdBadgeStyle = (benchRd) => {
    const badgeStyles = {
      'Bench': { backgroundColor: '#FFF8E1', color: '#8D6E63', borderColor: '#D4AF37' },
      'RD': { backgroundColor: '#E3F2FD', color: '#1565C0', borderColor: '#1976D2' },
      'ML Return': { backgroundColor: '#FFF3E0', color: '#E65100', borderColor: '#FF9800' },
      'Temporary': { backgroundColor: '#FFF3E0', color: '#E65100', borderColor: '#FF9800' },
      'Contract': { backgroundColor: '#FFEBEE', color: '#C62828', borderColor: '#D32F2F' },
      'Permanent': { backgroundColor: '#E0F2F1', color: '#00695C', borderColor: '#00796B' },
      'Consultant': { backgroundColor: '#F1F8E9', color: '#558B2F', borderColor: '#689F38' },
      'Intern': { backgroundColor: '#FCE4EC', color: '#AD1457', borderColor: '#C2185B' }
    };

    if (badgeStyles[benchRd]) {
      return badgeStyles[benchRd];
    }

    // Generate fallback color avoiding green and purple
    const hash = benchRd.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 300; // Avoid green (120) and purple (270-300)
    const adjustedHue = hue < 120 ? hue : hue + 60; // Shift away from green
    const finalHue = adjustedHue > 270 ? adjustedHue - 60 : adjustedHue; // Shift away from purple
    
    return {
      backgroundColor: `hsl(${finalHue}, 70%, 90%)`,
      color: `hsl(${finalHue}, 50%, 30%)`,
      borderColor: `hsl(${finalHue}, 60%, 50%)`
    };
  };

  // Function to get aging tag class
  const getAgingTagClass = (aging) => {
    const days = parseInt(aging) || 0;
    if (days >= 90) return 'modal-tag-aging-high';
    if (days >= 30) return 'modal-tag-aging-medium';
    return 'modal-tag-aging-low';
  };

  // Handle data loading
  const handleDataLoaded = (newData) => {
    onDataLoaded(newData);
    setDataLoaded(true);
    setActiveView('matrix');
  };

  // Handle errors
  const handleError = (errorMessage) => {
    onError(errorMessage);
    setDataLoaded(false);
  };

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    if (!data || data.length === 0) {
      return {};
    }
    return calculateStatusCounts(data);
  }, [data]);

  // Define status types and other constants
  const statusTypes = ['Available', 'Blocked', 'Available - Location Constraint', 'Available - High Bench Ageing 90+'];
  const benchRdTypes = ['Bench', 'RD', 'ML Return', 'Temporary', 'Contract', 'Permanent', 'Consultant', 'Intern'];
  const grades = ['A', 'B', 'C', 'D', 'E'];

  // Handle count clicks
  const handleCountClick = (benchRd, grade, status, count) => {
    if (count === 0) return;
    
    const filteredData = data.filter(record => {
      const recordBenchRd = record['Bench/RD'] || '';
      const recordGrade = record['Grade'] || '';
      const recordStatus = record['Deployment Status'] || '';
      
      return recordBenchRd === benchRd && 
             recordGrade === grade && 
             recordStatus === status;
    });
    
    setDetailsData(filteredData);
    setDetailsTitle(`${benchRd} - ${grade} - ${status}`);
    setDetailsOpen(true);
  };

  // Handle row total clicks
  const handleRowTotalClick = (benchRd, status, total) => {
    if (total === 0) return;
    
    const filteredData = data.filter(record => {
      const recordBenchRd = record['Bench/RD'] || '';
      return recordBenchRd === benchRd;
    });
    
    setDetailsData(filteredData);
    setDetailsTitle(`${benchRd} - All Grades`);
    setDetailsOpen(true);
  };

  // Handle grade total clicks
  const handleGradeTotalClick = (grade, total) => {
    if (total === 0) return;
    
    const filteredData = data.filter(record => {
      const recordGrade = record['Grade'] || '';
      return recordGrade === grade;
    });
    
    setDetailsData(filteredData);
    setDetailsTitle(`Grade ${grade} - All Bench/RD`);
    setDetailsOpen(true);
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onDataLoaded={handleDataLoaded}
        onError={handleError}
      />

      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentDashboard={currentDashboard}
        handleDashboardSwitch={handleDashboardSwitch}
        dashboards={dashboards}
      />

      <div className={`dashboard-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <DashboardSwitcher
          currentDashboard={currentDashboard}
          activeView={activeView}
          setActiveView={setActiveView}
          data={data}
          dataLoaded={dataLoaded}
          statusTypes={statusTypes}
          benchRdTypes={benchRdTypes}
          grades={grades}
          statusCounts={statusCounts}
          handleCountClick={handleCountClick}
          handleRowTotalClick={handleRowTotalClick}
          handleGradeTotalClick={handleGradeTotalClick}
          getBenchRdBadgeStyle={getBenchRdBadgeStyle}
          getAgingTagClass={getAgingTagClass}
          tableContainerRef={tableContainerRef}
          dashboards={dashboards}
        />
      </div>

      <Modal 
        detailsOpen={detailsOpen}
        setDetailsOpen={setDetailsOpen}
        detailsTitle={detailsTitle}
        detailsData={detailsData}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataLoaded = (newData) => {
    setData(newData);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setData(null);
  };

  return (
    <div className="App">
          <Dashboard 
        data={data} 
        error={error} 
        onDataLoaded={handleDataLoaded} 
        onError={handleError} 
      />
    </div>
  );
}

export default App;