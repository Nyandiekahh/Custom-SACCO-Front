import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import LoginForm from '../../components/auth/LoginForm';
import { useAuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/UI/LoadingSpinner';
import { APP_NAME } from '../../utils/constants';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuthContext();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Sign In - {APP_NAME}</title>
        <meta name="description" content="Sign in to your SACCO account to manage your investments, loans, and profile." />
      </Helmet>
      <LoginForm />
    </>
  );
};

export default LoginPage;