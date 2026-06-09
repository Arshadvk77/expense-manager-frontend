// Configuration utility to access environment variables
class Config {
  constructor() {
    this.env = import.meta.env;
  }

  get apiUrl() {
    return this.env.VITE_API_URL || 'http://localhost:8000/api';
  }

  get apiTimeout() {
    return parseInt(this.env.VITE_API_TIMEOUT) || 30000;
  }

  get appName() {
    return this.env.VITE_APP_NAME || 'Khaleej';
  }

  get isDevelopment() {
    return this.env.VITE_APP_ENV === 'development';
  }

  get isProduction() {
    return this.env.VITE_APP_ENV === 'production';
  }

  get isDebug() {
    return this.env.VITE_APP_DEBUG === 'true';
  }

  get defaultCurrency() {
    return this.env.VITE_DEFAULT_CURRENCY || 'AED';
  }

  get supportedCurrencies() {
    return this.env.VITE_SUPPORTED_CURRENCIES?.split(',') || ['AED', 'OMR', 'SAR', 'QAR'];
  }

  get enableSocialLogin() {
    return this.env.VITE_ENABLE_SOCIAL_LOGIN === 'true';
  }

  get enableAppleLogin() {
    return this.env.VITE_ENABLE_APPLE_LOGIN === 'true';
  }

  get enableGoogleLogin() {
    return this.env.VITE_ENABLE_GOOGLE_LOGIN === 'true';
  }

  get maxLoginAttempts() {
    return parseInt(this.env.VITE_MAX_LOGIN_ATTEMPTS) || 5;
  }

  get loginLockoutTime() {
    return parseInt(this.env.VITE_LOGIN_LOCKOUT_TIME) || 15;
  }

  get enableAnalytics() {
    return this.env.VITE_ENABLE_ANALYTICS === 'true';
  }

  get gaTrackingId() {
    return this.env.VITE_GA_TRACKING_ID;
  }

  get enableSentry() {
    return this.env.VITE_ENABLE_SENTRY === 'true';
  }

  get sentryDsn() {
    return this.env.VITE_SENTRY_DSN;
  }

  get cacheTTL() {
    return parseInt(this.env.VITE_CACHE_TTL) || 3600;
  }

  get rateRefreshInterval() {
    return parseInt(this.env.VITE_RATE_REFRESH_INTERVAL) || 5;
  }

  get itemsPerPage() {
    return parseInt(this.env.VITE_ITEMS_PER_PAGE) || 20;
  }

  get maxFileSize() {
    return parseInt(this.env.VITE_MAX_FILE_SIZE) || 5242880;
  }

  getAllowedFileTypes() {
    return this.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'];
  }

  // Helper method to log config in development
  logConfig() {
    if (this.isDevelopment && this.isDebug) {
      console.log('App Configuration:', {
        apiUrl: this.apiUrl,
        appName: this.appName,
        environment: this.env.VITE_APP_ENV,
        defaultCurrency: this.defaultCurrency,
        supportedCurrencies: this.supportedCurrencies,
        enableAnalytics: this.enableAnalytics,
      });
    }
  }
}

export default new Config();