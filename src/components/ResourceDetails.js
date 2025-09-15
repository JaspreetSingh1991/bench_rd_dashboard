import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';

const ResourceDetails = ({ open, onClose, data, title, filters }) => {
  if (!data || data.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>No data available for this selection.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Avail_BenchRD':
        return 'success';
      case 'Blocked SPE':
        return 'error';
      case 'Blocked Outside SPE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAgingColor = (aging) => {
    const age = Number(aging) || 0;
    if (age > 90) return 'error';
    if (age > 60) return 'warning';
    return 'success';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {filters && (
            <Box sx={{ mt: 1 }}>
              {Object.entries(filters).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'normal',
                  maxWidth: '200px',
                  overflowWrap: 'break-word'
                }}>Bench/RD</TableCell>
                <TableCell sx={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'normal',
                  maxWidth: '200px',
                  overflowWrap: 'break-word'
                }}>Grade</TableCell>
                <TableCell sx={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'normal',
                  maxWidth: '200px',
                  overflowWrap: 'break-word'
                }}>Match 1</TableCell>
                <TableCell sx={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'normal',
                  maxWidth: '200px',
                  overflowWrap: 'break-word'
                }}>Match 2</TableCell>
                <TableCell sx={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'normal',
                  maxWidth: '200px',
                  overflowWrap: 'break-word'
                }}>Location Constraint</TableCell>
                <TableCell sx={{ 
                  wordWrap: 'break-word', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'normal',
                  maxWidth: '200px',
                  overflowWrap: 'break-word'
                }}>Aging (days)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.sort((a, b) => {
                // Sort Bench first, then RD
                if (a['Bench/RD'] === 'Bench' && b['Bench/RD'] === 'RD') return -1;
                if (a['Bench/RD'] === 'RD' && b['Bench/RD'] === 'Bench') return 1;
                return 0;
              }).map((record, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    whiteSpace: 'normal',
                    maxWidth: '200px',
                    overflowWrap: 'break-word'
                  }}>{record['Bench/RD']}</TableCell>
                  <TableCell sx={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    whiteSpace: 'normal',
                    maxWidth: '200px',
                    overflowWrap: 'break-word'
                  }}>{record['Grade']}</TableCell>
                  <TableCell sx={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    whiteSpace: 'normal',
                    maxWidth: '200px',
                    overflowWrap: 'break-word'
                  }}>
                    {record['Match 1']?.toLowerCase().includes('ml case') ? (
                      <Chip label="ML Case" size="small" color="warning" />
                    ) : (
                      record['Match 1'] || '-'
                    )}
                  </TableCell>
                  <TableCell sx={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    whiteSpace: 'normal',
                    maxWidth: '200px',
                    overflowWrap: 'break-word'
                  }}>
                    {record['Match 2']?.toLowerCase().includes('ml case') ? (
                      <Chip label="ML Case" size="small" color="warning" />
                    ) : (
                      record['Match 2'] || '-'
                    )}
                  </TableCell>
                  <TableCell sx={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    whiteSpace: 'normal',
                    maxWidth: '200px',
                    overflowWrap: 'break-word'
                  }}>
                    {record['Location Constraint']?.toLowerCase() === 'yes' ? (
                      <Chip label="Yes" size="small" color="info" />
                    ) : (
                      record['Location Constraint'] || 'No'
                    )}
                  </TableCell>
                  <TableCell sx={{ 
                    wordWrap: 'break-word', 
                    wordBreak: 'break-word', 
                    whiteSpace: 'normal',
                    maxWidth: '200px',
                    overflowWrap: 'break-word'
                  }}>
                    <Chip
                      label={`${record['Aging'] || 0} days`}
                      size="small"
                      color={getAgingColor(record['Aging'])}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Records: {data.length}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourceDetails;
