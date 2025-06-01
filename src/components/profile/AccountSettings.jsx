// src/components/profile/AccountSettings.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import {
  SettingsRounded,
  NotificationsRounded,
  EmailRounded,
  SecurityRounded,
  DeleteRounded,
  DevicesRounded,
  LogoutRounded,
  WarningRounded,
  PhoneRounded,
  VisibilityRounded
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../context/AuthContext';
import apiService from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);

  // Fetch user sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['userSessions'],
    queryFn: () => apiService.get('/auth/sessions/'),
    enabled: sessionsDialogOpen
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => apiService.patch('/auth/settings/', newSettings),
    onSuccess: () => {
      toast.success('Settings updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings');
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => apiService.delete('/auth/account/'),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete account');
    }
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: (sessionId) => apiService.post(`/auth/sessions/${sessionId}/end/`),
    onSuccess: () => {
      toast.success('Session ended successfully');
      queryClient.invalidateQueries(['userSessions']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to end session');
    }
  });

  const handleSettingChange = (setting) => (event) => {
    const newSettings = {
      ...settings,
      [setting]: event.target.checked
    };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete my account') {
      deleteAccountMutation.mutate();
    } else {
      toast.error('Please type "delete my account" to confirm');
    }
  };

  const handleEndSession = (sessionId) => {
    endSessionMutation.mutate(sessionId);
  };

  const getCurrentDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsRounded sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Account Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsRounded sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Email Notifications</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive important updates via email
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={handleSettingChange('smsNotifications')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">SMS Notifications</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive alerts via text message
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.securityAlerts}
                      onChange={handleSettingChange('securityAlerts')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Security Alerts</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get notified of login attempts and security events
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.marketingEmails}
                      onChange={handleSettingChange('marketingEmails')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Marketing Emails</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive promotional content and updates
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityRounded sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security
                </Typography>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DevicesRounded />
                  </ListItemIcon>
                  <ListItemText
                    primary="Active Sessions"
                    secondary={`Currently signed in on ${sessions.length || 1} device(s)`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => setSessionsDialogOpen(true)}
                      startIcon={<VisibilityRounded />}
                    >
                      View
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <EmailRounded />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Verification"
                    secondary={
                      user?.email_verified ? (
                        <Chip label="Verified" color="success" size="small" />
                      ) : (
                        <Chip label="Not Verified" color="warning" size="small" />
                      )
                    }
                  />
                  {!user?.email_verified && (
                    <ListItemSecondaryAction>
                      <Button size="small" color="primary">
                        Verify
                      </Button>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <PhoneRounded />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" disabled>
                      Coming Soon
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Account