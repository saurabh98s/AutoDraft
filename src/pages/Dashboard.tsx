import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  return (
    <Box sx={{ py: 4, flexGrow: 1, backgroundColor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Welcome to your dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Create New Grant
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Active Grants
              </Typography>
              <Typography color="text.secondary">
                You haven't created any grants yet. Click "Create New Grant" to get started.
              </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              <Typography color="text.secondary">
                No applications received yet.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Total Grants</Typography>
                <Typography variant="h6">0</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Active Applications</Typography>
                <Typography variant="h6">0</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Awarded Grants</Typography>
                <Typography variant="h6">0</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography paragraph color="text.secondary">
                Complete these steps to start managing your grants:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  Create your first grant
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  Set up your organization profile
                </Box>
                <Box component="li">
                  Invite team members
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 