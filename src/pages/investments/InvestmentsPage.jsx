import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  useTheme
} from '@mui/material';
import {
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  AddRounded,
  ReceiptRounded
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';
import ShareCapitalProgress from '../../components/investments/ShareCapitalProgress';
import MonthlyInvestmentForm from '../../components/investments/MonthlyInvestmentForm';
import InvestmentHistory from '../../components/investments/InvestmentHistory';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`investment-tabpanel-${index}`}
      aria-labelledby={`investment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InvestmentsPage = () => {
  const theme = useTheme();
  const { isMember } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL params
  const typeParam = searchParams.get('type');
  const initialTab = typeParam === 'share_capital' ? 1 : 0;
  
  const [tabValue, setTabValue] = useState(initialTab);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update URL params
    if (newValue === 1) {
      setSearchParams({ type: 'share_capital' });
    } else {
      setSearchParams({});
    }
  };

  // Redirect non-members
  if (!isMember) {
    return (
      <Box>
        <Helmet>
          <title>Investments - {APP_NAME}</title>
        </Helmet>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Investment features are available to members only. Please contact an administrator to become a member.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Helmet>
        <title>My Investments - {APP_NAME}</title>
        <meta name="description" content="Manage your SACCO investments including share capital and monthly contributions" />
      </Helmet>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            My Investments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your SACCO investments
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setShowInvestmentForm(true)}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            borderRadius: 2,
            px: 3
          }}
        >
          Record Investment
        </Button>
      </Box>

      {/* Mobile Add Button */}
      <Button
        variant="contained"
        startIcon={<AddRounded />}
        fullWidth
        onClick={() => setShowInvestmentForm(true)}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          mb: 3,
          borderRadius: 2
        }}
      >
        Record Investment
      </Button>

      {/* Investment Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab 
              icon={<TrendingUpRounded />} 
              label="Monthly Investments" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<AccountBalanceWalletRounded />} 
              label="Share Capital" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Box>

        {/* Monthly Investments Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Monthly Investment Summary */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ReceiptRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Monthly Overview
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Track your monthly investment contributions and maintain eligibility for loans.
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Minimum monthly investment: KSH 1,000
                    </Alert>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AddRounded />}
                      onClick={() => setShowInvestmentForm(true)}
                    >
                      Record Investment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Investment History */}
              <Grid item xs={12} md={8}>
                <InvestmentHistory type="monthly" />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Share Capital Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Share Capital Progress */}
              <Grid item xs={12} md={6}>
                <ShareCapitalProgress />
              </Grid>

              {/* Share Capital Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      About Share Capital
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Share capital is a one-time investment of KSH 5,000 required for full membership benefits.
                    </Typography>
                    
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Fixed amount: KSH 5,000
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Non-refundable investment
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Flexible payment plans available
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Grants full membership benefits
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AddRounded />}
                      onClick={() => setShowInvestmentForm(true)}
                      sx={{ mt: 2 }}
                    >
                      Make Payment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Share Capital History */}
              <Grid item xs={12}>
                <InvestmentHistory type="share_capital" />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Card>

      {/* Investment Form Modal */}
      <MonthlyInvestmentForm
        open={showInvestmentForm}
        onClose={() => setShowInvestmentForm(false)}
        investmentType={tabValue === 1 ? 'share_capital' : 'monthly'}
      />

      {/* Help Information */}
      <Alert severity="info">
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Investment Guidelines:
        </Typography>
        <Typography variant="body2">
          • All investments require admin verification before being credited to your account
          • Upload clear photos of your M-Pesa transaction receipts
          • Monthly investments must be at least KSH 1,000
          • Share capital payments contribute to your KSH 5,000 membership requirement
        </Typography>
      </Alert>
    </Box>
  );
};

export default InvestmentsPage;