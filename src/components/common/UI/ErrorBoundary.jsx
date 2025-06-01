import React from 'react';
import { Box, Typography, Button, Alert, Container } from '@mui/material';
import { RefreshRounded, HomeRounded } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }

    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              gap: 3,
              p: 3
            }}
          >
            <Typography variant="h3" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              We're sorry, but something unexpected happened.
            </Typography>

            <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
              <Typography variant="body2">
                The application encountered an error and couldn't continue. 
                Please try refreshing the page or go back to the dashboard.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshRounded />}
                onClick={this.handleRefresh}
                color="primary"
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeRounded />}
                onClick={this.handleGoHome}
                color="primary"
              >
                Go to Dashboard
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  width: '100%',
                  maxWidth: 800,
                  textAlign: 'left'
                }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;