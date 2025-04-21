'use client';

import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  AssignmentTurnedIn as ApprovalsIcon,
  PendingActions as PendingIcon,
  Workspaces as DeptIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

// ✅ Simulated Auth Hook (replace with real one if using NextAuth)
const useAuth = () => ({
  user: { id: '1', role: 'EMPLOYEE' }, // Replace with real session user
});

export default function DashboardOverview() {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/dashboard/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();

        setStats([
          {
            title: user.role === 'ADMIN' ? 'Logged-in Users' : 'Your Sessions',
            value: data.loggedInUsers,
            icon: <PeopleIcon />,
            color: 'primary.main',
          },
          {
            title: user.role === 'ADMIN' ? 'Leaves Requested Today' : 'Your Leaves Today',
            value: data.leavesRequestedToday,
            icon: <ApprovalsIcon />,
            color: 'secondary.main',
          },
          {
            title: user.role === 'ADMIN' ? 'Pending Approvals' : 'Your Pending Leaves',
            value: data.pendingApprovals,
            icon: <PendingIcon />,
            color: 'warning.main',
          },
          {
            title: 'Departments',
            value: data.departments,
            icon: <DeptIcon />,
            color: 'info.main',
          },
        ]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Overview
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
            ))
          : stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 4,
                    background:
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, #fff, #f0f4ff)'
                        : 'linear-gradient(135deg, #1f1f1f, #2a2a2a)',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette[stat.color.split('.')[0]].main,
                      color: '#fff',
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}
