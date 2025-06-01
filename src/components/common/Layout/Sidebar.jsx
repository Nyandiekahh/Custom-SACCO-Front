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
  Collapse,
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
  SettingsRounded,
  SupervisorAccountRounded,
  AssignmentRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  MonetizationOnRounded,
  ReceiptRounded,
  AnalyticsRounded
} from '@mui/icons-material';

import { useAuthContext } from '../../../context/AuthContext';
import { USER_TYPES } from '../../../utils/constants';

const Sidebar = ({ open, variant, width }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin, isAdmin, isMember } = useAuthContext();

  const [expandedMenus, setExpandedMenus] = React.useState({
    members: false,
    investments: false,
    loans: false
  });

  const handleMenuToggle = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
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
        text: 'Member Management',
        icon: <SupervisorAccountRounded />,
        expandable: true,
        expanded: expandedMenus.members,
        onToggle: () => handleMenuToggle('members'),
        children: [
          {
            text: 'All Members',
            icon: <PeopleRounded />,
            path: '/members',
            active: isActive('/members') && !isActive('/invite-members')
          },
          {
            text: 'Invite Members',
            icon: <PersonAddRounded />,
            path: '/invite-members',
            active: isActive('/invite-members')
          }
        ]
      });
    }

    // Admin specific items
    if (isAdmin || isSuperAdmin) {
      items.push({
        text: 'Member Overview',
        icon: <PeopleRounded />,
        path: '/members',
        active: isActive('/members'),
        show: isAdmin && !isSuperAdmin
      });

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
        expandable: true,
        expanded: expandedMenus.investments,
        onToggle: () => handleMenuToggle('investments'),
        children: [
          {
            text: 'Investment Overview',
            icon: <MonetizationOnRounded />,
            path: '/investments',
            active: isActive('/investments')
          },
          {
            text: 'Share Capital',
            icon: <AccountBalanceWalletRounded />,
            path: '/investments?type=share_capital',
            active: location.pathname === '/investments' && location.search.includes('share_capital')
          },
          {
            text: 'Monthly Investments',
            icon: <ReceiptRounded />,
            path: '/investments?type=monthly',
            active: location.pathname === '/investments' && !location.search.includes('share_capital')
          }
        ]
      });

      items.push({
        text: 'My Loans',
        icon: <CreditCardRounded />,
        expandable: true,
        expanded: expandedMenus.loans,
        onToggle: () => handleMenuToggle('loans'),
        children: [
          {
            text: 'Loan Overview',
            icon: <AccountBalanceWalletRounded />,
            path: '/loans',
            active: isActive('/loans') && !isActive('/loan-application')
          },
          {
            text: 'Apply for Loan',
            icon: <PersonAddRounded />,
            path: '/loan-application',
            active: isActive('/loan-application')
          }
        ]
      });
    }

    // All users can access loans (non-members for loan applications)
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

    return items.filter(item => item.show !== false);
  };

  const renderNavItem = (item, level = 0) => {
    const paddingLeft = level === 0 ? 2 : 4;

    if (item.expandable) {
      return (
        <React.Fragment key={item.text}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={item.onToggle}
              sx={{
                pl: paddingLeft,
                py: 1,
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500
                }}
              />
              {item.expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={item.expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={{
            pl: paddingLeft,
            py: 1,
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
              variant: 'body2',
              fontWeight: item.active ? 600 : 500
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Info Section */}
      <Box sx={{ p: 2, pt: 3 }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography 
            variant="caption" 
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
          KMS SACCO v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;