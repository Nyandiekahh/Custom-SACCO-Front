import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/common/Layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/UI/LoadingSpinner';
import ErrorBoundary from './components/common/UI/ErrorBoundary';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MembersPage from './pages/members/MembersPage';
import MemberDetailsPage from './pages/members/MemberDetailsPage';
import InviteMembersPage from './pages/members/InviteMembersPage';
import InvestmentsPage from './pages/investments/InvestmentsPage';
import TransactionVerificationPage from './pages/investments/TransactionVerificationPage';
import LoansPage from './pages/loans/LoansPage';
import LoanApplicationPage from './pages/loans/LoanApplicationPage';
import LoanManagementPage from './pages/loans/LoanManagementPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Constants
import { USER_TYPES } from './utils/constants';

// Styles
import './App.css';
import './styles/globals.css';
import './styles/responsive.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#f44336',
      dark: '#c62828',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Toast configuration
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#4caf50',
      secondary: '#fff',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#f44336',
      secondary: '#fff',
    },
  },
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  
                  {/* Protected Routes with Layout */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    {/* Dashboard */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    
                    {/* Profile - Available to all authenticated users */}
                    <Route path="profile" element={<ProfilePage />} />
                    
                    {/* Member Management - Super Admin and Admin only */}
                    <Route path="members" element={
                      <ProtectedRoute allowedRoles={[USER_TYPES.SUPER_ADMIN, USER_TYPES.ADMIN]}>
                        <MembersPage />
                      </ProtectedRoute>
                    } />
                    <Route path="members/:id" element={
                      <ProtectedRoute allowedRoles={[USER_TYPES.SUPER_ADMIN, USER_TYPES.ADMIN]}>
                        <MemberDetailsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="invite-members" element={
                      <ProtectedRoute allowedRoles={[USER_TYPES.SUPER_ADMIN]}>
                        <InviteMembersPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Investments - Members can view own, Admins can verify */}
                    <Route path="investments" element={<InvestmentsPage />} />
                    <Route path="transaction-verification" element={
                      <ProtectedRoute allowedRoles={[USER_TYPES.SUPER_ADMIN, USER_TYPES.ADMIN]}>
                        <TransactionVerificationPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Loans - All authenticated users can access */}
                    <Route path="loans" element={<LoansPage />} />
                    <Route path="loan-application" element={<LoanApplicationPage />} />
                    <Route path="loan-management" element={
                      <ProtectedRoute allowedRoles={[USER_TYPES.SUPER_ADMIN, USER_TYPES.ADMIN]}>
                        <LoanManagementPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Box>
            </Router>
            
            {/* Toast Notifications */}
            <Toaster 
              toastOptions={toastOptions}
              containerStyle={{
                top: 80, // Account for header height
              }}
            />
            
            {/* React Query DevTools - Only in development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;