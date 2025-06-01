import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloseRounded,
  UploadFileRounded,
  MonetizationOnRounded,
  AccountBalanceWalletRounded
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format, startOfMonth, subMonths } from 'date-fns';

import apiService from '../../services/api';
import { SACCO_RULES } from '../../utils/constants';
import FileUpload from '../common/UI/FileUpload';
import CurrencyInput from '../common/UI/CurrencyInput';

// Validation schema
const investmentSchema = yup.object().shape({
  amount: yup
    .number()
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0')
    .when('investmentType', {
      is: 'monthly',
      then: yup.number().min(SACCO_RULES.MINIMUM_MONTHLY_INVESTMENT, `Minimum monthly investment is KSH ${SACCO_RULES.MINIMUM_MONTHLY_INVESTMENT}`),
      otherwise: yup.number().max(SACCO_RULES.SHARE_CAPITAL_AMOUNT, `Maximum share capital payment is KSH ${SACCO_RULES.SHARE_CAPITAL_AMOUNT}`)
    }),
  reference_code: yup
    .string()
    .required('M-Pesa reference code is required')
    .min(8, 'Reference code must be at least 8 characters'),
  payment_date: yup
    .date()
    .required('Payment date is required')
    .max(new Date(), 'Payment date cannot be in the future'),
  investment_month: yup
    .date()
    .when('investmentType', {
      is: 'monthly',
      then: yup.date().required('Investment month is required'),
      otherwise: yup.date()
    }),
  mpesa_message: yup
    .string()
    .required('M-Pesa message is required')
    .min(10, 'Please provide the complete M-Pesa message')
});

const MonthlyInvestmentForm = ({ open, onClose, investmentType = 'monthly' }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  
  const [receiptFile, setReceiptFile] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(investmentSchema),
    defaultValues: {
      amount: '',
      reference_code: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      investment_month: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      mpesa_message: '',
      investmentType
    }
  });

  const watchedInvestmentType = watch('investmentType');

  // Generate month options for the last 6 months
  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(startOfMonth(new Date()), i);
      options.push({
        value: format(monthDate, 'yyyy-MM-dd'),
        label: format(monthDate, 'MMMM yyyy')
      });
    }
    return options;
  };

  // Investment submission mutation
  const investmentMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      
      // Add receipt file if uploaded
      if (receiptFile) {
        formData.append('receipt_image', receiptFile);
      }

      // Call appropriate API endpoint
      if (investmentType === 'share_capital') {
        return apiService.createShareCapitalPayment(formData);
      } else {
        return apiService.createMonthlyInvestment(formData);
      }
    },
    onSuccess: () => {
      toast.success('Investment recorded successfully! Awaiting admin verification.');
      queryClient.invalidateQueries(['investments']);
      queryClient.invalidateQueries(['memberSummary']);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record investment');
    }
  });

  const handleClose = () => {
    reset();
    setReceiptFile(null);
    onClose();
  };

  const onSubmit = async (data) => {
    if (!receiptFile) {
      toast.error('Please upload a receipt image');
      return;
    }

    investmentMutation.mutate({
      ...data,
      investmentType
    });
  };

  const handleFileUpload = (file) => {
    setReceiptFile(file);
  };

  const isShareCapital = investmentType === 'share_capital';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: fullScreen ? 0 : 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isShareCapital ? (
              <AccountBalanceWalletRounded color="primary" />
            ) : (
              <MonetizationOnRounded color="primary" />
            )}
            <Typography variant="h6">
              Record {isShareCapital ? 'Share Capital' : 'Monthly Investment'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseRounded />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Amount Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    {...field}
                    label="Amount (KSH)"
                    placeholder="Enter amount"
                    error={!!errors.amount}
                    helperText={
                      errors.amount?.message || 
                      (isShareCapital ? 
                        `Maximum: KSH ${SACCO_RULES.SHARE_CAPITAL_AMOUNT}` : 
                        `Minimum: KSH ${SACCO_RULES.MINIMUM_MONTHLY_INVESTMENT}`
                      )
                    }
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Investment Month (Monthly investments only) */}
            {!isShareCapital && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="investment_month"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.investment_month}>
                      <InputLabel>Investment Month</InputLabel>
                      <Select
                        {...field}
                        label="Investment Month"
                      >
                        {getMonthOptions().map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.investment_month && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {errors.investment_month.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            )}

            {/* Reference Code */}
            <Grid item xs={12} md={6}>
              <Controller
                name="reference_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="M-Pesa Reference Code"
                    placeholder="e.g., QGH7I4J2K8"
                    error={!!errors.reference_code}
                    helperText={errors.reference_code?.message}
                    fullWidth
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
              />
            </Grid>

            {/* Payment Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="payment_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Payment Date"
                    type="date"
                    error={!!errors.payment_date}
                    helperText={errors.payment_date?.message}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            {/* M-Pesa Message */}
            <Grid item xs={12}>
              <Controller
                name="mpesa_message"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="M-Pesa Confirmation Message"
                    placeholder="Paste the complete M-Pesa confirmation message here..."
                    error={!!errors.mpesa_message}
                    helperText={errors.mpesa_message?.message || "Copy and paste the entire SMS you received"}
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>

            {/* Receipt Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Upload Receipt Image
              </Typography>
              <FileUpload
                onFileSelect={handleFileUpload}
                acceptedTypes={['image/*']}
                maxSizeMB={5}
                helperText="Upload a clear photo of your M-Pesa receipt (JPG, PNG - Max 5MB)"
              />
            </Grid>

            {/* Information Alert */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Important Information:
                </Typography>
                <Typography variant="body2">
                  • Your investment will be pending verification by an admin
                  • Ensure all details match your M-Pesa transaction
                  • Upload a clear photo of your receipt for faster verification
                  • You'll receive a notification once verified
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            disabled={investmentMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={investmentMutation.isLoading}
            startIcon={<UploadFileRounded />}
          >
            {investmentMutation.isLoading ? 'Recording...' : 'Record Investment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MonthlyInvestmentForm;