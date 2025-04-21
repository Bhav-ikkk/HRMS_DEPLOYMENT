"use client";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Fade,
} from "@mui/material";
import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  boxShadow: `0 8px 24px ${theme.palette.grey[300]}`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: "none",
  borderRadius: theme.shape.borderRadius * 1.5,
  background: theme.palette.primary.gradient || theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${theme.palette.primary.light}`,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 1.2,
    transition: "all 0.3s ease",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.light,
      },
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 8px ${theme.palette.primary.light}`,
      },
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 1.2,
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.light,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 8px ${theme.palette.primary.light}`,
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

export default function CreateEmployeePage() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    departmentId: "",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("User created!");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        departmentId: "",
      });
    } else {
      const err = await res.json();
      alert("Error: " + err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 6 }}>
      <Fade in timeout={600}>
        <StyledPaper elevation={0}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "text.primary",
              textAlign: "center",
              mb: 3,
            }}
          >
            Create New Member
          </Typography>
          <Divider sx={{ mb: 4, bgcolor: "grey.200" }} />
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <StyledTextField
              name="name"
              label="Full Name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="name"
            />
            <StyledTextField
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="email"
            />
            <StyledTextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="new-password"
            />
            <StyledFormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                label="Role"
                variant="outlined"
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </StyledFormControl>
            <StyledFormControl fullWidth margin="normal">
              <InputLabel id="department-label">Department</InputLabel>
              <Select
                labelId="department-label"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                label="Department"
                variant="outlined"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            <Box sx={{ mt: 4 }}>
              <StyledButton
                type="submit"
                variant="contained"
                fullWidth
                size="large"
              >
                Create Member
              </StyledButton>
            </Box>
          </Box>
        </StyledPaper>
      </Fade>
    </Container>
  );
}