import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get('/api/prescriptions');
        setPrescriptions(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching prescriptions');
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Box mt={4}>
        <Alert severity="info">No prescriptions found. Upload your first prescription to get started.</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {prescriptions.map((prescription) => (
        <Grid item xs={12} sm={6} md={4} key={prescription._id}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={prescription.imageUrl}
              alt="Prescription"
            />
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="div">
                  {prescription.analysis.patientName}
                </Typography>
                <Chip
                  label={prescription.status}
                  color={prescription.status === 'analyzed' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Doctor: {prescription.analysis.doctorName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Date: {format(new Date(prescription.analysis.date), 'PPP')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Medications: {prescription.analysis.medications.length}
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate(`/analysis/${prescription._id}`)}
                >
                  View Analysis
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PrescriptionList; 