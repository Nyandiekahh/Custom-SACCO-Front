// src/components/profile/ProfileForm.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  PersonRounded,
  EmailRounded,
  PhoneRounded,
  BadgeRounded,
  SchoolRounded,
  WhatsAppRounded,
  PaymentRounded,
  SaveRounded
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useAuthContext } from '../../context/AuthContext';
import apiService from '../../services/api';

// Validation schema
const profileSchema = yup.object().shape({
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
    .matches(/^254[0-9]{9}$/, 'Please enter a valid M-Pesa number (format: 254XXXXXXXXX)')
});

const ProfileForm = () => {
  const { user, updateUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      id_number: user?.id_number || '',
      school_or_job: user?.school_or_job || '',
      whatsapp_number: user?.whatsapp_number || '',
      mpesa_number: user?.mpesa_number || ''
    }
  });

  const watchedPhoneNumber = watch('phone_number');

  // Auto-fill WhatsApp number when phone number changes
  React.useEffect(() => {
    if (watchedPhoneNumber && !watch('whatsapp_number')) {
      setValue('whatsapp_number', watchedPhoneNumber);
    }
  }, [watchedPhoneNumber, setValue, watch]);

  // Auto-format M-Pesa number when phone number changes
  React.useEffect(() => {
    if (watchedPhoneNumber) {
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

      const formatted = formatMpesaNumber(watchedPhoneNumber);
      setValue('mpesa_number', formatted);
    }
  }, [watchedPhoneNumber, setValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => apiService.patch('/auth/profile/', data),
    onSuccess: (response) => {
      updateUser(response);
      queryClient.invalidateQueries(['profile']);
      setSuccess(true);
      toast.success('Profile updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Personal Information
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your profile has been updated successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* First Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="First Name"
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRounded />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Last Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Last Name"
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              )}
            />
          </Grid>

          {/* Email (Read-only) */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed. Contact admin if needed."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRounded />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} sm={6}>
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
                />
              )}
            />
          </Grid>

          {/* ID Number */}
          <Grid item xs={12} sm={6}>
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

          {/* School/Job */}
          <Grid item xs={12} sm={6}>
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

          {/* WhatsApp Number */}
          <Grid item xs={12} sm={6}>
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

          {/* M-Pesa Number */}
          <Grid item xs={12} sm={6}>
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

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  updateProfileMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SaveRounded />
                  )
                }
                disabled={!isDirty || updateProfileMutation.isLoading}
                sx={{ minWidth: 120 }}
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Information Box */}
      <Box sx={{ 
        mt: 4, 
        p: 2, 
        backgroundColor: 'info.main' + '10', 
        border: '1px solid',
        borderColor: 'info.main' + '30',
        borderRadius: 2 
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Important Notes:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Your email address cannot be changed through this form. Contact an administrator if you need to update your email.
          • Phone numbers should be in Kenyan format (starting with +254 or 0).
          • M-Pesa number is used for transaction verification and should match your M-Pesa account.
          • All fields are required for complete profile setup.
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileForm;