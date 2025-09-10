import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

const TrendAnalysis = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="trends-container">
        <div className="trends-empty-state">
          <div className="trends-empty-icon">📈</div>
          <h3>No Data Available</h3>
          <p>Upload an Excel file to view trend analysis</p>
        </div>
      </div>
    );
  }

  // Enhanced trend calculations
  const calculateTrends = () => {
    // Aging trend analysis
    const agingTrends = data
      .filter(record => (record['Deployment Status'] || '').toLowerCase().includes('available'))
      .reduce((acc, record) => {
        const aging = Number(record['Aging']) || 0;
        const ageGroup = aging <= 30 ? '0-30' : 
                        aging <= 60 ? '31-60' : 
                        aging <= 90 ? '61-90' : '90+';
        
        if (!acc[ageGroup]) {
          acc[ageGroup] = { name: ageGroup, count: 0, avgAging: 0, total: 0 };
        }
        acc[ageGroup].count++;
        acc[ageGroup].total += aging;
        acc[ageGroup].avgAging = Math.round(acc[ageGroup].total / acc[ageGroup].count);
        
        return acc;
      }, {});

    // Grade efficiency analysis
    const gradeEfficiency = {};
    data.forEach(record => {
      const grade = record['Grade'];
      const isAvailable = (record['Deployment Status'] || '').toLowerCase().includes('available');
      
      if (!gradeEfficiency[grade]) {
        gradeEfficiency[grade] = { total: 0, available: 0, blocked: 0, avgAging: 0, agingTotal: 0 };
      }
      
      gradeEfficiency[grade].total++;
      if (isAvailable) {
        gradeEfficiency[grade].available++;
        const aging = Number(record['Aging']) || 0;
        gradeEfficiency[grade].agingTotal += aging;
      } else {
        gradeEfficiency[grade].blocked++;
      }
    });

    // Calculate efficiency percentages and average aging
    Object.keys(gradeEfficiency).forEach(grade => {
      const gradeData = gradeEfficiency[grade];
      gradeData.efficiency = Math.round((gradeData.available / gradeData.total) * 100);
      gradeData.avgAging = gradeData.available > 0 ? 
        Math.round(gradeData.agingTotal / gradeData.available) : 0;
    });

    // Bench/RD efficiency analysis
    const benchRdEfficiency = {};
    data.forEach(record => {
      let benchRd = record['Bench/RD'];
      if (benchRd && benchRd.toLowerCase().includes('ml return')) {
        benchRd = 'ML Return';
      }
      
      const isAvailable = (record['Deployment Status'] || '').toLowerCase().includes('available');
      
      if (!benchRdEfficiency[benchRd]) {
        benchRdEfficiency[benchRd] = { total: 0, available: 0, blocked: 0, avgAging: 0, agingTotal: 0 };
      }
      
      benchRdEfficiency[benchRd].total++;
      if (isAvailable) {
        benchRdEfficiency[benchRd].available++;
        const aging = Number(record['Aging']) || 0;
        benchRdEfficiency[benchRd].agingTotal += aging;
      } else {
        benchRdEfficiency[benchRd].blocked++;
      }
    });

    // Calculate efficiency percentages
    Object.keys(benchRdEfficiency).forEach(benchRd => {
      const benchRdData = benchRdEfficiency[benchRd];
      benchRdData.efficiency = Math.round((benchRdData.available / benchRdData.total) * 100);
      benchRdData.avgAging = benchRdData.available > 0 ? 
        Math.round(benchRdData.agingTotal / benchRdData.available) : 0;
    });

    // Status trend analysis
    const statusTrends = {};
    data.forEach(record => {
      const status = record['Deployment Status'];
      if (status) {
        if (!statusTrends[status]) {
          statusTrends[status] = 0;
        }
        statusTrends[status]++;
      }
    });

    // Location trend analysis
    const locationTrends = {};
    data.forEach(record => {
      const location = record['Location'] || 'Unknown';
      if (!locationTrends[location]) {
        locationTrends[location] = { total: 0, available: 0, avgAging: 0, agingTotal: 0 };
      }
      
      const isAvailable = (record['Deployment Status'] || '').toLowerCase().includes('available');
      locationTrends[location].total++;
      
      if (isAvailable) {
        locationTrends[location].available++;
        const aging = Number(record['Aging']) || 0;
        locationTrends[location].agingTotal += aging;
      }
    });

    // Calculate location efficiency
    Object.keys(locationTrends).forEach(location => {
      const locationData = locationTrends[location];
      locationData.efficiency = Math.round((locationData.available / locationData.total) * 100);
      locationData.avgAging = locationData.available > 0 ? 
        Math.round(locationData.agingTotal / locationData.available) : 0;
    });

    // Constraint analysis
    const constraintAnalysis = {
      mlReturn: data.filter(record => {
        const benchRd = record['Bench/RD'] || '';
        const deploymentStatus = record['Deployment Status'] || '';
        return benchRd.toLowerCase().includes('ml return') && 
               deploymentStatus.toLowerCase().includes('available');
      }).length,
      locationConstraint: data.filter(record => {
        const relocation = (record['Relocation'] || '').toString().trim();
        const isRelocationEmpty = relocation === '' || relocation === '-';
        const isDeploymentStatusAvailable = record['Deployment Status'] && 
          record['Deployment Status'].trim().toLowerCase().includes('available');
        const isMLConstraint = (record['Bench/RD'] || '').toLowerCase().includes('ml return') && 
          (record['Deployment Status'] || '').toLowerCase().includes('available');
        return isDeploymentStatusAvailable && isRelocationEmpty && !isMLConstraint;
      }).length,
      highAging: data.filter(record => {
        const deploymentStatus = record['Deployment Status'] || '';
        const aging = Number(record['Aging']) || 0;
        return deploymentStatus.toLowerCase().includes('available') && aging > 90;
      }).length
    };

    // Aging distribution
    const agingDistribution = data
      .filter(record => (record['Deployment Status'] || '').toLowerCase().includes('available'))
      .map(record => ({
        grade: record['Grade'],
        aging: Number(record['Aging']) || 0,
        benchRd: record['Bench/RD'],
        location: record['Location'] || 'Unknown'
      }))
      .sort((a, b) => b.aging - a.aging);

    return {
      agingTrends,
      gradeEfficiency,
      benchRdEfficiency,
      statusTrends,
      locationTrends,
      constraintAnalysis,
      agingDistribution
    };
  };

  const trends = calculateTrends();

  // Prepare chart data
  const agingTrendData = Object.values(trends.agingTrends).sort((a, b) => {
    const order = { '0-30': 1, '31-60': 2, '61-90': 3, '90+': 4 };
    return order[a.name] - order[b.name];
  });

  const gradeEfficiencyData = Object.entries(trends.gradeEfficiency).map(([grade, data]) => ({
    grade,
    efficiency: data.efficiency,
    total: data.total,
    available: data.available,
    avgAging: data.avgAging
  })).sort((a, b) => b.efficiency - a.efficiency);

  const benchRdEfficiencyData = Object.entries(trends.benchRdEfficiency).map(([benchRd, data]) => ({
    benchRd,
    efficiency: data.efficiency,
    total: data.total,
    available: data.available,
    avgAging: data.avgAging
  }));

  const statusTrendData = Object.entries(trends.statusTrends).map(([status, count]) => ({
    status: status.length > 20 ? status.substring(0, 20) + '...' : status,
    count,
    fullStatus: status
  })).sort((a, b) => b.count - a.count);

  const locationEfficiencyData = Object.entries(trends.locationTrends)
    .filter(([, data]) => data.total >= 3) // Only show locations with 3+ resources
    .map(([location, data]) => ({
      location: location.length > 15 ? location.substring(0, 15) + '...' : location,
      efficiency: data.efficiency,
      total: data.total,
      available: data.available,
      avgAging: data.avgAging,
      fullLocation: location
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 10);

  const constraintData = [
    { name: 'ML Return', value: trends.constraintAnalysis.mlReturn, color: '#8b5cf6' },
    { name: 'Location', value: trends.constraintAnalysis.locationConstraint, color: '#06b6d4' },
    { name: 'High Aging', value: trends.constraintAnalysis.highAging, color: '#f59e0b' }
  ];

  const agingDistributionData = trends.agingDistribution.slice(0, 20).map((record, index) => ({
    index: index + 1,
    aging: record.aging,
    grade: record.grade,
    benchRd: record.benchRd,
    location: record.location
  }));

  return (
    <div className="trends-container">
      {/* Key Insights Cards */}
      <div className="trends-insights-grid">
        <div className="insight-card primary">
          <div className="insight-icon">📊</div>
          <div className="insight-content">
            <h3>Grade Efficiency</h3>
            <p>Highest: {gradeEfficiencyData[0]?.grade} ({gradeEfficiencyData[0]?.efficiency}%)</p>
          </div>
        </div>
        <div className="insight-card success">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h3>Best Performing Type</h3>
            <p>{benchRdEfficiencyData.sort((a, b) => b.efficiency - a.efficiency)[0]?.benchRd}</p>
          </div>
        </div>
        <div className="insight-card warning">
          <div className="insight-icon">⚠️</div>
          <div className="insight-content">
            <h3>Total Constraints</h3>
            <p>{Object.values(trends.constraintAnalysis).reduce((sum, val) => sum + val, 0)} resources</p>
          </div>
        </div>
        <div className="insight-card info">
          <div className="insight-icon">📍</div>
          <div className="insight-content">
            <h3>Top Location</h3>
            <p>{locationEfficiencyData[0]?.fullLocation || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="trends-main-card">
        {/* Charts Grid */}
        <div className="trends-charts-grid">
        {/* Aging Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Aging Distribution</h3>
            <p>Resources by aging groups</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Efficiency */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Grade Efficiency</h3>
            <p>Availability rate by grade</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bench/RD Efficiency */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Type Efficiency</h3>
            <p>Availability rate by type</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchRdEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="benchRd" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Status Distribution</h3>
            <p>Resources by deployment status</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusTrendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Efficiency */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Location Performance</h3>
            <p>Efficiency and aging by location</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={locationEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="efficiency" fill="#06b6d4" name="Efficiency %" />
                <Line yAxisId="right" type="monotone" dataKey="avgAging" stroke="#f59e0b" name="Avg Aging" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Constraint Analysis */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Constraint Breakdown</h3>
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

        {/* Aging Scatter Plot */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Aging Resources</h3>
            <p>Individual resource aging analysis</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={agingDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" name="Rank" />
                <YAxis dataKey="aging" name="Aging Days" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="aging" fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>

        {/* Detailed Analysis Tables */}
        <div className="trends-tables">
        <div className="table-section">
          <h3>Grade Performance Analysis</h3>
          <div className="table-container">
            <table className="trends-table">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Efficiency</th>
                  <th>Avg Aging</th>
                </tr>
              </thead>
              <tbody>
                {gradeEfficiencyData.map((grade, index) => (
                  <tr key={index}>
                    <td>{grade.grade}</td>
                    <td>{grade.total}</td>
                    <td>{grade.available}</td>
                    <td>
                      <span className={`efficiency-badge ${grade.efficiency >= 70 ? 'high' : grade.efficiency >= 50 ? 'medium' : 'low'}`}>
                        {grade.efficiency}%
                      </span>
                    </td>
                    <td>{grade.avgAging} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-section">
          <h3>Location Performance Analysis</h3>
          <div className="table-container">
            <table className="trends-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Efficiency</th>
                  <th>Avg Aging</th>
                </tr>
              </thead>
              <tbody>
                {locationEfficiencyData.map((location, index) => (
                  <tr key={index}>
                    <td title={location.fullLocation}>{location.location}</td>
                    <td>{location.total}</td>
                    <td>{location.available}</td>
                    <td>
                      <span className={`efficiency-badge ${location.efficiency >= 70 ? 'high' : location.efficiency >= 50 ? 'medium' : 'low'}`}>
                        {location.efficiency}%
                      </span>
                    </td>
                    <td>{location.avgAging} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;