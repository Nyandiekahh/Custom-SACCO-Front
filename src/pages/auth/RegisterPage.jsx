import React from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import RegisterForm from '../../components/auth/RegisterForm';
import { useAuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/UI/LoadingSpinner';
import { APP_NAME } from '../../utils/constants';

const RegisterPage = () => {
  const { isAuthenticated, loading } = useAuthContext();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Create Account - {APP_NAME}</title>
        <meta name="description" content="Create your SACCO account to start managing your investments and loans." />
      </Helmet>
      <RegisterForm />
    </>
  );
};

export default RegisterPage;