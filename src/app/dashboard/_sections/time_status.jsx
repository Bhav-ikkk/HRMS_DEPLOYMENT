'use client';
import * as React from 'react';
import {
  Stack, Typography, TextField, MenuItem, Card,
  CardContent, CircularProgress, Divider, Box,
  ToggleButtonGroup, ToggleButton, Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useSession, signOut } from 'next-auth/react';

const getDateKey = (date) => new Date(date).toLocaleDateString();

export default function TimeStatusPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState('chart');
  const [employeeFilter, setEmployeeFilter] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const { data: session, status } = useSession();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/traces', {
          cache: 'no-store',
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch trace data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Calling /api/logout for user:', session.user.id);
      try {
        const res = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: session.user.id }),
        });

        const result = await res.json();
        console.log('Logout API response:', result);

        if (!res.ok) {
          console.error('Logout API failed with status:', res.status);
        }
      } catch (err) {
        console.error('Logout API error:', err);
      }
    } else {
      console.warn('Session or user ID not available');
    }

    await signOut({ callbackUrl: '/login' });
  };

  const filteredData = data.filter((log) => {
    const loginDate = getDateKey(log.loginAt);
    return (
      (!employeeFilter || log.user.name.toLowerCase().includes(employeeFilter.toLowerCase())) &&
      (!dateFilter || loginDate === getDateKey(dateFilter))
    );
  });

  const sessionMap = {};
  const employeeSet = new Set();
  const dateSet = new Set();

  filteredData.forEach(({ user, loginAt, logoutAt }) => {
    const date = getDateKey(loginAt);
    const key = `${user.name} - ${date}`;
    employeeSet.add(user.name);
    dateSet.add(date);

    const hours = logoutAt ? (new Date(logoutAt) - new Date(loginAt)) / 1000 / 60 / 60 : 0;

    if (!sessionMap[key]) {
      sessionMap[key] = {
        order: key,
        sessions: 0,
        totalHours: 0,
        name: user.name,
        email: user.email,
        date,
      };
    }

    sessionMap[key].sessions += 1;
    sessionMap[key].totalHours += hours;
  });

  const chartData = Object.values(sessionMap);

  const allEmployees = Array.from(employeeSet).sort();
  const allDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));

  const getHeatColor = (hours) => {
    if (hours === 0) return '#eeeeee';
    if (hours < 1) return '#c8e6c9';
    if (hours < 3) return '#81c784';
    if (hours < 6) return '#4caf50';
    return '#2e7d32';
  };

  const handleViewChange = (_, newView) => {
    if (newView) setViewMode(newView);
  };

  const chartSettings = {
    dataset: chartData,
    xAxis: [{ scaleType: 'band', dataKey: 'order' }],
    height: 400,
    borderRadius: 8,
    series: [
      {
        dataKey: 'sessions',
        label: 'Sessions',
        stack: 'attendance',
        color: '#1976d2',
      },
      {
        dataKey: 'totalHours',
        label: 'Total Hours',
        stack: 'attendance',
        color: '#2e7d32',
      },
    ],
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'bottom', horizontal: 'middle' },
      },
    },
    sx: {
      [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
        transform: 'translateX(-10px)',
      },
    },
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'loginAt', headerName: 'Login At', flex: 1.5 },
    { field: 'logoutAt', headerName: 'Logout At', flex: 1.5 },
    { field: 'duration', headerName: 'Duration (hrs)', flex: 1 },
  ];

  const rows = filteredData.map((log, index) => {
    const duration = log.logoutAt
      ? ((new Date(log.logoutAt) - new Date(log.loginAt)) / 1000 / 60 / 60).toFixed(2)
      : 'Active';

    return {
      id: index,
      name: log.user.name,
      email: log.user.email,
      loginAt: new Date(log.loginAt).toLocaleString(),
      logoutAt: log.logoutAt ? new Date(log.logoutAt).toLocaleString() : 'Active',
      duration,
    };
  });

  return (
    <Stack spacing={4} sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={600}>Employee Time Insights</Typography>
      <Divider />

      {/* Filter Bar */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Search Employee"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Filter by Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="chart">Chart</ToggleButton>
          <ToggleButton value="heatmap">Heatmap</ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          disabled={status !== 'authenticated'}
          sx={{ ml: 'auto' }}
        >
          Logout
        </Button>
      </Stack>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h6">Stacked Bar Chart</Typography>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <BarChart {...chartSettings} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Heatmap View */}
      {viewMode === 'heatmap' && (
        <Card elevation={4}>
          <CardContent>
            <Typography variant="h6">Attendance Heatmap</Typography>
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Employee</th>
                    {allDates.map((date) => (
                      <th key={date} style={{ padding: 8 }}>{date}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEmployees.map((emp) => (
                    <tr key={emp}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{emp}</td>
                      {allDates.map((date) => {
                        const match = sessionMap[`${emp} - ${date}`];
                        const hours = match?.totalHours || 0;
                        return (
                          <td
                            key={`${emp}-${date}`}
                            title={`${hours.toFixed(2)} hrs`}
                            style={{
                              backgroundColor: getHeatColor(hours),
                              textAlign: 'center',
                              padding: '8px',
                              color: hours > 0 ? '#fff' : '#888',
                              fontWeight: 500,
                              minWidth: 60,
                            }}
                          >
                            {hours > 0 ? `${hours.toFixed(1)}` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Full Table of Sessions */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Detailed Logs</Typography>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableRowSelectionOnClick
            />
          </div>
        </CardContent>
      </Card>
    </Stack>
  );
}