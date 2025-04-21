'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Stack, Divider
} from '@mui/material';
import { useSession } from 'next-auth/react';

export default function LeavePanel() {
  const { data: session, status } = useSession();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null); // 👈 For detail dialog

  const isAdmin = session?.user?.role === 'ADMIN';

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/leave/all');
      if (!res.ok) throw new Error('Failed to fetch leave requests');
      const data = await res.json();

      const filtered = isAdmin
        ? data
        : data.filter((req) => req.user?.email === session?.user?.email);

      setLeaveRequests(filtered);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/leave/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchLeaves();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchLeaves();
  }, [status]);

  const formatDate = (date) => new Date(date).toISOString().split('T')[0];

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Leave Requests
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TableContainer sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                {isAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
              {leaveRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {req.user?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {req.user?.email || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{req.user?.department?.name || 'N/A'}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>{formatDate(req.startDate)}</TableCell>
                  <TableCell>{formatDate(req.endDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={req.status}
                      color={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={1}>
                        <Button
                          onClick={() => updateStatus(req.id, 'APPROVED')}
                          color="success"
                          variant="contained"
                          size="small"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateStatus(req.id, 'REJECTED')}
                          color="error"
                          variant="contained"
                          size="small"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => updateStatus(req.id, 'PENDING')}
                          color="warning"
                          variant="contained"
                          size="small"
                        >
                          Pending
                        </Button>
                        <Button
                          onClick={() => setSelectedRequest(req)}
                          color="info"
                          variant="outlined"
                          size="small"
                        >
                          View Report
                        </Button>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 🧾 Dialog for Leave Report */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Leave Request Report</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography><strong>Employee:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</Typography>
              <Typography><strong>Department:</strong> {selectedRequest.user?.department?.name || 'N/A'}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Reason:</strong></Typography>
              <Typography>{selectedRequest.reason}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography><strong>Start Date:</strong> {formatDate(selectedRequest.startDate)}</Typography>
              <Typography><strong>End Date:</strong> {formatDate(selectedRequest.endDate)}</Typography>
              <Typography><strong>Status:</strong> {selectedRequest.status}</Typography>
              <Typography sx={{ mt: 2, fontStyle: 'italic' }} color="text.secondary">
                Requested on: {formatDate(selectedRequest.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
