import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  DashboardRounded,
  PeopleRounded,
  PersonAddRounded,
  TrendingUpRounded,
  VerifiedUserRounded,
  AccountBalanceWalletRounded,
  CreditCardRounded,
  PersonRounded,
  SupervisorAccountRounded,
  AssignmentRounded,
  MonetizationOnRounded,
  ReceiptRounded,
  AnalyticsRounded,
  CloseRounded
} from '@mui/icons-material';

import { useAuthContext } from '../../../context/AuthContext';
import { USER_TYPES } from '../../../utils/constants';

const MobileNav = ({ open, onClose, width }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin, isAdmin, isMember, getUserDisplayName, getUserInitials } = useAuthContext();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavigationItems = () => {
    const items = [];

    // Dashboard - Available to all
    items.push({
      text: 'Dashboard',
      icon: <DashboardRounded />,
      path: '/dashboard',
      active: isActive('/dashboard')
    });

    // Super Admin specific items
    if (isSuperAdmin) {
      items.push({
        text: 'All Members',
        icon: <PeopleRounded />,
        path: '/members',
        active: isActive('/members') && !isActive('/invite-members')
      });
      
      items.push({
        text: 'Invite Members',
        icon: <PersonAddRounded />,
        path: '/invite-members',
        active: isActive('/invite-members')
      });
    }

    // Admin specific items
    if (isAdmin || isSuperAdmin) {
      if (isAdmin && !isSuperAdmin) {
        items.push({
          text: 'Member Overview',
          icon: <PeopleRounded />,
          path: '/members',
          active: isActive('/members')
        });
      }

      items.push({
        text: 'Transaction Verification',
        icon: <VerifiedUserRounded />,
        path: '/transaction-verification',
        active: isActive('/transaction-verification')
      });

      items.push({
        text: 'Loan Management',
        icon: <AssignmentRounded />,
        path: '/loan-management',
        active: isActive('/loan-management')
      });

      items.push({
        text: 'Analytics',
        icon: <AnalyticsRounded />,
        path: '/analytics',
        active: isActive('/analytics')
      });
    }

    // Member specific items
    if (isMember) {
      items.push({
        text: 'My Investments',
        icon: <TrendingUpRounded />,
        path: '/investments',
        active: isActive('/investments')
      });

      items.push({
        text: 'Share Capital',
        icon: <AccountBalanceWalletRounded />,
        path: '/investments?type=share_capital',
        active: location.pathname === '/investments' && location.search.includes('share_capital')
      });

      items.push({
        text: 'Monthly Investments',
        icon: <ReceiptRounded />,
        path: '/investments?type=monthly',
        active: location.pathname === '/investments' && !location.search.includes('share_capital')
      });

      items.push({
        text: 'My Loans',
        icon: <CreditCardRounded />,
        path: '/loans',
        active: isActive('/loans') && !isActive('/loan-application')
      });

      items.push({
        text: 'Apply for Loan',
        icon: <PersonAddRounded />,
        path: '/loan-application',
        active: isActive('/loan-application')
      });
    }

    // Non-member loan access
    if (!isMember && !isAdmin && !isSuperAdmin) {
      items.push({
        text: 'Loans',
        icon: <CreditCardRounded />,
        path: '/loans',
        active: isActive('/loans')
      });

      items.push({
        text: 'Apply for Loan',
        icon: <PersonAddRounded />,
        path: '/loan-application',
        active: isActive('/loan-application')
      });
    }

    // Profile - Available to all
    items.push({
      text: 'Profile',
      icon: <PersonRounded />,
      path: '/profile',
      active: isActive('/profile')
    });

    return items;
  };

  const renderNavItem = (item) => {
    return (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            backgroundColor: item.active 
              ? alpha(theme.palette.primary.main, 0.12)
              : 'transparent',
            color: item.active 
              ? theme.palette.primary.main 
              : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: item.active 
                ? alpha(theme.palette.primary.main, 0.16)
                : alpha(theme.palette.action.hover, 0.04),
            },
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: 40, 
              color: item.active 
                ? theme.palette.primary.main 
                : theme.palette.text.secondary
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text}
            primaryTypographyProps={{
              variant: 'body1',
              fontWeight: item.active ? 600 : 500
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Close Button */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            KMS SACCO
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseRounded />
          </IconButton>
        </Box>

        {/* User Info Section */}
        <Box sx={{ p: 2 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2, 
              borderRadius: 2, 
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {getUserInitials}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {getUserDisplayName}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                {user?.user_type?.replace('_', ' ').toLowerCase()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mx: 2 }} />

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
          <List component="nav">
            {getNavigationItems().map(item => renderNavItem(item))}
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block', textAlign: 'center' }}
          >
            KMS SACCO Management System v1.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileNav;