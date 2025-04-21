'use client';

import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  useTheme,
  Skeleton,
  Divider,
  Fade,
} from '@mui/material';
import {
  People as PeopleIcon,
  AssignmentTurnedIn as ApprovalsIcon,
  PendingActions as PendingIcon,
  Workspaces as DeptIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
  boxShadow: `0 6px 20px ${theme.palette.grey[200]}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${theme.palette.grey[300]}`,
    background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.grey[200],
  height: 120,
}));

export default function DashboardOverview() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const url = `/api/dashboard/${session.user.id}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? 'Access denied: You can only view your own dashboard'
              : 'Failed to fetch stats'
          );
        }
        const data = await response.json();

        const isSummary = data.summary || false;

        setStats([
          {
            title: isSummary ? 'Total Logged-in Users' : 'Your Sessions',
            value: data.loggedInUsers,
            icon: <PeopleIcon fontSize="large" />,
            color: 'primary.main',
          },
          {
            title: isSummary ? 'Total Leaves Requested Today' : 'Your Leaves Today',
            value: data.leavesRequestedToday,
            icon: <ApprovalsIcon fontSize="large" />,
            color: 'secondary.main',
          },
          {
            title: isSummary ? 'Total Pending Approvals' : 'Your Pending Leaves',
            value: data.pendingApprovals,
            icon: <PendingIcon fontSize="large" />,
            color: 'warning.main',
          },
          {
            title: isSummary ? 'Total Departments' : 'Departments',
            value: data.departments,
            icon: <DeptIcon fontSize="large" />,
            color: 'info.main',
          },
        ]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchStats();
    }
  }, [status, session]);

  if (status === 'loading') {
    return <StyledSkeleton variant="rectangular" />;
  }

  if (status === 'unauthenticated') {
    return (
      <Fade in timeout={600}>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', mt: 4 }}
        >
          Please log in to view your dashboard.
        </Typography>
      </Fade>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 2,
              color: 'text.primary',
              textAlign: 'left',
            }}
          >
            {session?.user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Employee Dashboard'}
          </Typography>
          <Divider sx={{ mb: 4, bgcolor: 'grey.200' }} />
          {error && (
            <Typography
              color="error"
              variant="body1"
              sx={{ mb: 3, textAlign: 'center' }}
            >
              Error: {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(4)).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <StyledSkeleton variant="rectangular" />
                  </Grid>
                ))
              : stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <StyledPaper elevation={0}>
                      <StyledAvatar
                        sx={{
                          bgcolor: theme.palette[stat.color.split('.')[0]].main,
                        }}
                      >
                        {stat.icon}
                      </StyledAvatar>
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color="text.primary"
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {stat.title}
                        </Typography>
                      </Box>
                    </StyledPaper>
                  </Grid>
                ))}
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
}