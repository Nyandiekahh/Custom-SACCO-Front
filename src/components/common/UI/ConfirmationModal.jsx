import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloseRounded,
  WarningRounded,
  InfoRounded,
  ErrorRounded,
  CheckCircleRounded,
  HelpRounded
} from '@mui/icons-material';

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning', // 'warning', 'error', 'info', 'success', 'question'
  loading = false,
  maxWidth = 'sm',
  showCloseButton = true,
  destructive = false,
  details = null
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getIcon = () => {
    const iconProps = { sx: { fontSize: 48, mb: 2 } };
    
    switch (severity) {
      case 'error':
        return <ErrorRounded {...iconProps} color="error" />;
      case 'warning':
        return <WarningRounded {...iconProps} color="warning" />;
      case 'info':
        return <InfoRounded {...iconProps} color="info" />;
      case 'success':
        return <CheckCircleRounded {...iconProps} color="success" />;
      case 'question':
        return <HelpRounded {...iconProps} color="primary" />;
      default:
        return <WarningRounded {...iconProps} color="warning" />;
    }
  };

  const getButtonColor = () => {
    if (destructive) return 'error';
    
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          ...(severity === 'error' && {
            border: `2px solid ${theme.palette.error.main}20`
          }),
          ...(severity === 'warning' && {
            border: `2px solid ${theme.palette.warning.main}20`
          })
        }
      }}
    >
      {/* Title */}
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton onClick={handleClose} disabled={loading} size="small">
              <CloseRounded />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {/* Icon */}
          {getIcon()}

          {/* Main Message */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            {message}
          </Typography>

          {/* Additional Details */}
          {details && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                textAlign: 'left'
              }}
            >
              {typeof details === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {details}
                </Typography>
              ) : (
                details
              )}
            </Box>
          )}

          {/* Warning for destructive actions */}
          {destructive && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: theme.palette.error.main + '10',
                border: `1px solid ${theme.palette.error.main}30`,
                borderRadius: 2
              }}
            >
              <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                ⚠️ This action cannot be undone.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          size="large"
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color={getButtonColor()}
          size="large"
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Hook for easier usage
export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = React.useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    severity: 'warning',
    destructive: false,
    details: null
  });

  const showConfirmation = (options) => {
    setConfirmationState({
      open: true,
      title: options.title || 'Confirm Action',
      message: options.message || 'Are you sure you want to proceed?',
      onConfirm: options.onConfirm,
      severity: options.severity || 'warning',
      destructive: options.destructive || false,
      details: options.details || null,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel'
    });
  };

  const hideConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, open: false }));
  };

  const handleConfirm = async () => {
    if (confirmationState.onConfirm) {
      try {
        await confirmationState.onConfirm();
        hideConfirmation();
      } catch (error) {
        // Keep modal open if confirmation fails
        console.error('Confirmation action failed:', error);
      }
    } else {
      hideConfirmation();
    }
  };

  const ConfirmationDialog = () => (
    <ConfirmationModal
      open={confirmationState.open}
      onClose={hideConfirmation}
      onConfirm={handleConfirm}
      title={confirmationState.title}
      message={confirmationState.message}
      severity={confirmationState.severity}
      destructive={confirmationState.destructive}
      details={confirmationState.details}
      confirmText={confirmationState.confirmText}
      cancelText={confirmationState.cancelText}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog
  };
};

export default ConfirmationModal;