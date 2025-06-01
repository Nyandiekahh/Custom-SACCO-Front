import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  TrendingUpRounded,
  TrendingDownRounded,
  MonetizationOnRounded,
  PeopleRounded,
  AccountBalanceWalletRounded,
  CreditCardRounded,
  AnalyticsRounded,
  PercentRounded
} from '@mui/icons-material';

import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  trendValue,
  progress,
  loading = false,
  onClick
}) => {
  const theme = useTheme();

  const getTrendColor = () => {
    if (!trend) return 'text.secondary';
    return trend === 'up' ? 'success.main' : 'error.main';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? (
      <TrendingUpRounded sx={{ fontSize: 16, mr: 0.5 }} />
    ) : (
      <TrendingDownRounded sx={{ fontSize: 16, mr: 0.5 }} />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={80} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {Icon && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: theme.palette[color]?.main + '20' || theme.palette.primary.main + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                sx={{
                  fontSize: 28,
                  color: theme.palette[color]?.main || theme.palette.primary.main
                }}
              />
            </Box>
          )}
        </Box>

        {/* Trend Indicator */}
        {(trend || trendValue) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: getTrendColor(),
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              {getTrendIcon()}
              {trendValue}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              vs last month
            </Typography>
          </Box>
        )}

        {/* Progress Bar */}
        {progress && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: theme.palette[color]?.main || theme.palette.primary.main
                }
              }}
            />
            {progress.label && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {progress.label}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StatsCards = ({ stats, loading = false, onCardClick }) => {
  const defaultStats = {
    totalMembers: 0,
    totalFunds: 0,
    totalInvestments: 0,
    outstandingLoans: 0,
    shareCapitalCollected: 0,
    interestEarned: 0,
    activeLoans: 0,
    memberGrowth: 0
  };

  const data = { ...defaultStats, ...stats };

  const cardConfigs = [
    {
      id: 'members',
      title: 'Total Members',
      value: formatNumber(data.totalMembers),
      subtitle: 'Active SACCO members',
      icon: PeopleRounded,
      color: 'primary',
      trend: data.memberGrowth > 0 ? 'up' : data.memberGrowth < 0 ? 'down' : null,
      trendValue: data.memberGrowth ? `+${data.memberGrowth}` : null
    },
    {
      id: 'funds',
      title: 'Total Funds',
      value: formatCurrency(data.totalFunds, { decimal: 0 }),
      subtitle: 'Available for operations',
      icon: MonetizationOnRounded,
      color: 'success',
      trend: 'up',
      trendValue: '+12.5%'
    },
    {
      id: 'investments',
      title: 'Monthly Investments',
      value: formatCurrency(data.totalInvestments, { decimal: 0 }),
      subtitle: 'This month\'s contributions',
      icon: TrendingUpRounded,
      color: 'info',
      progress: {
        percentage: Math.min((data.totalInvestments / (data.totalMembers * 1000)) * 100, 100),
        label: `Target: ${formatCurrency(data.totalMembers * 1000, { decimal: 0 })}`
      }
    },
    {
      id: 'loans',
      title: 'Outstanding Loans',
      value: formatCurrency(data.outstandingLoans, { decimal: 0 }),
      subtitle: `${data.activeLoans} active loans`,
      icon: CreditCardRounded,
      color: 'warning'
    },
    {
      id: 'shareCapital',
      title: 'Share Capital',
      value: formatCurrency(data.shareCapitalCollected, { decimal: 0 }),
      subtitle: 'Total collected',
      icon: AccountBalanceWalletRounded,
      color: 'secondary',
      progress: {
        percentage: Math.min((data.shareCapitalCollected / (data.totalMembers * 5000)) * 100, 100),
        label: `Target: ${formatCurrency(data.totalMembers * 5000, { decimal: 0 })}`
      }
    },
    {
      id: 'interest',
      title: 'Interest Earned',
      value: formatCurrency(data.interestEarned, { decimal: 0 }),
      subtitle: 'Total interest income',
      icon: PercentRounded,
      color: 'success',
      trend: 'up',
      trendValue: '+8.2%'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cardConfigs.map((config) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={config.id}>
          <StatCard
            {...config}
            loading={loading}
            onClick={() => onCardClick?.(config.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

// Individual stat card components for specific use cases
export const MemberStatsCard = ({ memberCount, growth, loading, onClick }) => (
  <StatCard
    title="Total Members"
    value={formatNumber(memberCount)}
    subtitle="Active SACCO members"
    icon={PeopleRounded}
    color="primary"
    trend={growth > 0 ? 'up' : growth < 0 ? 'down' : null}
    trendValue={growth ? `${growth > 0 ? '+' : ''}${growth}%` : null}
    loading={loading}
    onClick={onClick}
  />
);

export const FinancialStatsCard = ({ amount, title, subtitle, color = 'success', trend, loading, onClick }) => (
  <StatCard
    title={title}
    value={formatCurrency(amount, { decimal: 0 })}
    subtitle={subtitle}
    icon={MonetizationOnRounded}
    color={color}
    trend={trend?.direction}
    trendValue={trend?.value}
    loading={loading}
    onClick={onClick}
  />
);

export const ProgressStatsCard = ({ 
  current, 
  target, 
  title, 
  subtitle, 
  icon, 
  color = 'info', 
  loading, 
  onClick 
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  return (
    <StatCard
      title={title}
      value={formatCurrency(current, { decimal: 0 })}
      subtitle={subtitle}
      icon={icon}
      color={color}
      progress={{
        percentage: percentage,
        label: `Target: ${formatCurrency(target, { decimal: 0 })}`
      }}
      loading={loading}
      onClick={onClick}
    />
  );
};

export default StatsCards;