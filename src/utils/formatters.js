import { CURRENCY } from './constants';

// Currency formatting
export const formatCurrency = (amount, options = {}) => {
  const {
    symbol = CURRENCY.SYMBOL,
    decimal = 2,
    showSymbol = true,
    locale = 'en-KE'
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${symbol} 0.00` : '0.00';
  }

  const number = parseFloat(amount);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(number);

  return showSymbol ? `${symbol} ${formatted}` : formatted;
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  const {
    decimal = 0,
    locale = 'en-KE'
  } = options;

  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(number);
};

// Percentage formatting
export const formatPercentage = (value, options = {}) => {
  const {
    decimal = 1,
    locale = 'en-KE'
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentage = parseFloat(value) * 100;
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(value);
};

// Date formatting
export const formatDate = (date, options = {}) => {
  const {
    format = 'default',
    locale = 'en-KE'
  } = options;

  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const formatOptions = {
    default: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    short: { 
      year: '2-digit', 
      month: 'numeric', 
      day: 'numeric' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    },
    monthYear: { 
      year: 'numeric', 
      month: 'long' 
    }
  };

  return new Intl.DateTimeFormat(locale, formatOptions[format] || formatOptions.default)
    .format(dateObj);
};

// Relative time formatting (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateObj, { format: 'short' });
};

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Kenya phone number formatting
  if (cleaned.startsWith('254')) {
    // +254 XXX XXX XXX
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.startsWith('0')) {
    // 0XXX XXX XXX
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

// Text truncation
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Title case formatting
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status formatting
export const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// User type formatting
export const formatUserType = (userType) => {
  const types = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MEMBER: 'Member',
    NON_MEMBER: 'Non Member'
  };
  
  return types[userType] || userType;
};

// Investment month formatting
export const formatInvestmentMonth = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return formatDate(date, { format: 'monthYear' });
};

// Duration formatting (for loan terms)
export const formatDuration = (months) => {
  if (!months) return '';
  
  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let result = `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    result += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  
  return result;
};

// Interest rate formatting
export const formatInterestRate = (rate) => {
  if (rate === null || rate === undefined) return '';
  
  const percentage = parseFloat(rate) * 100;
  return `${percentage.toFixed(1)}%`;
};

// Progress formatting
export const formatProgress = (current, total) => {
  if (!total || total === 0) return 0;
  
  const percentage = (current / total) * 100;
  return Math.min(100, Math.max(0, percentage));
};

// Export all formatters
export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  truncateText,
  capitalize,
  toTitleCase,
  formatFileSize,
  formatStatus,
  formatUserType,
  formatInvestmentMonth,
  formatDuration,
  formatInterestRate,
  formatProgress
};