import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  VisibilityRounded,
  VisibilityOffRounded,
  PersonAddRounded,
  EmailRounded,
  PhoneRounded,
  PersonRounded,
  SchoolRounded,
  BadgeRounded,
  WhatsAppRounded,
  PaymentRounded
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME, SHARE_CAPITAL_PACKAGES, SHARE_CAPITAL_PACKAGE_LABELS, USER_TYPES } from '../../utils/constants';

// Validation schema
const registrationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  password_confirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  phone_number: yup
    .string()
    .required('Phone number is required')
    .matches(/^(\+254|0)[0-9]{9}$/, 'Please enter a valid Kenyan phone number'),
  id_number: yup
    .string()
    .required('ID number is required')
    .min(7, 'ID number must be at least 7 characters'),
  school_or_job: yup
    .string()
    .required('School or job is required'),
  whatsapp_number: yup
    .string()
    .required('WhatsApp number is required')
    .matches(/^(\+254|0)[0-9]{9}$/, 'Please enter a valid Kenyan phone number'),
  mpesa_number: yup
    .string()
    .required('M-Pesa number is required')
    .matches(/^254[0-9]{9}$/, 'Please enter a valid M-Pesa number (format: 254XXXXXXXXX)'),
  share_capital_package: yup
    .string()
    .when('user_type', {
      is: USER_TYPES.MEMBER,
      then: yup.string().required('Please select a share capital package'),
      otherwise: yup.string()
    })
});

const steps = ['Account Details', 'Personal Information', 'Contact & Payment'];

const RegisterForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading } = useAuthContext();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Get user type from URL params (for invitations)
  const userTypeFromUrl = searchParams.get('type') || USER_TYPES.NON_MEMBER;
  const packageFromUrl = searchParams.get('package');
  const invitedBy = searchParams.get('invited_by');

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      id_number: '',
      school_or_job: '',
      whatsapp_number: '',
      mpesa_number: '',
      user_type: userTypeFromUrl,
      share_capital_package: packageFromUrl || ''
    }
  });

  const watchedUserType = watch('user_type');
  const watchedPhoneNumber = watch('phone_number');

  // Auto-fill WhatsApp number when phone number changes
  React.useEffect(() => {
    if (watchedPhoneNumber && !watch('whatsapp_number')) {
      setValue('whatsapp_number', watchedPhoneNumber);
    }
  }, [watchedPhoneNumber, setValue, watch]);

  const formatMpesaNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Convert to M-Pesa format (254XXXXXXXXX)
    if (digits.startsWith('0')) {
      return '254' + digits.substring(1);
    } else if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      return '254' + digits;
    }
    
    return digits;
  };

  // Auto-format M-Pesa number when phone number changes
  React.useEffect(() => {
    if (watchedPhoneNumber) {
      const formatted = formatMpesaNumber(watchedPhoneNumber);
      setValue('mpesa_number', formatted);
    }
  }, [watchedPhoneNumber, setValue]);

  const handleNext = async () => {
    const stepFields = getStepFields(activeStep);
    const isValid = await trigger(stepFields);
    
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ['email', 'password', 'password_confirm'];
      case 1:
        return ['first_name', 'last_name', 'id_number', 'school_or_job'];
      case 2:
        return ['phone_number', 'whatsapp_number', 'mpesa_number', 'share_capital_package'];
      default:
        return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      await register(data);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/verify-email', { 
        state: { 
          email: data.email,
          message: 'Please check your email for verification instructions.'
        }
      });
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
                    autoComplete="email"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create a strong password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="new-password"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="password_confirm"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    error={!!errors.password_confirm}
                    helperText={errors.password_confirm?.message}
                    InputProps={{
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
                    autoComplete="new-password"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    placeholder="Enter your first name"
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRounded />
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="given-name"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    placeholder="Enter your last name"
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    autoComplete="family-name"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="id_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ID Number"
                    placeholder="Enter your national ID number"
                    error={!!errors.id_number}
                    helperText={errors.id_number?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="school_or_job"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="School or Job"
                    placeholder="Enter your school or current job"
                    error={!!errors.school_or_job}
                    helperText={errors.school_or_job?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    placeholder="0700000000 or +254700000000"
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneRounded />
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="tel"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="whatsapp_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="WhatsApp Number"
                    placeholder="0700000000 or +254700000000"
                    error={!!errors.whatsapp_number}
                    helperText={errors.whatsapp_number?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WhatsAppRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="mpesa_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="M-Pesa Number"
                    placeholder="254700000000"
                    error={!!errors.mpesa_number}
                    helperText={errors.mpesa_number?.message || "Format: 254XXXXXXXXX"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaymentRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {watchedUserType === USER_TYPES.MEMBER && (
              <Grid item xs={12}>
                <Controller
                  name="share_capital_package"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.share_capital_package}>
                      <InputLabel>Share Capital Payment Plan</InputLabel>
                      <Select
                        {...field}
                        label="Share Capital Payment Plan"
                      >
                        <MenuItem value={SHARE_CAPITAL_PACKAGES.TWELVE_MONTH}>
                          {SHARE_CAPITAL_PACKAGE_LABELS['12_MONTH']} - KSH 417/month
                        </MenuItem>
                        <MenuItem value={SHARE_CAPITAL_PACKAGES.TWENTY_FOUR_MONTH}>
                          {SHARE_CAPITAL_PACKAGE_LABELS['24_MONTH']} - KSH 208/month
                        </MenuItem>
                      </Select>
                      {errors.share_capital_package && (
                        <FormHelperText>{errors.share_capital_package.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Share capital is a one-time KSH 5,000 investment required for membership.
                </Typography>
              </Grid>
            )}
          </Grid>
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
          maxWidth: 600,
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
          <PersonAddRounded sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Join {APP_NAME} today
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Invitation Alert */}
          {invitedBy && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You've been invited to join as a {userTypeFromUrl.replace('_', ' ').toLowerCase()}.
            </Alert>
          )}

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Step Content */}
            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonAddRounded />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
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

export default RegisterForm;