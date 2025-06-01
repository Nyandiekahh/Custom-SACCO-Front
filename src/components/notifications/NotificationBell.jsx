import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  NotificationsRounded,
  NotificationsNoneRounded,
  CircleRounded,
  CheckAllRounded,
  InfoRounded,
  WarningRounded,
  ErrorRounded,
  CheckCircleRounded
} from '@mui/icons-material';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { formatRelativeTime } from '../../utils/formatters';
import { PRIORITY_LEVELS } from '../../utils/constants';

const NotificationBell = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: () => apiService.getUnreadNotificationCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
    select: (data) => data.unread_count || 0
  });

  // Fetch recent notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', { limit: 10 }],
    queryFn: () => apiService.getNotifications({ page_size: 10 }),
    select: (data) => data.results || [],
    enabled: open // Only fetch when menu is open
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => apiService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadNotificationCount']);
    }
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadNotificationCount']);
    }
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.notification_type) {
      case 'INVESTMENT_VERIFIED':
      case 'INVESTMENT_REJECTED':
        navigate('/investments');
        break;
      case 'LOAN_APPROVED':
      case 'LOAN_REJECTED':
      case 'LOAN_DISBURSED':
        navigate('/loans');
        break;
      case 'ADMIN_TRANSACTION_ALERT':
        navigate('/transaction-verification');
        break;
      default:
        navigate('/dashboard');
    }
    
    handleClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = { fontSize: 'small' };
    
    switch (priority) {
      case PRIORITY_LEVELS.URGENT:
        return <ErrorRounded {...iconProps} color="error" />;
      case PRIORITY_LEVELS.HIGH:
        return <WarningRounded {...iconProps} color="warning" />;
      case PRIORITY_LEVELS.MEDIUM:
        return <InfoRounded {...iconProps} color="info" />;
      default:
        return <CheckCircleRounded {...iconProps} color="success" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.URGENT:
        return theme.palette.error.main;
      case PRIORITY_LEVELS.HIGH:
        return theme.palette.warning.main;
      case PRIORITY_LEVELS.MEDIUM:
        return theme.palette.info.main;
      default:
        return theme.palette.success.main;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="notifications"
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                minWidth: '18px',
                height: '18px'
              }
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsRounded color="action" />
            ) : (
              <NotificationsNoneRounded color="action" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            width: 400,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 600,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<CheckAllRounded />}
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNoneRounded 
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} 
            />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: !notification.is_read 
                      ? theme.palette.action.hover 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: getPriorityColor(notification.priority) + '20',
                        color: getPriorityColor(notification.priority)
                      }}
                    >
                      {getNotificationIcon(notification.notification_type, notification.priority)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: !notification.is_read ? 600 : 400,
                            flexGrow: 1
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.is_read && (
                          <CircleRounded 
                            sx={{ 
                              fontSize: 8, 
                              color: theme.palette.primary.main 
                            }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatRelativeTime(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < notifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={handleViewAll}
                sx={{ justifyContent: 'center' }}
              >
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;