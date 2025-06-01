import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Helper method to handle API responses
  async handleResponse(response) {
    return response.data;
  }

  // Helper method to handle API errors
  handleError(error) {
    const message = error.response?.data?.message || 
                   error.response?.data?.detail ||
                   error.response?.data?.error ||
                   error.message ||
                   'An unexpected error occurred';
    
    console.error('API Error:', error);
    throw new Error(message);
  }

  // Generic GET request
  async get(endpoint, params = {}) {
    try {
      const response = await api.get(endpoint, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic POST request
  async post(endpoint, data = {}) {
    try {
      const response = await api.post(endpoint, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic PUT request
  async put(endpoint, data = {}) {
    try {
      const response = await api.put(endpoint, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic PATCH request
  async patch(endpoint, data = {}) {
    try {
      const response = await api.patch(endpoint, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete(endpoint) {
    try {
      const response = await api.delete(endpoint);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // File upload method
  async uploadFile(endpoint, formData, onUploadProgress = null) {
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.post('/auth/login/', credentials);
    
    // Store tokens and user data
    if (response.access) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData) {
    return this.post('/auth/register/', userData);
  }

  async verifyEmail(token) {
    return this.post('/auth/verify-email/', { token });
  }

  async logout() {
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  async getProfile() {
    return this.get('/auth/profile/');
  }

  async updateProfile(data) {
    return this.patch('/auth/profile/', data);
  }

  // Member management methods
  async getMembers(params = {}) {
    return this.get('/members/', params);
  }

  async getMemberDetails(memberId) {
    return this.get(`/members/${memberId}/`);
  }

  async inviteMember(invitationData) {
    return this.post('/members/invite/', invitationData);
  }

  async getMemberSummary(memberId = null) {
    const endpoint = memberId ? `/members/summary/${memberId}/` : '/members/summary/';
    return this.get(endpoint);
  }

  async getSaccoStats() {
    return this.get('/members/stats/');
  }

  async checkMemberEligibility(memberId = null) {
    const endpoint = memberId ? `/members/eligibility/${memberId}/` : '/members/eligibility/';
    return this.get(endpoint);
  }

  async updateMemberStatus(memberId, statusData) {
    return this.post(`/members/${memberId}/status/`, statusData);
  }

  // Investment methods
  async createShareCapitalPayment(paymentData) {
    return this.post('/investments/share-capital/', paymentData);
  }

  async createMonthlyInvestment(investmentData) {
    return this.post('/investments/monthly/', investmentData);
  }

  async getInvestments(params = {}) {
    return this.get('/investments/', params);
  }

  async verifyInvestment(investmentId, verificationData) {
    return this.post(`/investments/verify/${investmentId}/`, verificationData);
  }

  // Loan methods
  async applyForLoan(loanData) {
    return this.post('/loans/apply/', loanData);
  }

  async getLoans(params = {}) {
    return this.get('/loans/', params);
  }

  async reviewLoan(loanId, reviewData) {
    return this.post(`/loans/review/${loanId}/`, reviewData);
  }

  async disburseLoan(loanId, disbursementData) {
    return this.post(`/loans/disburse/${loanId}/`, disbursementData);
  }

  async createLoanRepayment(repaymentData) {
    return this.post('/loans/repay/', repaymentData);
  }

  async verifyRepayment(repaymentId, verificationData) {
    return this.post(`/loans/verify-repayment/${repaymentId}/`, verificationData);
  }

  // Notification methods
  async getNotifications(params = {}) {
    return this.get('/notifications/', params);
  }

  async markNotificationAsRead(notificationId) {
    return this.post(`/notifications/${notificationId}/read/`);
  }

  async markAllNotificationsAsRead() {
    return this.post('/notifications/mark-all-read/');
  }

  async getUnreadNotificationCount() {
    return this.get('/notifications/unread-count/');
  }

  // KYC methods
  async uploadKYCDocument(documentData) {
    return this.uploadFile('/auth/kyc/upload/', documentData);
  }

  // Dashboard data methods
  async getDashboardData() {
    return this.get('/members/dashboard/');
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  getUserType() {
    const user = this.getCurrentUser();
    return user?.user_type || null;
  }

  hasPermission(requiredPermission) {
    const userType = this.getUserType();
    const permissions = {
      SUPER_ADMIN: ['all'],
      ADMIN: ['manage_members', 'verify_transactions', 'manage_loans'],
      MEMBER: ['view_own_data', 'make_investments', 'apply_loans'],
      NON_MEMBER: ['apply_loans']
    };

    const userPermissions = permissions[userType] || [];
    return userPermissions.includes('all') || userPermissions.includes(requiredPermission);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export the axios instance for direct use if needed
export { api };