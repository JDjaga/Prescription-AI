import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

const AnalysisReport = () => {
  const { prescriptionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`/api/analysis/${prescriptionId}`);
        setReport(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching analysis report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [prescriptionId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">No report data available</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1" gutterBottom>
                Prescription Analysis Report
              </Typography>
              <Chip
                label={report.status}
                color={report.status === 'analyzed' ? 'success' : 'warning'}
              />
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              Generated on {format(new Date(report.createdAt), 'PPP')}
            </Typography>
          </Grid>

          {/* Prescription Image */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Prescription Image
              </Typography>
              <Box
                component="img"
                src={report.imageUrl}
                alt="Prescription"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1
                }}
              />
            </Paper>
          </Grid>

          {/* Analysis Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Patient Name"
                    secondary={report.analysis.patientName}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Doctor Name"
                    secondary={report.analysis.doctorName}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Date"
                    secondary={report.analysis.date}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Medications */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Medications ({report.insights.medicationCount})
              </Typography>
              <List>
                {report.analysis.medications.map((med, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={med.name}
                        secondary={`${med.dosage} - ${med.frequency}`}
                      />
                    </ListItem>
                    {index < report.analysis.medications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Instructions and Notes */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body1">
                {report.analysis.instructions}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              <Typography variant="body1">
                {report.analysis.additionalNotes}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AnalysisReport; 