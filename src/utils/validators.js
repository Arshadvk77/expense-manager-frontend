export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, length, fieldName = 'This field') => {
    if (value && value.length < length) {
      return `${fieldName} must be at least ${length} characters`;
    }
    return null;
  },

  maxLength: (value, length, fieldName = 'This field') => {
    if (value && value.length > length) {
      return `${fieldName} must not exceed ${length} characters`;
    }
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(value)) return 'Password must contain at least one special character (!@#$%^&*)';
    return null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  currency: (value) => {
    const currencies = ['AED', 'OMR', 'SAR', 'QAR'];
    if (value && !currencies.includes(value)) {
      return 'Please select a valid currency';
    }
    return null;
  },
};

export const validateField = (fieldName, value, formData = {}) => {
  const validationRules = {
    name: [
      (v) => validators.required(v, 'Full name'),
      (v) => validators.minLength(v, 2, 'Full name'),
      (v) => validators.maxLength(v, 255, 'Full name'),
    ],
    email: [
      (v) => validators.required(v, 'Email'),
      (v) => validators.email(v),
      (v) => validators.maxLength(v, 255, 'Email'),
    ],
    password: [
      (v) => validators.password(v),
    ],
    password_confirmation: [
      (v) => validators.confirmPassword(formData.password, v),
    ],
    currency: [
      (v) => validators.currency(v),
    ],
  };

  const rules = validationRules[fieldName];
  if (!rules) return null;

  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

export const validateForm = (formData) => {
  const errors = {};
  
  errors.name = validateField('name', formData.name);
  errors.email = validateField('email', formData.email);
  errors.password = validateField('password', formData.password);
  errors.password_confirmation = validateField('password_confirmation', formData.password_confirmation, formData);
  errors.currency = validateField('currency', formData.currency);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Add these validation rules
export const validateLogin = (formData) => {
  const errors = {};
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};