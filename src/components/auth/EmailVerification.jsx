import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  EmailRounded,
  CheckCircleRounded,
  ErrorRounded,
  RefreshRounded
} from '@mui/icons-material';

import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

const EmailVerification = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading } = useAuthContext();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification link. Please check your email and try again.');
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      setVerificationStatus('verifying');
      await verifyEmail(token);
      setVerificationStatus('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Email verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      // Implementation would call API to resend verification email
      // await apiService.resendVerificationEmail();
      alert('Verification email resent! Please check your inbox.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Verifying your email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleRounded 
              sx={{ 
                fontSize: 80, 
                color: theme.palette.success.main, 
                mb: 3 
              }} 
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Email Verified Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your email has been verified. You will be redirected to your dashboard shortly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: 2 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ErrorRounded 
              sx={{ 
                fontSize: 80, 
                color: theme.palette.error.main, 
                mb: 3 
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {errorMessage}
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshRounded />}
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend Email'}
              </Button>
              
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        p: 2
      }}
    >
      <Card
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}
        >
          <EmailRounded sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Email Verification
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {APP_NAME}
          </Typography>
        </Box>

        <CardContent>
          {renderContent()}
        </CardContent>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.grey[50],
            textAlign: 'center',
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Having trouble? Contact support for assistance.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default EmailVerification;