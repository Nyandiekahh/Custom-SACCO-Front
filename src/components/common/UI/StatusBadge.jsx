import React from 'react';
import { Chip, Box, useTheme } from '@mui/material';
import {
  CheckCircleRounded,
  PendingRounded,
  CancelRounded,
  WarningRounded,
  InfoRounded,
  HourglassEmptyRounded,
  DoneRounded,
  BlockRounded
} from '@mui/icons-material';

const StatusBadge = ({
  status,
  variant = 'filled', // 'filled', 'outlined', 'dot'
  size = 'medium', // 'small', 'medium'
  showIcon = true,
  customColors = {},
  ...props
}) => {
  const theme = useTheme();

  // Default status configurations
  const statusConfig = {
    // Success states
    VERIFIED: { color: 'success', icon: CheckCircleRounded, label: 'Verified' },
    APPROVED: { color: 'success', icon: CheckCircleRounded, label: 'Approved' },
    COMPLETED: { color: 'success', icon: DoneRounded, label: 'Completed' },
    ACTIVE: { color: 'success', icon: CheckCircleRounded, label: 'Active' },
    PAID: { color: 'success', icon: CheckCircleRounded, label: 'Paid' },
    DISBURSED: { color: 'success', icon: CheckCircleRounded, label: 'Disbursed' },
    REPAID: { color: 'success', icon: CheckCircleRounded, label: 'Repaid' },

    // Warning states
    PENDING: { color: 'warning', icon: PendingRounded, label: 'Pending' },
    REVIEW: { color: 'warning', icon: HourglassEmptyRounded, label: 'Under Review' },
    PARTIAL: { color: 'warning', icon: WarningRounded, label: 'Partial' },
    OVERDUE: { color: 'warning', icon: WarningRounded, label: 'Overdue' },

    // Error states
    REJECTED: { color: 'error', icon: CancelRounded, label: 'Rejected' },
    CANCELLED: { color: 'error', icon: CancelRounded, label: 'Cancelled' },
    FAILED: { color: 'error', icon: CancelRounded, label: 'Failed' },
    INACTIVE: { color: 'error', icon: BlockRounded, label: 'Inactive' },
    EXPIRED: { color: 'error', icon: CancelRounded, label: 'Expired' },

    // Info states
    DRAFT: { color: 'info', icon: InfoRounded, label: 'Draft' },
    PROCESSING: { color: 'info', icon: HourglassEmptyRounded, label: 'Processing' },
    SCHEDULED: { color: 'info', icon: InfoRounded, label: 'Scheduled' },

    // Default/neutral states
    DEFAULT: { color: 'default', icon: InfoRounded, label: 'Unknown' }
  };

  // Get configuration for the status
  const config = statusConfig[status?.toUpperCase()] || statusConfig.DEFAULT;
  
  // Apply custom colors if provided
  const finalConfig = customColors[status] 
    ? { ...config, ...customColors[status] }
    : config;

  const IconComponent = finalConfig.icon;

  // Dot variant - just a colored circle
  if (variant === 'dot') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ...props.sx
        }}
      >
        <Box
          sx={{
            width: size === 'small' ? 6 : 8,
            height: size === 'small' ? 6 : 8,
            borderRadius: '50%',
            backgroundColor: theme.palette[finalConfig.color]?.main || theme.palette.grey[400]
          }}
        />
        <span style={{ fontSize: size === 'small' ? '0.75rem' : '0.875rem' }}>
          {finalConfig.label}
        </span>
      </Box>
    );
  }

  // Custom styled chip for different variants
  const getChipStyles = () => {
    const baseColor = theme.palette[finalConfig.color]?.main || theme.palette.grey[500];
    const lightColor = theme.palette[finalConfig.color]?.light || theme.palette.grey[300];
    
    if (variant === 'outlined') {
      return {
        borderColor: baseColor,
        color: baseColor,
        backgroundColor: 'transparent',
        '& .MuiChip-icon': {
          color: baseColor
        }
      };
    }

    return {
      backgroundColor: finalConfig.color === 'default' 
        ? theme.palette.grey[100] 
        : `${baseColor}20`,
      color: finalConfig.color === 'default' 
        ? theme.palette.text.secondary 
        : baseColor,
      border: `1px solid ${finalConfig.color === 'default' 
        ? theme.palette.grey[300] 
        : `${baseColor}40`}`,
      '& .MuiChip-icon': {
        color: finalConfig.color === 'default' 
          ? theme.palette.text.secondary 
          : baseColor
      }
    };
  };

  return (
    <Chip
      label={finalConfig.label}
      size={size}
      variant={variant === 'filled' ? 'filled' : 'outlined'}
      icon={showIcon ? <IconComponent /> : undefined}
      sx={{
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        height: size === 'small' ? 24 : 32,
        ...getChipStyles(),
        ...props.sx
      }}
      {...props}
    />
  );
};

// Predefined status badge components for common use cases
export const VerificationStatusBadge = ({ status, ...props }) => (
  <StatusBadge
    status={status}
    customColors={{
      PENDING: { color: 'warning', label: 'Pending Verification' },
      VERIFIED: { color: 'success', label: 'Verified' },
      REJECTED: { color: 'error', label: 'Rejected' }
    }}
    {...props}
  />
);

export const LoanStatusBadge = ({ status, ...props }) => (
  <StatusBadge
    status={status}
    customColors={{
      PENDING: { color: 'warning', label: 'Pending Review' },
      APPROVED: { color: 'info', label: 'Approved' },
      DISBURSED: { color: 'success', label: 'Disbursed' },
      REPAID: { color: 'success', label: 'Fully Repaid' },
      REJECTED: { color: 'error', label: 'Rejected' },
      OVERDUE: { color: 'error', label: 'Overdue' }
    }}
    {...props}
  />
);

export const MemberStatusBadge = ({ status, ...props }) => (
  <StatusBadge
    status={status}
    customColors={{
      ACTIVE: { color: 'success', label: 'Active Member' },
      INACTIVE: { color: 'error', label: 'Inactive' },
      PENDING: { color: 'warning', label: 'Pending Approval' }
    }}
    {...props}
  />
);

export const PaymentStatusBadge = ({ status, ...props }) => (
  <StatusBadge
    status={status}
    customColors={{
      PAID: { color: 'success', label: 'Paid' },
      PENDING: { color: 'warning', label: 'Pending' },
      OVERDUE: { color: 'error', label: 'Overdue' },
      PARTIAL: { color: 'warning', label: 'Partially Paid' },
      FAILED: { color: 'error', label: 'Payment Failed' }
    }}
    {...props}
  />
);

export default StatusBadge;