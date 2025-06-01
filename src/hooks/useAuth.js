import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { STORAGE_KEYS, USER_TYPES } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (userData && token) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(credentials);
      setUser(response.user);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(userData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  // Update user data
  const updateUser = useCallback((newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }, [user]);

  // Check user permissions
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const userType = user.user_type;
    
    // Super admin has all permissions
    if (userType === USER_TYPES.SUPER_ADMIN) return true;
    
    // Define permissions for each user type
    const permissions = {
      [USER_TYPES.ADMIN]: [
        'view_members',
        'verify_transactions',
        'manage_loans',
        'view_reports'
      ],
      [USER_TYPES.MEMBER]: [
        'view_own_profile',
        'make_investments',
        'apply_loans',
        'view_own_transactions'
      ],
      [USER_TYPES.NON_MEMBER]: [
        'apply_loans',
        'view_own_profile'
      ]
    };
    
    const userPermissions = permissions[userType] || [];
    return userPermissions.includes(permission);
  }, [user]);

  // Check if user can access route
  const canAccessRoute = useCallback((requiredUserTypes) => {
    if (!user) return false;
    
    if (Array.isArray(requiredUserTypes)) {
      return requiredUserTypes.includes(user.user_type);
    }
    
    return user.user_type === requiredUserTypes;
  }, [user]);

  // Get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`;
  }, [user]);

  // Get user initials
  const getUserInitials = useCallback(() => {
    if (!user) return '';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  }, [user]);

  // Check if email is verified
  const isEmailVerified = useCallback(() => {
    return user?.email_verified || false;
  }, [user]);

  // Check if user is active
  const isUserActive = useCallback(() => {
    return user?.is_active || false;
  }, [user]);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.verifyEmail(token);
      
      // Update user data to reflect email verification
      if (user) {
        updateUser({ email_verified: true, is_active: true });
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);

  return {
    // State
    user,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    
    // Computed values
    isAuthenticated: isAuthenticated(),
    hasPermission,
    canAccessRoute,
    getUserDisplayName: getUserDisplayName(),
    getUserInitials: getUserInitials(),
    isEmailVerified: isEmailVerified(),
    isUserActive: isUserActive(),
    
    // User type helpers
    isSuperAdmin: user?.user_type === USER_TYPES.SUPER_ADMIN,
    isAdmin: user?.user_type === USER_TYPES.ADMIN,
    isMember: user?.user_type === USER_TYPES.MEMBER,
    isNonMember: user?.user_type === USER_TYPES.NON_MEMBER,
    
    // Clear error
    clearError: () => setError(null)
  };
};