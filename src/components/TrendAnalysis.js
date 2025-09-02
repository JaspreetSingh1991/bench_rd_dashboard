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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const TrendAnalysis = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No data available for trend analysis
        </Typography>
      </Paper>
    );
  }

  // Calculate trend data
  const calculateTrends = () => {
    // Aging trend analysis
    const agingTrends = data
      .filter(record => record['Deployment Status'] === 'Avail_BenchRD')
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
      if (!gradeEfficiency[grade]) {
        gradeEfficiency[grade] = {
          total: 0,
          available: 0,
          blocked: 0,
          clientBlocked: 0,
          mlConstraint: 0,
          highAging: 0
        };
      }
      
      gradeEfficiency[grade].total++;
      
      if (record['Deployment Status'] === 'Avail_BenchRD') {
        gradeEfficiency[grade].available++;
        
        // Check ML constraints
        if (record['Match 1']?.toLowerCase().includes('ml case') || 
            record['Match 2']?.toLowerCase().includes('ml case') || 
            record['Match 3']?.toLowerCase().includes('ml case')) {
          gradeEfficiency[grade].mlConstraint++;
        }
        
        // Check high aging
        if (Number(record['Aging']) > 90) {
          gradeEfficiency[grade].highAging++;
        }
      } else if (record['Deployment Status'] === 'Blocked SPE') {
        gradeEfficiency[grade].blocked++;
      } else if (record['Deployment Status'] === 'Blocked Outside SPE') {
        gradeEfficiency[grade].clientBlocked++;
      }
    });

    // Convert to chart data
    const gradeEfficiencyData = Object.entries(gradeEfficiency).map(([grade, stats]) => ({
      grade,
      utilization: Math.round((stats.available / stats.total) * 100),
      mlConstraintRate: Math.round((stats.mlConstraint / stats.total) * 100),
      highAgingRate: Math.round((stats.highAging / stats.total) * 100),
      blockedRate: Math.round((stats.blocked / stats.total) * 100)
    }));

    // Bench vs RD efficiency
    const benchRdEfficiency = data.reduce((acc, record) => {
      const type = record['Bench/RD'];
      if (!acc[type]) {
        acc[type] = { total: 0, available: 0, blocked: 0, clientBlocked: 0 };
      }
      
      acc[type].total++;
      
      if (record['Deployment Status'] === 'Avail_BenchRD') {
        acc[type].available++;
      } else if (record['Deployment Status'] === 'Blocked SPE') {
        acc[type].blocked++;
      } else if (record['Deployment Status'] === 'Blocked Outside SPE') {
        acc[type].clientBlocked++;
      }
      
      return acc;
    }, {});

    const benchRdData = Object.entries(benchRdEfficiency).map(([type, stats]) => ({
      type,
      utilization: Math.round((stats.available / stats.total) * 100),
      blockedRate: Math.round((stats.blocked / stats.total) * 100),
      clientBlockedRate: Math.round((stats.clientBlocked / stats.total) * 100)
    }));

    return {
      agingTrends: Object.values(agingTrends),
      gradeEfficiencyData,
      benchRdData
    };
  };

  const trends = calculateTrends();

  // Calculate insights
  const insights = {
    totalResources: data.length,
    availableResources: data.filter(r => r['Deployment Status'] === 'Avail_BenchRD').length,
    utilizationRate: Math.round((data.filter(r => r['Deployment Status'] === 'Avail_BenchRD').length / data.length) * 100),
    avgAging: Math.round(data.filter(r => r['Deployment Status'] === 'Avail_BenchRD')
      .reduce((sum, r) => sum + (Number(r['Aging']) || 0), 0) / 
      data.filter(r => r['Deployment Status'] === 'Avail_BenchRD').length || 0),
    highAgingCount: data.filter(r => r['Deployment Status'] === 'Avail_BenchRD' && Number(r['Aging']) > 90).length
  };

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
        Trend Analysis & Insights
      </Typography>
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto'
      }}>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Utilization
              </Typography>
              <Typography variant="h4" color="primary.main">
                {insights.utilizationRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Aging
              </Typography>
              <Typography variant="h4" color="info.main">
                {insights.avgAging} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Aging Resources
              </Typography>
              <Typography variant="h4" color="error.main">
                {insights.highAgingCount}
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
                {insights.availableResources}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Aging Distribution */}
        <Grid item xs={12} md={4} size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aging Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.agingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Resources" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Grade Efficiency */}
        <Grid item xs={12} md={4} size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Grade Utilization Rates
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.gradeEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#00C49F" name="Utilization %" />
                <Bar dataKey="mlConstraintRate" fill="#FFBB28" name="ML Constraint %" />
                <Bar dataKey="highAgingRate" fill="#FF8042" name="High Aging %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bench vs RD Efficiency */}
        <Grid item xs={12} md={4} size={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bench vs RD Efficiency Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.benchRdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#00C49F" name="Utilization %" />
                <Bar dataKey="blockedRate" fill="#FF8042" name="Blocked %" />
                <Bar dataKey="clientBlockedRate" fill="#FFBB28" name="Client Blocked %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recommendations & Action Items
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="error.main" gutterBottom>
                ⚠️ High Priority Actions
              </Typography>
              <ul>
                {insights.highAgingCount > 0 && (
                  <li>
                    <Typography variant="body2">
                      <strong>{insights.highAgingCount} resources</strong> have been on bench for over 90 days. 
                      Consider reassignment or upskilling initiatives.
                    </Typography>
                  </li>
                )}
                {insights.utilizationRate < 70 && (
                  <li>
                    <Typography variant="body2">
                      Utilization rate is <strong>{insights.utilizationRate}%</strong>. 
                      Focus on improving resource allocation and reducing bench time.
                    </Typography>
                  </li>
                )}
              </ul>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="success.main" gutterBottom>
                ✅ Optimization Opportunities
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    <strong>{insights.availableResources} resources</strong> are available for immediate deployment.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Average aging of <strong>{insights.avgAging} days</strong> indicates moderate resource turnover.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Consider implementing automated resource matching to reduce aging.
                  </Typography>
                </li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      </Box>
    </Box>
  );
};

export default TrendAnalysis;
