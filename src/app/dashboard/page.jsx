'use client';
import { Typography, Box } from '@mui/material';
import DashboardOverview from './_sections/DashboardOverview';

export default function DashboardHomePage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Welcome to the Dashboard</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Use the sidebar to explore features.
      </Typography>
      <DashboardOverview />
    </Box>
  );
}
