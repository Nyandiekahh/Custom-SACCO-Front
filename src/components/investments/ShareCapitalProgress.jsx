// src/components/investments/ShareCapitalProgress.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  Alert,
  Button,
  useTheme
} from '@mui/material';
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  WarningRounded,
  AddRounded,
  CalendarTodayRounded
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';

import apiService from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SACCO_RULES } from '../../utils/constants';

const ShareCapitalProgress = ({ onRecordPayment }) => {
  const theme = useTheme();
  const { user } = useAuthContext();

  // Fetch member summary to get share capital progress
  const { data: memberData, isLoading } = useQuery({
    queryKey: ['memberSummary'],
    queryFn: () => apiService.getMemberSummary()
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountBalanceWalletRounded sx={{ mr: 1 }} />
            <Typography variant="h6">Share Capital Progress</Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const summary = memberData?.summary;
  const member = memberData?.member;

  if (!summary) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">
            Unable to load share capital progress
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = parseFloat(summary.total_share_capital_paid) || 0;
  const remaining = SACCO_RULES.SHARE_CAPITAL_AMOUNT - totalPaid;
  const progressPercentage = (totalPaid / SACCO_RULES.SHARE_CAPITAL_AMOUNT) * 100;
  const isCompleted = summary.share_capital_completed;

  // Calculate days remaining or overdue
  const deadline = member?.share_capital_deadline ? new Date(member.share_capital_deadline) : null;
  const today = new Date();
  const daysRemaining = deadline ? differenceInDays(deadline, today) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  const getStatusColor = () => {
    if (isCompleted) return 'success';
    if (isOverdue) return 'error';
    if (daysRemaining !== null && daysRemaining <= 30) return 'warning';
    return 'info';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isOverdue) return `Overdue by ${Math.abs(daysRemaining)} days`;
    if (daysRemaining !== null && daysRemaining <= 30) return `${daysRemaining} days remaining`;
    return 'In Progress';
  };

  const getProgressBarColor = () => {
    if (isCompleted) return 'success';
    if (isOverdue) return 'error';
    if (progressPercentage >= 75) return 'info';
    if (progressPercentage >= 50) return 'warning';
    return 'primary';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AccountBalanceWalletRounded 
            sx={{ 
              color: isCompleted ? theme.palette.success.main : theme.palette.primary.main, 
              mr: 1 
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Share Capital Progress
          </Typography>
          <Chip
            label={getStatusText()}
            color={getStatusColor()}
            size="small"
            icon={isCompleted ? <CheckCircleRounded /> : <WarningRounded />}
          />
        </Box>

        {/* Progress Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Amount Paid
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(totalPaid)} of {formatCurrency(SACCO_RULES.SHARE_CAPITAL_AMOUNT)}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(progressPercentage, 100)}
            color={getProgressBarColor()}
            sx={{
              height: 12,
              borderRadius: 6,
              mb: 1,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {progressPercentage.toFixed(1)}% complete
            </Typography>
            {!isCompleted && (
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(remaining)} remaining
              </Typography>
            )}
          </Box>
        </Box>

        {/* Package Information */}
        {member?.share_capital_package && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Payment Plan
            </Typography>
            <Chip
              label={`${member.share_capital_package.replace('_', ' ')} Package`}
              variant="outlined"
              size="small"
            />
          </Box>
        )}

        {/* Deadline Information */}
        {deadline && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarTodayRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Deadline
              </Typography>
            </Box>
            <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
              {formatDate(deadline, { format: 'long' })}
            </Typography>
            {daysRemaining !== null && (
              <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}>
                {isOverdue ? 
                  `Overdue by ${Math.abs(daysRemaining)} days` : 
                  `${daysRemaining} days remaining`
                }
              </Typography>
            )}
          </Box>
        )}

        {/* Alerts */}
        {isCompleted && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              🎉 Congratulations! You have completed your share capital requirement.
            </Typography>
          </Alert>
        )}

        {isOverdue && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your share capital payment is overdue. Please make a payment as soon as possible.
            </Typography>
          </Alert>
        )}

        {!isCompleted && daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your share capital deadline is approaching. Please make a payment soon.
            </Typography>
          </Alert>
        )}

        {/* Payment Information */}
        <Box sx={{ 
          backgroundColor: theme.palette.grey[50], 
          p: 2, 
          borderRadius: 2, 
          mb: 2 
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Share Capital Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Share capital is a one-time investment of KSH 5,000 that grants you full membership benefits including loan eligibility and voting rights.
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Non-refundable investment
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Flexible payment plans available
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Required for loan eligibility
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Grants full membership benefits
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        {!isCompleted && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddRounded />}
            onClick={onRecordPayment}
            color={isOverdue ? 'error' : 'primary'}
            sx={{ fontWeight: 600 }}
          >
            Record Payment
          </Button>
        )}

        {isCompleted && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleRounded sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
              Share Capital Completed!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareCapitalProgress;