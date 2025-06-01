import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography, useTheme } from '@mui/material';

import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME, USER_TYPES } from '../../utils/constants';

// Dashboard components
import SuperAdminDashboard from '../../components/dashboard/SuperAdminDashboard';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import MemberDashboard from '../../components/dashboard/MemberDashboard';
import LoadingSpinner from '../../components/common/UI/LoadingSpinner';

const DashboardPage = () => {
  const theme = useTheme();
  const { user, loading, getUserDisplayName } = useAuthContext();

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const renderDashboard = () => {
    switch (user?.user_type) {
      case USER_TYPES.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case USER_TYPES.ADMIN:
        return <AdminDashboard />;
      case USER_TYPES.MEMBER:
        return <MemberDashboard />;
      case USER_TYPES.NON_MEMBER:
        return <MemberDashboard />; // Non-members get a limited version
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Unknown user type. Please contact support.
            </Typography>
          </Box>
        );
    }
  };

  const getDashboardTitle = () => {
    switch (user?.user_type) {
      case USER_TYPES.SUPER_ADMIN:
        return 'Super Admin Dashboard';
      case USER_TYPES.ADMIN:
        return 'Admin Dashboard';
      case USER_TYPES.MEMBER:
        return 'Member Dashboard';
      case USER_TYPES.NON_MEMBER:
        return 'Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      <Helmet>
        <title>{getDashboardTitle()} - {APP_NAME}</title>
        <meta name="description" content={`${getDashboardTitle()} for ${getUserDisplayName}`} />
      </Helmet>

      <Box>
        {/* Welcome Header */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            Welcome back, {user?.first_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your SACCO today.
          </Typography>
        </Box>

        {/* Dashboard Content */}
        {renderDashboard()}
      </Box>
    </>
  );
};

export default DashboardPage;