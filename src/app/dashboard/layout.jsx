'use client';

import { useSession, signOut } from 'next-auth/react';
import { useMemo, useState, useEffect } from 'react';
import { defineAbilitiesFor } from '../lib/ability';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  CssBaseline,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
  Switch,
  useTheme,
  ThemeProvider,
  createTheme,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import EmployeeIcon from '@mui/icons-material/VerifiedUser';
import DeptIcon from '@mui/icons-material/WorkspacesFilled';
import TimeIcon from '@mui/icons-material/Timelapse';
import RequestIcon from '@mui/icons-material/RequestQuote';
import StatusIcon from '@mui/icons-material/Approval';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const [mode, setMode] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('themeMode') || 'light';
    setMode(storedTheme);
  }, []);

  const ability = useMemo(() => defineAbilitiesFor(session?.user?.role || 'guest'), [session]);

  const toggleDrawer = () => setOpen(!open);

  const handleThemeToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const handleLogout = async () => {
    setAnchorEl(null); // Close the menu
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

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
    }), [mode]);

  const navigation = [
    {
      href: '/dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
    },
    ability.can('manage', 'Users') && {
      href: '/dashboard/employee',
      title: 'Employee',
      icon: <EmployeeIcon />,
    },
    ability.can('manage', 'Department') && {
      href: '/dashboard/department',
      title: 'Department',
      icon: <DeptIcon />,
    },
    ability.can('view', 'OwnTime') && {
      href: '/dashboard/time_status',
      title: 'Working Status',
      icon: <TimeIcon />,
    },
    ability.can('request', 'Leave') && {
      href: '/dashboard/leave_request',
      title: 'Leave Request',
      icon: <RequestIcon />,
    },
    ability.can('view', 'LeaveStatus') && {
      href: '/dashboard/approve',
      title: 'Leave Status',
      icon: <StatusIcon />,
    },
  ].filter(Boolean);

  if (status === 'loading') return <Typography>Loading...</Typography>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* App Bar */}
        <AppBar position="fixed" sx={{ zIndex: 1201 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={toggleDrawer} edge="start">
                {open ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
              <Typography variant="h6" sx={{ ml: 1 }}>
                Dashboard
              </Typography>
            </Box>

            <Box>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>

              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar>{session?.user?.name?.[0]}</Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem disabled>
                  {session.user.name} ({session.user.role})
                </MenuItem>
                <MenuItem onClick={handleThemeToggle}>
                  Theme: {mode === 'light' ? 'Light' : 'Dark'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : 64,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : 64,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              mt: '64px',
            },
          }}
        >
          <List>
            {navigation.map((item) => (
              <Tooltip key={item.title} title={open ? '' : item.title} placement="right" arrow>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={pathname === item.href}
                    sx={{ pl: open ? 2 : 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: open ? 40 : 32 }}>{item.icon}</ListItemIcon>
                    {open && <ListItemText primary={item.title} />}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {/* Welcome, {session?.user?.name} ({session?.user?.role}) */}
          </Typography>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}