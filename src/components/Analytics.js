import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';

const Analytics = ({ data }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  if (!data || data.length === 0) {
    return (
      <div className="analytics-container">
        <div className="analytics-empty-state">
          <div className="analytics-empty-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Upload an Excel file to view analytics insights</p>
        </div>
      </div>
    );
  }

  // Enhanced analytics calculations
  const calculateAnalytics = () => {
    const totalRecords = data.length;
    
    // Basic counts
    const benchCount = data.filter(record => {
      const benchRd = record['Bench/RD'];
      return benchRd === 'Bench' || (benchRd && benchRd.toLowerCase().includes('ml return'));
    }).length;
    
    const rdCount = data.filter(record => record['Bench/RD'] === 'RD').length;
    
    const availableCount = data.filter(record => {
      const deploymentStatus = record['Deployment Status'] || '';
      return deploymentStatus.toLowerCase().includes('available');
    }).length;
    
    const internalBlockedCount = data.filter(record => 
      record['Deployment Status'] && record['Deployment Status'].toLowerCase().includes('internal blocked')
    ).length;
    
    const clientBlockedCount = data.filter(record => 
      record['Deployment Status'] && record['Deployment Status'].toLowerCase().includes('client blocked')
    ).length;
    
    // Constraint analysis
    const mlReturnConstraintCount = data.filter(record => {
      const benchRd = record['Bench/RD'] || '';
      const deploymentStatus = record['Deployment Status'] || '';
      return benchRd.toLowerCase().includes('ml return') && 
             deploymentStatus.toLowerCase().includes('available');
    }).length;
    
    const locationConstraintCount = data.filter(record => {
      const relocation = (record['Relocation'] || '').toString().trim();
      const isRelocationEmpty = relocation === '' || relocation === '-';
      const isDeploymentStatusAvailable = record['Deployment Status'] && 
        record['Deployment Status'].trim().toLowerCase().includes('available');
      const isMLConstraint = (record['Bench/RD'] || '').toLowerCase().includes('ml return') && 
        (record['Deployment Status'] || '').toLowerCase().includes('available');
      return isDeploymentStatusAvailable && isRelocationEmpty && !isMLConstraint;
    }).length;
    
    const highAgingCount = data.filter(record => {
      const deploymentStatus = record['Deployment Status'] || '';
      const aging = Number(record['Aging']) || 0;
      return deploymentStatus.toLowerCase().includes('available') && aging > 90;
    }).length;

    // Grade distribution
    const gradeDistribution = {};
    data.forEach(record => {
      const grade = record['Grade'];
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    // Aging analysis
    const agingData = data
      .filter(record => (record['Deployment Status'] || '').toLowerCase().includes('available'))
      .map(record => ({
        grade: record['Grade'],
        aging: Number(record['Aging']) || 0,
        benchRd: record['Bench/RD'],
        name: record['Name'] || 'Unknown'
      }))
      .sort((a, b) => b.aging - a.aging);
    
    // Status distribution
    const statusDistribution = {};
    data.forEach(record => {
      const status = record['Deployment Status'];
      if (status) {
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      }
    });
    
    // Location analysis
    const locationAnalysis = {};
    data.forEach(record => {
      const location = record['Location'] || 'Unknown';
      locationAnalysis[location] = (locationAnalysis[location] || 0) + 1;
    });
    
    // Aging trends by grade
    const agingByGrade = {};
    data.forEach(record => {
      const grade = record['Grade'];
      const aging = Number(record['Aging']) || 0;
      if (!agingByGrade[grade]) {
        agingByGrade[grade] = [];
      }
      agingByGrade[grade].push(aging);
    });
    
    // Calculate average aging by grade
    const avgAgingByGrade = Object.entries(agingByGrade).map(([grade, agings]) => ({
      grade,
      avgAging: Math.round(agings.reduce((sum, aging) => sum + aging, 0) / agings.length),
      maxAging: Math.max(...agings),
      minAging: Math.min(...agings),
      count: agings.length
    }));
    
    // Utilization rate
    const utilizationRate = totalRecords > 0 ? Math.round((availableCount / totalRecords) * 100) : 0;
    
    // Constraint analysis
    const constraintAnalysis = {
      totalConstraints: mlReturnConstraintCount + locationConstraintCount + highAgingCount,
      mlReturnPercentage: totalRecords > 0 ? Math.round((mlReturnConstraintCount / totalRecords) * 100) : 0,
      locationPercentage: totalRecords > 0 ? Math.round((locationConstraintCount / totalRecords) * 100) : 0,
      highAgingPercentage: totalRecords > 0 ? Math.round((highAgingCount / totalRecords) * 100) : 0
    };

    return {
      totalRecords,
      benchCount,
      rdCount,
      availableCount,
      internalBlockedCount,
      clientBlockedCount,
      mlReturnConstraintCount,
      locationConstraintCount,
      highAgingCount,
      gradeDistribution,
      agingData,
      statusDistribution,
      locationAnalysis,
      avgAgingByGrade,
      utilizationRate,
      constraintAnalysis
    };
  };

  const analytics = calculateAnalytics();

  // Chart data preparation
  const benchRdData = [
    { name: 'Bench', value: analytics.benchCount, color: '#3b82f6' },
    { name: 'RD', value: analytics.rdCount, color: '#10b981' }
  ];

  const statusData = [
    { name: 'Available', value: analytics.availableCount, color: '#10b981' },
    { name: 'Internal Blocked', value: analytics.internalBlockedCount, color: '#f59e0b' },
    { name: 'Client Blocked', value: analytics.clientBlockedCount, color: '#ef4444' }
  ];

  const gradeData = Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
    name: grade,
    value: count,
    color: grade === 'B1' ? '#3b82f6' : grade === 'B2' ? '#1d4ed8' : 
           grade === 'C1' ? '#10b981' : grade === 'C2' ? '#059669' :
           grade === 'D1' ? '#f59e0b' : '#d97706'
  }));

  const agingChartData = analytics.agingData.slice(0, 15).map(record => ({
    name: `${record.grade}`,
    aging: record.aging,
    benchRd: record.benchRd
  }));

  const constraintData = [
    { name: 'ML Return', value: analytics.mlReturnConstraintCount, color: '#8b5cf6' },
    { name: 'Location', value: analytics.locationConstraintCount, color: '#06b6d4' },
    { name: 'High Aging', value: analytics.highAgingCount, color: '#f59e0b' }
  ];

  const locationData = Object.entries(analytics.locationAnalysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([location, count]) => ({
      name: location,
      value: count
    }));

  const agingTrendData = analytics.avgAgingByGrade.sort((a, b) => b.avgAging - a.avgAging);

  // Modal handlers
  const handleTotalResourcesClick = () => {
    setModalData(data);
    setModalTitle('Total Resources');
    setModalOpen(true);
  };

  const handleAvailableResourcesClick = () => {
    const availableResources = data.filter(record => {
      const deploymentStatus = record['Deployment Status'] || '';
      return deploymentStatus.toLowerCase().includes('available');
    });
    setModalData(availableResources);
    setModalTitle('Available Resources');
    setModalOpen(true);
  };

  const handleConstrainedResourcesClick = () => {
    const constrainedResources = data.filter(record => {
      const mlReturnConstraint = (record['Bench/RD'] || '').toLowerCase().includes('ml return') && 
        (record['Deployment Status'] || '').toLowerCase().includes('available');
      
      const locationConstraint = (() => {
        const relocation = (record['Relocation'] || '').toString().trim();
        const isRelocationEmpty = relocation === '' || relocation === '-';
        const isDeploymentStatusAvailable = record['Deployment Status'] && 
          record['Deployment Status'].trim().toLowerCase().includes('available');
        const isMLConstraint = (record['Bench/RD'] || '').toLowerCase().includes('ml return') && 
          (record['Deployment Status'] || '').toLowerCase().includes('available');
        return isDeploymentStatusAvailable && isRelocationEmpty && !isMLConstraint;
      })();
      
      const highAgingConstraint = (() => {
        const deploymentStatus = record['Deployment Status'] || '';
        const aging = Number(record['Aging']) || 0;
        return deploymentStatus.toLowerCase().includes('available') && aging > 90;
      })();
      
      return mlReturnConstraint || locationConstraint || highAgingConstraint;
    });
    setModalData(constrainedResources);
    setModalTitle('Constrained Resources');
    setModalOpen(true);
  };

  const handleUtilizationRateClick = () => {
    const availableResources = data.filter(record => {
      const deploymentStatus = record['Deployment Status'] || '';
      return deploymentStatus.toLowerCase().includes('available');
    });
    setModalData(availableResources);
    setModalTitle('Utilization Rate - Available Resources');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData([]);
    setModalTitle('');
  };

  return (
    <div className="analytics-container">
      {/* Key Metrics Cards */}
      <div className="analytics-metrics-grid">
        <div className="metric-card primary" onClick={handleTotalResourcesClick} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{analytics.totalRecords}</h3>
            <p>Total Resources</p>
          </div>
        </div>
        <div className="metric-card success" onClick={handleAvailableResourcesClick} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>{analytics.availableCount}</h3>
            <p>Available Resources</p>
            <span className="metric-percentage">{analytics.utilizationRate}%</span>
          </div>
        </div>
        <div className="metric-card warning" onClick={handleConstrainedResourcesClick} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <h3>{analytics.constraintAnalysis.totalConstraints}</h3>
            <p>Constrained Resources</p>
          </div>
        </div>
        <div className="metric-card info" onClick={handleUtilizationRateClick} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>{analytics.utilizationRate}%</h3>
            <p>Utilization Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="analytics-main-card">
      {/* Charts Grid */}
        <div className="analytics-charts-grid">
        {/* Resource Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Resource Distribution</h3>
            <p>Bench vs RD resources</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={benchRdData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {benchRdData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Status Distribution</h3>
            <p>Current deployment status</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Grade Distribution</h3>
            <p>Resources by grade level</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Constraint Analysis */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Constraint Analysis</h3>
            <p>Available resources with constraints</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={constraintData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {constraintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aging Analysis */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Top Aging Resources</h3>
            <p>Resources with highest aging days</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="aging" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Analysis */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Location Distribution</h3>
            <p>Resources by location</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Aging by Grade */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Average Aging by Grade</h3>
            <p>Mean aging days per grade</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgAging" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>

        {/* Insights Section */}
        <div className="analytics-insights">
          <h3>Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Utilization Rate</h4>
                <p>{analytics.utilizationRate}% of resources are currently available for deployment</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <h4>Constraint Analysis</h4>
                <p>{analytics.constraintAnalysis.totalConstraints} resources have deployment constraints</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Grade Distribution</h4>
                <p>Most resources are in {Object.entries(analytics.gradeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0]} grade</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⏰</div>
              <div className="insight-content">
                <h4>Aging Concerns</h4>
                <p>{analytics.highAgingCount} resources have been available for over 90 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modalTitle}</h2>
              <div className="modal-count-badge">{modalData.length} Records</div>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Resource Name</th>
                      <th>Grade</th>
                      <th>Skill Set</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Aging</th>
                      <th>Bench/RD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((record, index) => (
                      <tr key={index}>
                        <td className="modal-resource-name">
                          {record['Name'] || record['Employee Name'] || record['Resource Name'] || record['Employee'] || record['Resource'] || `Resource ${index + 1}`}
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-grade">{record['Grade'] || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="modal-tag modal-tag-skill">
                            {record['Skill Set'] || record['Skills'] || record['Skill'] || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`modal-tag modal-tag-status-${(record['Deployment Status'] || '').toLowerCase().replace(/\s+/g, '-')}`}>
                            {record['Deployment Status'] || 'N/A'}
                          </span>
                        </td>
                        <td>{record['Location'] || 'N/A'}</td>
                        <td>{record['Aging'] || 'N/A'}</td>
                        <td>
                          <span className={`modal-tag modal-tag-bench-rd ${(record['Bench/RD'] || '').toLowerCase().replace(/\s+/g, '-')}`}>
                            {record['Bench/RD'] || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;