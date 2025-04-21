'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSession } from 'next-auth/react';

export default function LeaveRequestPage() {
  const { data: session, status } = useSession();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      setUserId(session.user.id);
    } else if (status === 'unauthenticated') {
      setError('You must be logged in to submit a leave request.');
    }
  }, [session, status]);

  const isValidDateRange = startDate && endDate && startDate < endDate;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !startDate || !endDate || !reason || !isValidDateRange) {
      setError('Please fill all fields correctly.');
      return;
    }

    const data = {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason,
    };

    try {
      const res = await fetch('/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.status === 200) {
        setSuccessMessage('Leave request submitted successfully!');
        setError('');
        setReason('');
        setStartDate(null);
        setEndDate(null);
      } else {
        setError(result.error || 'Something went wrong!');
      }
    } catch {
      setError('Something went wrong with the request.');
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        maxWidth: '1000px',
        mx: 'auto',
        my: 6,
        p: 6,
        borderRadius: 4,
      }}
    >
      <Typography variant="h3" fontWeight="bold" align="center" gutterBottom>
        Leave Request
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Submit your official leave request for approval.
      </Typography>

      {session?.user?.name && (
        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          Submitting as: <strong>{session.user.name}</strong>
        </Typography>
      )}

      <Divider sx={{ mb: 4 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Left side: Full height text area */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Reason for Leave"
              placeholder="Describe your reason in detail..."
              multiline
              minRows={12}
              maxRows={18}
              fullWidth
              required
              variant="outlined"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Grid>

          {/* Right side: Start & End date */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    disablePast
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="End Date & Time"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    disablePast
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!isValidDateRange || !userId}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                >
                  Submit Leave Request
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
