import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
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
  Cell
} from 'recharts';



const Analytics = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No data available for analytics
        </Typography>
      </Paper>
    );
  }

  // Calculate analytics data
  const calculateAnalytics = () => {
    const analytics = {
      totalRecords: data.length,
      benchCount: data.filter(record => record['Bench/RD'] === 'Bench').length,
      rdCount: data.filter(record => record['Bench/RD'] === 'RD').length,
      availableCount: data.filter(record => record['Deployment Status'] === 'Avail_BenchRD').length,
      blockedCount: data.filter(record => record['Deployment Status'] === 'Blocked SPE').length,
      clientBlockedCount: data.filter(record => record['Deployment Status'] === 'Blocked Outside SPE').length,
      mlReturnConstraintCount: data.filter(record => 
        record['Deployment Status'] === 'Avail_BenchRD' && 
        (record['Match 1']?.toLowerCase().includes('ml case') || 
         record['Match 2']?.toLowerCase().includes('ml case') || 
         record['Match 3']?.toLowerCase().includes('ml case'))
      ).length,
      highAgingCount: data.filter(record => 
        record['Deployment Status'] === 'Avail_BenchRD' && 
        Number(record['Aging']) > 90
      ).length,
      locationConstraintCount: data.filter(record => 
        record['Deployment Status'] === 'Avail_BenchRD' && 
        record['Location Constraint']?.toLowerCase() === 'yes'
      ).length
    };

    // Grade distribution
    const gradeDistribution = {};
    data.forEach(record => {
      const grade = record['Grade'];
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    // Aging analysis
    const agingData = data
      .filter(record => record['Deployment Status'] === 'Avail_BenchRD')
      .map(record => ({
        grade: record['Grade'],
        aging: Number(record['Aging']) || 0,
        benchRd: record['Bench/RD']
      }))
      .sort((a, b) => b.aging - a.aging)
      .slice(0, 10); // Top 10 highest aging records

    // Status distribution by grade
    const statusByGrade = {};
    data.forEach(record => {
      const grade = record['Grade'];
      const status = record['Deployment Status'];
      if (!statusByGrade[grade]) {
        statusByGrade[grade] = {};
      }
      statusByGrade[grade][status] = (statusByGrade[grade][status] || 0) + 1;
    });

    return {
      ...analytics,
      gradeDistribution,
      agingData,
      statusByGrade
    };
  };

  const analytics = calculateAnalytics();

  // Prepare chart data
  const benchRdData = [
    { name: 'Bench', value: analytics.benchCount, color: '#0088FE' },
    { name: 'RD', value: analytics.rdCount, color: '#00C49F' }
  ];

  const statusData = [
    { name: 'Available', value: analytics.availableCount, color: '#00C49F' },
    { name: 'Blocked SPE', value: analytics.blockedCount, color: '#FF8042' },
    { name: 'Client Blocked', value: analytics.clientBlockedCount, color: '#FFBB28' }
  ];

  const gradeData = Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
    name: grade,
    value: count
  }));

  const agingChartData = analytics.agingData.map(record => ({
    name: `${record.grade} (${record.benchRd})`,
    aging: record.aging
  }));

  const statusByGradeData = Object.entries(analytics.statusByGrade).map(([grade, statuses]) => ({
    grade,
    available: statuses['Avail_BenchRD'] || 0,
    blocked: statuses['Blocked SPE'] || 0,
    clientBlocked: statuses['Blocked Outside SPE'] || 0
  }));

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Typography variant="h5" gutterBottom sx={{ 
        flexShrink: 0,
        mb: 1
      }}>
        Analytics Dashboard
      </Typography>
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto'
      }}>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Records
              </Typography>
              <Typography variant="h4">
                {analytics.totalRecords}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available Resources
              </Typography>
              <Typography variant="h4" color="success.main">
                {analytics.availableCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ML Return Constraint
              </Typography>
              <Typography variant="h4" color="warning.main">
                {analytics.mlReturnConstraintCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Aging (>90 days)
              </Typography>
              <Typography variant="h4" color="error.main">
                {analytics.highAgingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Bench vs RD Distribution */}
        <Grid item xs={12} md={4} size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bench vs RD Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={benchRdData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {benchRdData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Deployment Status Distribution */}
        <Grid item xs={12} md={4} size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deployment Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status by Grade */}
        <Grid item xs={12} md={4} size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution by Grade
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusByGradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" stackId="a" fill="#00C49F" name="Available" />
                <Bar dataKey="blocked" stackId="a" fill="#FF8042" name="Blocked SPE" />
                <Bar dataKey="clientBlocked" stackId="a" fill="#FFBB28" name="Client Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Grade Distribution */}
        <Grid item xs={12} md={6} size={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Grade Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top 10 Highest Aging Records */}
        <Grid item xs={12} md={6} size={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Highest Aging Records
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="aging" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Key Insights */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Insights
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Resource Utilization
              </Typography>
              <Typography variant="body2" paragraph>
                {analytics.availableCount} out of {analytics.totalRecords} resources are available for deployment 
                ({((analytics.availableCount / analytics.totalRecords) * 100).toFixed(1)}% utilization rate).
              </Typography>
              
              <Typography variant="subtitle1" color="warning.main" gutterBottom>
                ML Return Constraints
              </Typography>
              <Typography variant="body2" paragraph>
                {analytics.mlReturnConstraintCount} resources have ML return constraints, 
                representing {((analytics.mlReturnConstraintCount / analytics.availableCount) * 100).toFixed(1)}% of available resources.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="error.main" gutterBottom>
                Aging Concerns
              </Typography>
              <Typography variant="body2" paragraph>
                {analytics.highAgingCount} resources have been on bench for over 90 days, 
                indicating potential resource allocation issues.
              </Typography>
              
              <Typography variant="subtitle1" color="info.main" gutterBottom>
                Location Constraints
              </Typography>
              <Typography variant="body2" paragraph>
                {analytics.locationConstraintCount} resources have location constraints, 
                which may limit their deployment options.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      </Box>
    </Box>
  );
};

export default Analytics;
