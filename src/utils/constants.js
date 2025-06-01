// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// App Configuration
export const APP_NAME = process.env.REACT_APP_NAME || 'KMS SACCO Management System';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';

// User Types
export const USER_TYPES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  NON_MEMBER: 'NON_MEMBER'
};

// User Type Labels
export const USER_TYPE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  NON_MEMBER: 'Non Member'
};

// Share Capital Packages
export const SHARE_CAPITAL_PACKAGES = {
  TWELVE_MONTH: '12_MONTH',
  TWENTY_FOUR_MONTH: '24_MONTH'
};

export const SHARE_CAPITAL_PACKAGE_LABELS = {
  '12_MONTH': '12 Month Package',
  '24_MONTH': '24 Month Package'
};

// Investment Status
export const INVESTMENT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

export const INVESTMENT_STATUS_LABELS = {
  PENDING: 'Pending Verification',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected'
};

// Loan Status
export const LOAN_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DISBURSED: 'DISBURSED',
  REPAID: 'REPAID'
};

export const LOAN_STATUS_LABELS = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DISBURSED: 'Disbursed',
  REPAID: 'Fully Repaid'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INVESTMENT_VERIFIED: 'INVESTMENT_VERIFIED',
  INVESTMENT_REJECTED: 'INVESTMENT_REJECTED',
  LOAN_APPROVED: 'LOAN_APPROVED',
  LOAN_REJECTED: 'LOAN_REJECTED',
  LOAN_DISBURSED: 'LOAN_DISBURSED',
  REPAYMENT_VERIFIED: 'REPAYMENT_VERIFIED',
  REPAYMENT_REJECTED: 'REPAYMENT_REJECTED',
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',
  ADMIN_TRANSACTION_ALERT: 'ADMIN_TRANSACTION_ALERT',
  WELCOME_MESSAGE: 'WELCOME_MESSAGE',
  SHARE_CAPITAL_REMINDER: 'SHARE_CAPITAL_REMINDER',
  MONTHLY_INVESTMENT_REMINDER: 'MONTHLY_INVESTMENT_REMINDER'
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// KYC Document Types
export const KYC_DOCUMENT_TYPES = {
  ID_FRONT: 'ID_FRONT',
  ID_BACK: 'ID_BACK',
  SELFIE_WITH_ID: 'SELFIE_WITH_ID'
};

export const KYC_DOCUMENT_LABELS = {
  ID_FRONT: 'ID Front',
  ID_BACK: 'ID Back',
  SELFIE_WITH_ID: 'Selfie with ID'
};

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_TYPES: process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
};

// SACCO Business Rules
export const SACCO_RULES = {
  SHARE_CAPITAL_AMOUNT: 5000,
  MINIMUM_MONTHLY_INVESTMENT: 1000,
  MEMBER_LOAN_INTEREST_RATE: 0.03, // 3% per month
  NON_MEMBER_LOAN_INTEREST_RATE: 0.10, // 10% per month
  MINIMUM_MEMBERSHIP_MONTHS: 6,
  CONSECUTIVE_CONTRIBUTIONS_REQUIRED: 3
};

// Currency
export const CURRENCY = {
  SYMBOL: process.env.REACT_APP_CURRENCY_SYMBOL || 'KSH',
  CODE: process.env.REACT_APP_CURRENCY || 'KSH'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

// Colors
export const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1'
};

// Routes
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  
  // Member routes
  MEMBERS: '/members',
  MEMBER_DETAILS: '/members/:id',
  INVITE_MEMBERS: '/invite-members',
  
  // Investment routes
  INVESTMENTS: '/investments',
  TRANSACTION_VERIFICATION: '/transaction-verification',
  
  // Loan routes
  LOANS: '/loans',
  LOAN_APPLICATION: '/loan-application',
  LOAN_MANAGEMENT: '/loan-management',
  
  // Profile routes
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  SUPER_ADMIN_DASHBOARD: '/super-admin'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  VERIFY_EMAIL: '/auth/verify-email/',
  PROFILE: '/auth/profile/',
  
  // Members
  MEMBERS: '/members/',
  MEMBER_INVITE: '/members/invite/',
  MEMBER_SUMMARY: '/members/summary/',
  MEMBER_STATS: '/members/stats/',
  MEMBER_ELIGIBILITY: '/members/eligibility/',
  
  // Investments
  SHARE_CAPITAL: '/investments/share-capital/',
  MONTHLY_INVESTMENT: '/investments/monthly/',
  INVESTMENTS: '/investments/',
  VERIFY_INVESTMENT: '/investments/verify/',
  
  // Loans
  LOANS: '/loans/',
  LOAN_APPLY: '/loans/apply/',
  LOAN_REVIEW: '/loans/review/',
  LOAN_DISBURSE: '/loans/disburse/',
  LOAN_REPAY: '/loans/repay/',
  
  // Notifications
  NOTIFICATIONS: '/notifications/',
  MARK_READ: '/notifications/:id/read/',
  UNREAD_COUNT: '/notifications/unread-count/'
};

// Status Colors
export const STATUS_COLORS = {
  PENDING: '#ed6c02',
  VERIFIED: '#2e7d32',
  REJECTED: '#d32f2f',
  APPROVED: '#2e7d32',
  DISBURSED: '#1976d2',
  REPAID: '#2e7d32'
};

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export default {
  API_BASE_URL,
  BACKEND_URL,
  APP_NAME,
  APP_VERSION,
  USER_TYPES,
  USER_TYPE_LABELS,
  SHARE_CAPITAL_PACKAGES,
  SHARE_CAPITAL_PACKAGE_LABELS,
  INVESTMENT_STATUS,
  INVESTMENT_STATUS_LABELS,
  LOAN_STATUS,
  LOAN_STATUS_LABELS,
  NOTIFICATION_TYPES,
  PRIORITY_LEVELS,
  KYC_DOCUMENT_TYPES,
  KYC_DOCUMENT_LABELS,
  FILE_UPLOAD,
  SACCO_RULES,
  CURRENCY,
  PAGINATION,
  BREAKPOINTS,
  COLORS,
  ROUTES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  STATUS_COLORS,
  THEME_CONFIG
};