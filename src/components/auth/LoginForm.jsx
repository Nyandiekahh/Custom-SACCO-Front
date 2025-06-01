import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  VisibilityRounded,
  VisibilityOffRounded,
  LoginRounded,
  EmailRounded,
  PhoneRounded,
  PersonRounded
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

// Validation schema
const loginSchema = yup.object().shape({
  login: yup
    .string()
    .required('Email, username, or phone number is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthContext();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('email'); // 'email', 'username', 'phone'

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      login: '',
      password: ''
    }
  });

  const loginValue = watch('login');

  // Auto-detect login type based on input
  React.useEffect(() => {
    if (loginValue) {
      if (loginValue.includes('@')) {
        setLoginType('email');
      } else if (/^\+?[0-9]/.test(loginValue)) {
        setLoginType('phone');
      } else {
        setLoginType('username');
      }
    }
  }, [loginValue]);

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      
      // Set form errors based on the error message
      if (errorMessage.toLowerCase().includes('email')) {
        setError('login', { message: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('password', { message: errorMessage });
      } else {
        setError('login', { message: errorMessage });
      }
    }
  };

  const getLoginIcon = () => {
    switch (loginType) {
      case 'email':
        return <EmailRounded />;
      case 'phone':
        return <PhoneRounded />;
      default:
        return <PersonRounded />;
    }
  };

  const getLoginPlaceholder = () => {
    switch (loginType) {
      case 'email':
        return 'Enter your email address';
      case 'phone':
        return 'Enter your phone number';
      default:
        return 'Enter your username';
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
          maxWidth: 420,
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
          <LoginRounded sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Sign in to {APP_NAME}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Redirect message */}
          {location.state?.from && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please sign in to access the requested page.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Login Field */}
            <Controller
              name="login"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email, Username, or Phone"
                  placeholder={getLoginPlaceholder()}
                  error={!!errors.login}
                  helperText={errors.login?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {getLoginIcon()}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                  autoComplete="username"
                  autoFocus
                />
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                  autoComplete="current-password"
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
              startIcon={loading ? <CircularProgress size={20} /> : <LoginRounded />}
              sx={{
                py: 1.5,
                mb: 2,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link
                to="/forgot-password"
                style={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Forgot your password?
              </Link>
            </Box>
          </Box>
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
            © 2024 {APP_NAME}. All rights reserved.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginForm;