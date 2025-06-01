import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuthContext } from '../../../context/AuthContext';
import { useMobile } from '../../../hooks/useMobile';

// Layout components
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const DRAWER_WIDTH = 280;
const MOBILE_DRAWER_WIDTH = 280;

const Layout = () => {
  const theme = useTheme();
  const { isMobile } = useMobile();
  const { user } = useAuthContext();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(true);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopDrawerOpen(!desktopDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header
        onMenuClick={isMobile ? handleMobileDrawerToggle : handleDesktopDrawerToggle}
        drawerOpen={isMobile ? mobileDrawerOpen : desktopDrawerOpen}
      />

      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Sidebar
          open={desktopDrawerOpen}
          variant="persistent"
          width={DRAWER_WIDTH}
        />
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerClose}
          width={MOBILE_DRAWER_WIDTH}
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          marginLeft: !isMobile && desktopDrawerOpen ? 0 : 0,
          width: {
            xs: '100%',
            md: !isMobile && desktopDrawerOpen 
              ? `calc(100% - ${DRAWER_WIDTH}px)` 
              : '100%'
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Header Spacer */}
        <Box sx={{ height: { xs: 56, sm: 64 } }} />
        
        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: theme.palette.background.default,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;