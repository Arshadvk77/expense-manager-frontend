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
    IMPORT: '/transactions/import',
    IMPORT_TEMPLATE: '/transactions/import/template',
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
  REPORTS: { SUMMARY: '/reports/summary' },
  SAVINGS: { BASE: '/savings-plans', SUGGESTED: '/savings-plans/suggested' },
  CONTACT: { BASE: '/contact' },

  RECURRING: { BASE: '/recurring' },
  SPLITS: { BASE: '/splits', SEARCH_USERS: '/splits/search-users' },

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    CONTACT_MESSAGES: '/admin/contact-messages',
    STATS: '/admin/stats',
    USERS: '/admin/users',
  },

};