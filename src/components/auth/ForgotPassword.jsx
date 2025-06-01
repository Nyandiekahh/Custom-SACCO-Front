import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  LockResetRounded,
  EmailRounded,
  ArrowBackRounded,
  SendRounded
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { APP_NAME } from '../../utils/constants';

// Validation schema
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
});

const ForgotPassword = () => {
  const theme = useTheme();
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call your API
      // await apiService.forgotPassword(data.email);
      
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would call your API
      // await apiService.forgotPassword(email);
      
      toast.success('Reset email resent!');
    } catch (error) {
      toast.error('Failed to resend email');
    } finally {
      setLoading(false);
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
          maxWidth: 450,
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
          <LockResetRounded sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {APP_NAME}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {!emailSent ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Email Field */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      placeholder="Enter your email address"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailRounded />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                      autoComplete="email"
                      autoFocus
                    />
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <SendRounded />}
                  sx={{
                    py: 1.5,
                    mb: 3,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                {/* Back to Login */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component={Link}
                    to="/login"
                    startIcon={<ArrowBackRounded />}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <>
              {/* Success State */}
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Email Sent Successfully!
                </Typography>
                <Typography variant="body2">
                  We've sent a password reset link to <strong>{getValues('email')}</strong>. 
                  Please check your email and follow the instructions to reset your password.
                </Typography>
              </Alert>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Didn't receive the email? Check your spam folder or try again.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button
                  variant="outlined"
                  onClick={handleResendEmail}
                  disabled={loading}
                  startIcon={<SendRounded />}
                >
                  {loading ? 'Resending...' : 'Resend Email'}
                </Button>

                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  startIcon={<ArrowBackRounded />}
                >
                  Back to Login
                </Button>
              </Box>
            </>
          )}
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
            Remember your password?{' '}
            <Link
              to="/login"
              style={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default ForgotPassword;