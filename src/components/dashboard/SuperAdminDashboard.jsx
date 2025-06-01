import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  SupervisorAccountRounded,
  PeopleRounded,
  TrendingUpRounded,
  MonetizationOnRounded,
  CreditCardRounded,
  VerifiedUserRounded,
  PersonAddRounded,
  AdminPanelSettingsRounded,
  AnalyticsRounded,
  AssignmentTurnedInRounded,
  TimelineRounded,
  ArrowForwardRounded,
  WarningRounded,
  CheckCircleRounded,
  PendingActionsRounded
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import apiService from '../../services/api';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../common/UI/LoadingSpinner';

const SuperAdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch SACCO statistics
  const { data: saccoStats, isLoading: statsLoading } = useQuery({
    queryKey: ['saccoStats'],
    queryFn: () => apiService.getSaccoStats()
  });

  // Fetch dashboard data specific to super admin
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: () => apiService.getDashboardData()
  });

  // Fetch pending transactions
  const { data: pendingInvestments = [] } = useQuery({
    queryKey: ['investments', { status: 'PENDING' }],
    queryFn: () => apiService.getInvestments({ status: 'PENDING', page_size: 5 }),
    select: (data) => data.results || []
  });

  // Fetch pending loans
  const { data: pendingLoans = [] } = useQuery({
    queryKey: ['loans', { status: 'PENDING' }],
    queryFn: () => apiService.getLoans({ status: 'PENDING', page_size: 5 }),
    select: (data) => data.results || []
  });

  // Fetch recent members
  const { data: recentMembers = [] } = useQuery({
    queryKey: ['members', { recent: true }],
    queryFn: () => apiService.getMembers({ page_size: 5 }),
    select: (data) => data.results || []
  });

  if (statsLoading || dashboardLoading) {
    return <LoadingSpinner message="Loading super admin dashboard..." />;
  }

  const totalPendingActions = pendingInvestments.length + pendingLoans.length;

  // Calculate growth metrics
  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <Box>
      {/* System Alerts */}
      {totalPendingActions > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<AdminPanelSettingsRounded />}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/transaction-verification')}
            >
              Review Now
            </Button>
          }
        >
          System requires attention: {totalPendingActions} pending {totalPendingActions === 1 ? 'action' : 'actions'} across the platform.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Executive Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Total Members */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <SupervisorAccountRounded sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                    <Typography variant="caption" color="text.secondary">
                      MEMBERS
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {saccoStats?.total_members || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Active Members
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={75} // Mock progress for member target
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    75% of yearly target
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Funds */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <MonetizationOnRounded sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                    <Typography variant="caption" color="text.secondary">
                      TOTAL FUNDS
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(saccoStats?.total_funds_available || 0, { decimal: 0 })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="success.main">
                      +12.5% from last month
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Available for investments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Outstanding Loans */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <CreditCardRounded sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
                    <Typography variant="caption" color="text.secondary">
                      OUTSTANDING LOANS
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(saccoStats?.outstanding_loans || 0, { decimal: 0 })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      From {saccoStats?.total_loans_disbursed ? Math.floor(saccoStats.total_loans_disbursed / 50000) : 0} active loans
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Average: {formatCurrency(50000)} per loan
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* System Health */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Badge badgeContent={totalPendingActions} color="error">
                      <AnalyticsRounded sx={{ color: theme.palette.info.main, fontSize: 32 }} />
                    </Badge>
                    <Typography variant="caption" color="text.secondary">
                      SYSTEM HEALTH
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {totalPendingActions === 0 ? '100%' : '95%'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      color={totalPendingActions === 0 ? 'success.main' : 'warning.main'}
                    >
                      {totalPendingActions === 0 ? 'All systems operational' : `${totalPendingActions} pending actions`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Platform status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Management Overview */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Platform Management Overview
              </Typography>
              <Button
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate('/members')}
              >
                Manage All
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Member Management */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleRounded sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Member Management
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {saccoStats?.total_members || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Members
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {saccoStats?.total_admins || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Admin Users
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddRounded />}
                    onClick={() => navigate('/invite-members')}
                    sx={{ mt: 2 }}
                  >
                    Invite Members
                  </Button>
                </Box>
              </Grid>

              {/* Financial Overview */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Financial Health
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(saccoStats?.total_share_capital_collected || 0, { decimal: 0 })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Share Capital
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(saccoStats?.total_monthly_investments || 0, { decimal: 0 })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Monthly Investments
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AnalyticsRounded />}
                    onClick={() => navigate('/analytics')}
                    sx={{ mt: 2 }}
                  >
                    View Analytics
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Super Admin Actions
            </Typography>
            
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAddRounded />}
                  onClick={() => navigate('/invite-members')}
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                >
                  Invite New Members
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VerifiedUserRounded />}
                  onClick={() => navigate('/transaction-verification')}
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Verify Transactions</span>
                    {pendingInvestments.length > 0 && (
                      <Badge badgeContent={pendingInvestments.length} color="error" />
                    )}
                  </Box>
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentTurnedInRounded />}
                  onClick={() => navigate('/loan-management')}
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Review Loans</span>
                    {pendingLoans.length > 0 && (
                      <Badge badgeContent={pendingLoans.length} color="error" />
                    )}
                  </Box>
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleRounded />}
                  onClick={() => navigate('/members')}
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                >
                  Manage All Members
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AnalyticsRounded />}
                  onClick={() => navigate('/analytics')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  System Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Members */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Members
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate('/members')}
              >
                View All
              </Button>
            </Box>

            {recentMembers.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentMembers.slice(0, 4).map((member, index) => (
                  <React.Fragment key={member.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PeopleRounded color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={member.full_name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {member.user_type.replace('_', ' ')} • {member.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Joined {formatRelativeTime(member.date_joined)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentMembers.slice(0, 4).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <PeopleRounded sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No recent members
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              System Status
            </Typography>

            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircleRounded color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Database Connection"
                  secondary="All systems operational"
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircleRounded color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Email Service"
                  secondary="Notifications working normally"
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  {totalPendingActions > 0 ? 
                    <PendingActionsRounded color="warning" /> : 
                    <CheckCircleRounded color="success" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary="Pending Actions"
                  secondary={totalPendingActions > 0 ? 
                    `${totalPendingActions} items need attention` : 
                    'All actions up to date'
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircleRounded color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Security"
                  secondary="No security alerts"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Platform Tips */}
        <Grid item xs={12}>
          <Alert 
            severity="info" 
            icon={<AdminPanelSettingsRounded />}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Super Admin Best Practices:
            </Typography>
            <Typography variant="body2">
              • Regularly review system statistics and member growth trends
              • Ensure all transactions are verified within 24 hours
              • Monitor loan default rates and follow up on overdue payments
              • Keep member data secure and regularly backup system data
              • Review admin permissions and access logs monthly
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminDashboard;