// src/components/profile/ChangePassword.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  VisibilityRounded,
  VisibilityOffRounded,
  LockRounded,
  SecurityRounded,
  CheckRounded,
  CloseRounded
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';

// Password validation schema
const passwordSchema = yup.object().shape({
  current_password: yup
    .string()
    .required('Current password is required'),
  new_password: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('new_password')], 'Passwords must match')
});

const ChangePassword = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  });

  const newPassword = watch('new_password');

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    Object.values(checks).forEach(check => {
      if (check) score += 20;
    });

    return { score, checks };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const getStrengthColor = (score) => {
    if (score < 40) return 'error';
    if (score < 60) return 'warning';
    if (score < 80) return 'info';
    return 'success';
  };

  const getStrengthText = (score) => {
    if (score < 40) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => apiService.post('/auth/change-password/', data),
    onSuccess: () => {
      setSuccess(true);
      toast.success('Password changed successfully!');
      reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password');
    }
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityRounded sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Change Password
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your password has been changed successfully! For security reasons, you may need to log in again on other devices.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Current Password */}
          <Grid item xs={12}>
            <Controller
              name="current_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  placeholder="Enter your current password"
                  error={!!errors.current_password}
                  helperText={errors.current_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRounded />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* New Password */}
          <Grid item xs={12}>
            <Controller
              name="new_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="Enter your new password"
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRounded />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Password Strength Indicator */}
            {newPassword && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Password Strength:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={`${getStrengthColor(passwordStrength.score)}.main`}
                    sx={{ fontWeight: 600 }}
                  >
                    {getStrengthText(passwordStrength.score)}
                  </Typography>
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  color={getStrengthColor(passwordStrength.score)}
                  sx={{ height: 6, borderRadius: 3, mb: 2 }}
                />

                {/* Password Requirements */}
                <List dense sx={{ 
                  bgcolor: 'grey.50', 
                  borderRadius: 1, 
                  py: 1,
                  '& .MuiListItem-root': { py: 0.25 }
                }}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {passwordStrength.checks.length ? (
                        <CheckRounded color="success" fontSize="small" />
                      ) : (
                        <CloseRounded color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary="At least 8 characters" 
                      primaryTypographyProps={{ 
                        variant: 'caption',
                        color: passwordStrength.checks.length ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {passwordStrength.checks.uppercase ? (
                        <CheckRounded color="success" fontSize="small" />
                      ) : (
                        <CloseRounded color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary="One uppercase letter" 
                      primaryTypographyProps={{ 
                        variant: 'caption',
                        color: passwordStrength.checks.uppercase ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {passwordStrength.checks.lowercase ? (
                        <CheckRounded color="success" fontSize="small" />
                      ) : (
                        <CloseRounded color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary="One lowercase letter" 
                      primaryTypographyProps={{ 
                        variant: 'caption',
                        color: passwordStrength.checks.lowercase ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {passwordStrength.checks.number ? (
                        <CheckRounded color="success" fontSize="small" />
                      ) : (
                        <CloseRounded color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary="One number" 
                      primaryTypographyProps={{ 
                        variant: 'caption',
                        color: passwordStrength.checks.number ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {passwordStrength.checks.special ? (
                        <CheckRounded color="success" fontSize="small" />
                      ) : (
                        <CloseRounded color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary="One special character" 
                      primaryTypographyProps={{ 
                        variant: 'caption',
                        color: passwordStrength.checks.special ? 'success.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </Grid>

          {/* Confirm Password */}
          <Grid item xs={12}>
            <Controller
              name="confirm_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRounded />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  changePasswordMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SecurityRounded />
                  )
                }
                disabled={changePasswordMutation.isLoading}
                sx={{ minWidth: 150 }}
              >
                {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Security Tips */}
      <Box sx={{ 
        mt: 4, 
        p: 2, 
        backgroundColor: 'warning.main' + '10', 
        border: '1px solid',
        borderColor: 'warning.main' + '30',
        borderRadius: 2 
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Security Tips:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Use a unique password that you don't use elsewhere
          • Consider using a password manager to generate and store secure passwords
          • Change your password regularly (every 3-6 months)
          • Never share your password with anyone
          • Log out from shared devices after use
        </Typography>
      </Box>
    </Box>
  );
};

export default ChangePassword;