import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { useAuthContext } from '../../context/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = null, requireEmailVerification = false }) => {
  const { user, loading, isAuthenticated, isEmailVerified } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Email Verification Required
          </Typography>
          <Typography>
            Please verify your email address to access this page. Check your inbox for the verification link.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.user_type)) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Check if user account is active
  if (!user?.is_active) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Account Inactive
          </Typography>
          <Typography>
            Your account is currently inactive. Please contact your administrator to activate your account.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;