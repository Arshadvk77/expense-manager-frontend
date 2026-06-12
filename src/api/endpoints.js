export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    ME: '/user',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    PASSWORD: '/user/password',
    PREFERENCES: '/user/preferences',
    CURRENCIES: '/user/currencies',
    DELETE: '/user',

  },
  TRANSACTIONS: {
    BASE: '/transactions',
    EXPORT: '/transactions/export',
  },
  CATEGORIES: {
    BASE: '/categories',
  },
  CURRENCY: {
    LIST: '/currencies',
    RATES: '/currencies/rates',
    CONVERT: '/currencies/convert',
  },
  DASHBOARD: { SUMMARY: '/dashboard/summary' },
  SAVINGS: { BASE: '/savings-plans' },
  CONTACT: { BASE: '/contact' },

  RECURRING: { BASE: '/recurring' },
  
  ADMIN: { CONTACT_MESSAGES: '/admin/contact-messages' },

};