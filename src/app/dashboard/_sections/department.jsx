'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, Button, Alert, TextField, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function DepartmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          // Fetch employees
          const employeeRes = await fetch('/api/admin/employees');
          if (!employeeRes.ok) throw new Error('Failed to fetch employees');
          const employeeData = await employeeRes.json();
          setEmployees(employeeData.employees);

          // Fetch departments for the edit form
          const deptRes = await fetch('/api/departments');
          if (!deptRes.ok) throw new Error('Failed to fetch departments');
          const deptData = await deptRes.json();
          setDepartments(deptData);

          setError(null);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchData();
    }
  }, [status, session, router]);

  const handleEdit = (employee) => {
    setEditingEmployee({ ...employee });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (employeeId) => {
    try {
      const res = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEmployee),
      });
      if (!res.ok) throw new Error('Failed to update employee');
      const updatedEmployee = await res.json();

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? { ...emp, ...updatedEmployee } : emp))
      );
      setEditingEmployee(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete employee');
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  if (status === 'loading') return <Typography>Loading...</Typography>;
  if (!session || session.user.role !== 'ADMIN') return <Typography variant="h6" color="error" sx={{ p: 4 }}>Unauthorized</Typography>;

  return (
    <Box sx={{ padding: 4, maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Employee List by Department
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Pending Leave Requests</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                {editingEmployee?.id === employee.id ? (
                  <TextField
                    name="name"
                    value={editingEmployee.name}
                    onChange={handleEditChange}
                    size="small"
                  />
                ) : (
                  employee.name
                )}
              </TableCell>
              <TableCell>
                {editingEmployee?.id === employee.id ? (
                  <TextField
                    name="email"
                    value={editingEmployee.email}
                    onChange={handleEditChange}
                    size="small"
                  />
                ) : (
                  employee.email
                )}
              </TableCell>
              <TableCell>
                {editingEmployee?.id === employee.id ? (
                  <TextField
                    select
                    name="role"
                    value={editingEmployee.role}
                    onChange={handleEditChange}
                    size="small"
                  >
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                  </TextField>
                ) : (
                  employee.role
                )}
              </TableCell>
              <TableCell>
                {editingEmployee?.id === employee.id ? (
                  <TextField
                    select
                    name="departmentId"
                    value={editingEmployee.departmentId}
                    onChange={handleEditChange}
                    size="small"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  employee.department?.name || 'No Department'
                )}
              </TableCell>
              <TableCell>
                {employee.leaves.filter((leave) => leave.status === 'PENDING').length > 0 ? (
                  <p className={`/admin/leaves?userId=${employee.id}`}>
                    {employee.leaves.filter((leave) => leave.status === 'PENDING').length} Pending
                  </p>
                ) : (
                  'None'
                )}
              </TableCell>
              <TableCell>
                {editingEmployee?.id === employee.id ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEditSubmit(employee.id)}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setEditingEmployee(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(employee)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ ml: 1 }}
                      onClick={() => handleDeleteClick(employee)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {employeeToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}