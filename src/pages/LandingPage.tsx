import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  styled,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';

const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  backgroundColor: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '12px',
  boxShadow: 'none',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const LandingPage = () => {
  return (
    <Box>
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom>
                Data powered insights & application management for all grant givers
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, fontSize: '1.125rem' }}
              >
                All grant givers deserve great technology. Brevio's powerful suite of solutions & non-profit data make it easy.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/demo"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Book a demo
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  Sign up for free
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/hero-illustration.svg"
                alt="Grant Management"
                sx={{ width: '100%', maxWidth: 600 }}
              />
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Build better grants and find highly aligned applicants instantly
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <InsightsIcon fontSize="large" color="primary" />,
                title: 'Insights & grant builder',
                description:
                  'Our user-guided journey delivers real insights while you build your criteria to help you identify the causes, beneficiary groups and outcomes in need of funding.',
              },
              {
                icon: <DesignServicesIcon fontSize="large" color="primary" />,
                title: 'Application designer',
                description:
                  'With our application designer you can create your own customized form sets, expertly aligned form in just a few clicks and add to any website or campaign email.',
              },
              {
                icon: <GroupIcon fontSize="large" color="primary" />,
                title: 'Applicant manager',
                description:
                  'Manage, filter and shortlist your potential applicants together in one place in just a few clicks.',
              },
              {
                icon: <SecurityIcon fontSize="large" color="primary" />,
                title: 'Instant due diligence',
                description:
                  'Receive instant and comprehensive due diligence reports to all non-profits who apply for your funding, with technology powered by our partner Spotlight.',
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 