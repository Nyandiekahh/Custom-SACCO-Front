import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  MenuRounded,
  NotificationsRounded,
  AccountCircleRounded,
  LogoutRounded,
  PersonRounded,
  SettingsRounded,
  DashboardRounded
} from '@mui/icons-material';

import { useAuthContext } from '../../../context/AuthContext';
import { useMobile } from '../../../hooks/useMobile';
import { APP_NAME } from '../../../utils/constants';
import NotificationBell from '../../notifications/NotificationBell';

const Header = ({ onMenuClick, drawerOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useMobile();
  const { user, logout, getUserDisplayName, getUserInitials } = useAuthContext();
  
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const profileMenuOpen = Boolean(profileMenuAnchor);

  const handleProfileMenuClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleProfileMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    handleProfileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            color: theme.palette.primary.main
          }}
        >
          <MenuRounded />
        </IconButton>

        {/* App Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <DashboardRounded 
            sx={{ 
              mr: 1, 
              color: theme.palette.primary.main,
              display: { xs: 'none', sm: 'block' }
            }} 
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {isMobile ? 'KMS SACCO' : APP_NAME}
          </Typography>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleProfileMenuClick}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={profileMenuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen ? 'true' : undefined}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {getUserInitials}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Menu
            anchorEl={profileMenuAnchor}
            id="account-menu"
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 28,
                  height: 28,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {getUserDisplayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }}
              >
                {user?.user_type?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </Typography>
            </Box>

            {/* Menu Items */}
            <MenuItem onClick={handleDashboardClick}>
              <DashboardRounded fontSize="small" sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            
            <MenuItem onClick={handleProfileClick}>
              <PersonRounded fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            
            <MenuItem onClick={handleProfileClick}>
              <SettingsRounded fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                color: theme.palette.error.main,
                borderTop: `1px solid ${theme.palette.divider}`,
                mt: 1
              }}
            >
              <LogoutRounded fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;