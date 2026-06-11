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
    PROFILE: '/profile',
    UPDATE_PROFILE: '/profile/update',
    CHANGE_PASSWORD: '/change-password',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    EXPORT: '/transactions/export',
  },
  CURRENCY: {
    RATES: '/currency/rates',
    CONVERT: '/currency/convert',
  },
};