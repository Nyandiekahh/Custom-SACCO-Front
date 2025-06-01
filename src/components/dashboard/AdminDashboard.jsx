import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Chip,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Badge
} from '@mui/material';
import {
  VerifiedUserRounded,
  PendingActionsRounded,
  TrendingUpRounded,
  PeopleRounded,
  CreditCardRounded,
  WarningRounded,
  CheckCircleRounded,
  ArrowForwardRounded,
  NotificationsActiveRounded,
  AssignmentTurnedInRounded,
  MonetizationOnRounded,
  TimelineRounded,
  AdminPanelSettingsRounded
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import apiService from '../../services/api';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../common/UI/LoadingSpinner';
import StatsCards from './StatsCards';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch SACCO statistics
  const { data: saccoStats, isLoading: statsLoading } = useQuery({
    queryKey: ['saccoStats'],
    queryFn: () => apiService.getSaccoStats()
  });

  // Fetch pending transactions
  const { data: pendingInvestments = [] } = useQuery({
    queryKey: ['investments', { status: 'PENDING' }],
    queryFn: () => apiService.getInvestments({ status: 'PENDING', page_size: 10 }),
    select: (data) => data.results || []
  });

  // Fetch pending loans
  const { data: pendingLoans = [] } = useQuery({
    queryKey: ['loans', { status: 'PENDING' }],
    queryFn: () => apiService.getLoans({ status: 'PENDING', page_size: 5 }),
    select: (data) => data.results || []
  });

  // Fetch recent activities
  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => apiService.getInvestments({ page_size: 5 }),
    select: (data) => data.results || []
  });

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => apiService.getDashboardData()
  });

  if (statsLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  const totalPendingActions = pendingInvestments.length + pendingLoans.length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
      case 'DISBURSED':
        return <CheckCircleRounded color="success" />;
      case 'PENDING':
        return <PendingActionsRounded color="warning" />;
      case 'REJECTED':
        return <WarningRounded color="error" />;
      default:
        return <TimelineRounded />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
      case 'DISBURSED':
        return theme.palette.success.main;
      case 'PENDING':
        return theme.palette.warning.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box>
      {/* Admin Actions Alert */}
      {totalPendingActions > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<NotificationsActiveRounded />}
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
          You have {totalPendingActions} pending {totalPendingActions === 1 ? 'action' : 'actions'} requiring your attention.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Total Members */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleRounded sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Members
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {saccoStats?.total_members || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active SACCO members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Funds */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MonetizationOnRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Funds
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(saccoStats?.total_funds_available || 0, { decimal: 0 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available funds
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Outstanding Loans */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCardRounded sx={{ color: theme.palette.warning.main, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Outstanding Loans
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(saccoStats?.outstanding_loans || 0, { decimal: 0 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total amount owed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Pending Actions */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge badgeContent={totalPendingActions} color="error">
                      <VerifiedUserRounded sx={{ color: theme.palette.info.main, mr: 1 }} />
                    </Badge>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Pending Actions
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {totalPendingActions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Require verification
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Pending Transactions */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pending Transactions
              </Typography>
              <Button
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate('/transaction-verification')}
              >
                View All
              </Button>
            </Box>

            {pendingInvestments.length > 0 ? (
              <List>
                {pendingInvestments.slice(0, 5).map((investment, index) => (
                  <React.Fragment key={investment.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(investment.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {investment.member_name}
                            </Typography>
                            <Chip
                              label={investment.investment_month ? 'Monthly Investment' : 'Share Capital'}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={investment.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(investment.status) + '20',
                                color: getStatusColor(investment.status),
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(investment.amount)} • {formatRelativeTime(investment.created_at)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Ref: {investment.reference_code}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/transaction-verification')}
                      >
                        Review
                      </Button>
                    </ListItem>
                    {index < pendingInvestments.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AssignmentTurnedInRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No pending transactions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All transactions are up to date
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions & Loan Applications */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={1}>
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
                      Manage Members
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TrendingUpRounded />}
                      onClick={() => navigate('/analytics')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      View Analytics
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Pending Loan Applications */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Loan Applications
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => navigate('/loan-management')}
                  >
                    <ArrowForwardRounded />
                  </IconButton>
                </Box>

                {pendingLoans.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {pendingLoans.slice(0, 3).map((loan, index) => (
                      <React.Fragment key={loan.id}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                  {loan.applicant_name}
                                </Typography>
                                <Chip
                                  label={loan.status}
                                  size="small"
                                  color={
                                    loan.status === 'APPROVED' ? 'success' :
                                    loan.status === 'REJECTED' ? 'error' : 'warning'
                                  }
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(loan.amount_requested)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Applied {formatRelativeTime(loan.applied_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < pendingLoans.slice(0, 3).length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CreditCardRounded sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No pending loan applications
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Activity Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent System Activity
            </Typography>

            {recentActivities.length > 0 ? (
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {activity.member_name} • {activity.investment_month ? 'Monthly Investment' : 'Share Capital'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(activity.amount)} • {activity.status}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatRelativeTime(activity.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={activity.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(activity.status) + '20',
                          color: getStatusColor(activity.status),
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TimelineRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Admin Tips */}
        <Grid item xs={12}>
          <Alert 
            severity="info" 
            icon={<AdminPanelSettingsRounded />}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Admin Tips:
            </Typography>
            <Typography variant="body2">
              • Verify transactions promptly to keep members satisfied
              • Review loan applications within 24-48 hours
              • Monitor outstanding loans and follow up on overdue payments
              • Keep member records updated and accurate
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;