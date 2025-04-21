'use client';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Link as MuiLink,
  CssBaseline,
  ThemeProvider,
  createTheme,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('light');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Load theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('themeMode') || 'light';
    setMode(storedTheme);
  }, []);

  // Theme configuration matching DashboardLayout
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 20px',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'box-shadow 0.3s ease',
          },
        },
      },
    },
  });

  // Toggle theme
  const handleThemeToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          background: mode === 'light'
            ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
            : 'linear-gradient(135deg, #1e1e1e 0%, #374151 100%)',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
            boxShadow: mode === 'light' ? '0 8px 24px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo/Title */}
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="primary"
            sx={{ mb: 2 }}
          >
            TeamTree
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'background.paper' },
              }}
              aria-describedby="email-error"
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { bgcolor: 'background.paper' },
              }}
              aria-describedby="password-error"
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
              <MuiLink
                href="#"
                variant="body2"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Forgot Password functionality coming soon!');
                }}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                <HelpOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                Forgot Password?
              </MuiLink>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

        
        </Paper>
      </Container>
    </ThemeProvider>
  );
}