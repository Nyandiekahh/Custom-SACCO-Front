import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Alert,
  Chip,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider
} from '@mui/material';
import {
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  CreditCardRounded,
  AddRounded,
  WarningRounded,
  CheckCircleRounded,
  PendingRounded,
  ArrowForwardRounded,
  MonetizationOnRounded,
  PaymentRounded,
  InfoRounded,
  TimelineRounded
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import apiService from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatProgress } from '../../utils/formatters';
import { SACCO_RULES, USER_TYPES } from '../../utils/constants';
import LoadingSpinner from '../common/UI/LoadingSpinner';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';

const MemberDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isMember } = useAuthContext();

  // Fetch member summary
  const { data: memberSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['memberSummary'],
    queryFn: () => apiService.getMemberSummary(),
    enabled: isMember
  });

  // Fetch recent investments
  const { data: recentInvestments = [] } = useQuery({
    queryKey: ['investments', { limit: 5 }],
    queryFn: () => apiService.getInvestments({ page_size: 5 }),
    select: (data) => data.results || [],
    enabled: isMember
  });

  // Fetch recent loans
  const { data: recentLoans = [] } = useQuery({
    queryKey: ['loans', { limit: 3 }],
    queryFn: () => apiService.getLoans({ page_size: 3 }),
    select: (data) => data.results || []
  });

  // Fetch loan eligibility
  const { data: eligibility } = useQuery({
    queryKey: ['memberEligibility'],
    queryFn: () => apiService.checkMemberEligibility(),
    enabled: isMember
  });

  if (summaryLoading && isMember) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const summary = memberSummary?.summary;
  const memberData = memberSummary?.member;

  // Calculate share capital progress
  const shareCapitalProgress = summary ? 
    formatProgress(summary.total_share_capital_paid, SACCO_RULES.SHARE_CAPITAL_AMOUNT) : 0;

  // Get status colors and icons
  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return theme.palette.success.main;
      case 'PENDING':
        return theme.palette.warning.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircleRounded color="success" />;
      case 'PENDING':
        return <PendingRounded color="warning" />;
      case 'REJECTED':
        return <WarningRounded color="error" />;
      default:
        return <InfoRounded />;
    }
  };

  return (
    <Box>
      {/* Email Verification Alert */}
      {!user?.email_verified && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              Resend Email
            </Button>
          }
        >
          Please verify your email address to access all features.
        </Alert>
      )}

      {/* Non-member limited access */}
      {!isMember && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/loan-application')}>
              Apply Now
            </Button>
          }
        >
          You can apply for loans as a non-member. Contact admin to become a full member.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Member-specific content */}
        {isMember && summary && (
          <>
            {/* Financial Overview Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {/* Share Capital Progress */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalanceWalletRounded 
                          sx={{ color: theme.palette.primary.main, mr: 1 }} 
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Share Capital
                        </Typography>
                      </Box>
                      
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatCurrency(summary.total_share_capital_paid)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        of {formatCurrency(SACCO_RULES.SHARE_CAPITAL_AMOUNT)} required
                      </Typography>
                      
                      <LinearProgress
                        variant="determinate"
                        value={shareCapitalProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: summary.share_capital_completed 
                              ? theme.palette.success.main 
                              : theme.palette.primary.main
                          }
                        }}
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        {shareCapitalProgress.toFixed(1)}% complete
                      </Typography>
                      
                      {summary.share_capital_completed && (
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Monthly Investments */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpRounded 
                          sx={{ color: theme.palette.success.main, mr: 1 }} 
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Monthly Investments
                        </Typography>
                      </Box>
                      
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatCurrency(summary.total_monthly_investments)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Total invested
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2">
                          This month: {formatCurrency(summary.current_month_investment)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        {summary.consecutive_months_contributed} consecutive months
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddRounded />}
                        sx={{ mt: 1 }}
                        onClick={() => navigate('/investments')}
                      >
                        Add Investment
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Loan Status */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CreditCardRounded 
                          sx={{ color: theme.palette.info.main, mr: 1 }} 
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Loan Status
                        </Typography>
                      </Box>
                      
                      {summary.has_active_loan ? (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {formatCurrency(summary.outstanding_loan_balance)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Outstanding balance
                          </Typography>
                          <Chip
                            label="Active Loan"
                            color="warning"
                            size="small"
                          />
                        </>
                      ) : (
                        <>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            No active loans
                          </Typography>
                          
                          {eligibility?.eligible ? (
                            <Chip
                              label="Eligible for loan"
                              color="success"
                              size="small"
                              sx={{ mb: 2 }}
                            />
                          ) : (
                            <Chip
                              label="Not eligible"
                              color="error"
                              size="small"
                              sx={{ mb: 2 }}
                            />
                          )}
                          
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddRounded />}
                            onClick={() => navigate('/loan-application')}
                            disabled={!eligibility?.eligible}
                          >
                            Apply for Loan
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Loan Eligibility Status */}
            {eligibility && !eligibility.eligible && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Loan Eligibility Requirements:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {eligibility.eligibility.reasons.map((reason, index) => (
                      <Typography component="li" variant="body2" key={index}>
                        {reason}
                      </Typography>
                    ))}
                  </Box>
                </Alert>
              </Grid>
            )}
          </>
        )}

        {/* Recent Activity Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Button
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate(isMember ? '/investments' : '/loans')}
              >
                View All
              </Button>
            </Box>

            {isMember && recentInvestments.length > 0 ? (
              <List>
                {recentInvestments.slice(0, 3).map((investment, index) => (
                  <React.Fragment key={investment.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(investment.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {investment.investment_month ? 'Monthly Investment' : 'Share Capital'}
                            </Typography>
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
                              {formatCurrency(investment.amount)} • {formatDate(investment.created_at)}
                            </Typography>
                            {investment.investment_month && (
                              <Typography variant="caption" color="text.secondary">
                                For {format(new Date(investment.investment_month), 'MMMM yyyy')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(investment.amount)}
                      </Typography>
                    </ListItem>
                    {index < recentInvestments.slice(0, 3).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TimelineRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {isMember ? 'No recent investments' : 'Activity will appear here'}
                </Typography>
                {isMember && (
                  <Button
                    variant="outlined"
                    startIcon={<AddRounded />}
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/investments')}
                  >
                    Make Your First Investment
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions & Loans */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Quick Actions */}
            {isMember && (
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
                        startIcon={<MonetizationOnRounded />}
                        onClick={() => navigate('/investments')}
                        sx={{ justifyContent: 'flex-start', mb: 1 }}
                      >
                        Record Investment
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CreditCardRounded />}
                        onClick={() => navigate('/loan-application')}
                        sx={{ justifyContent: 'flex-start', mb: 1 }}
                        disabled={summary?.has_active_loan || !eligibility?.eligible}
                      >
                        Apply for Loan
                      </Button>
                    </Grid>
                    
                    {summary?.has_active_loan && (
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<PaymentRounded />}
                          onClick={() => navigate('/loans')}
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Make Repayment
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Recent Loans */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    My Loans
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => navigate('/loans')}
                  >
                    <ArrowForwardRounded />
                  </IconButton>
                </Box>

                {recentLoans.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {recentLoans.map((loan, index) => (
                      <React.Fragment key={loan.id}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                  {formatCurrency(loan.amount_requested)}
                                </Typography>
                                <Chip
                                  label={loan.status}
                                  size="small"
                                  color={
                                    loan.status === 'DISBURSED' ? 'success' :
                                    loan.status === 'APPROVED' ? 'info' :
                                    loan.status === 'REJECTED' ? 'error' : 'warning'
                                  }
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                Applied {formatDate(loan.applied_at)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentLoans.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CreditCardRounded sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No loans yet
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate('/loan-application')}
                      disabled={isMember && (summary?.has_active_loan || !eligibility?.eligible)}
                    >
                      Apply for your first loan
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Member Information Card */}
        {isMember && memberData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Membership Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {memberData.sacco_joining_date ? 
                        formatDate(memberData.sacco_joining_date, { format: 'long' }) : 
                        'Not specified'
                      }
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Share Capital Package
                    </Typography>
                    <Typography variant="body1">
                      {memberData.share_capital_package ? 
                        `${memberData.share_capital_package.replace('_', ' ')} Package` : 
                        'Not specified'
                      }
                    </Typography>
                  </Box>
                </Grid>
                
                {memberData.share_capital_deadline && (
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Share Capital Deadline
                      </Typography>
                      <Typography 
                        variant="body1"
                        color={new Date(memberData.share_capital_deadline) < new Date() ? 'error' : 'inherit'}
                      >
                        {formatDate(memberData.share_capital_deadline, { format: 'long' })}
                        {new Date(memberData.share_capital_deadline) < new Date() && (
                          <Chip label="Overdue" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Account Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={memberData.is_active ? 'Active' : 'Inactive'}
                        color={memberData.is_active ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={memberData.email_verified ? 'Verified' : 'Unverified'}
                        color={memberData.email_verified ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Help & Support */}
        <Grid item xs={12}>
          <Alert 
            severity="info" 
            action={
              <Button color="inherit" size="small">
                Contact Support
              </Button>
            }
          >
            Need help? Contact your SACCO administrator or check our help documentation.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDashboard;