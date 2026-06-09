// src/pages/Register.jsx (Simplified)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { Alert } from '../components/Alert';
import '../styles/main.scss';

export default function Register() {
  const navigate = useNavigate();
  const { register, error: authError, setError: setAuthError } = useAuth();
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  };

  const handleRegister = async (values) => {
    setIsLoading(true);
    setAlert(null);
    
    try {
      const result = await register(values);
      
      if (result.success) {
        // Navigate to currency setup instead of dashboard
        navigate('/setup/currency');
      } else {
        setAlert({
          type: 'error',
          message: result.error || 'Registration failed. Please try again.',
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(initialValues, handleRegister);

  return (
    <>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="auth-brand__orb auth-brand__orb--1" />
          <div className="auth-brand__orb auth-brand__orb--2" />

          <div className="auth-brand__logo">
            <div className="auth-brand__logo-icon">K</div>
            <div className="auth-brand__logo-text">Khaleej</div>
          </div>

          <div className="auth-brand__content">
            <div className="auth-brand__hero">
              Start your<br />ledger in<br />two minutes.
            </div>
            <p className="auth-brand__description">
              One account for every dirham earned and every rupee sent home. Free, no card required.
            </p>
          </div>

          <div className="auth-brand__features">
            <span>Bank-grade security</span>
            <span>·</span>
            <span>Live INR rates</span>
            <span>·</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        <div className="auth-form">
          <form onSubmit={handleSubmit} className="auth-form__container auth-form__container--wide">
            <div className="auth-form__badge">Get started</div>
            <h1 className="auth-form__title">Create your account</h1>

            {/* Full Name Field */}
            <div className="form-field">
              <label>Full name *</label>
              <input
                type="text"
                name="name"
                className={`form-input ${touched.name && errors.name ? 'form-input--error' : ''}`}
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                disabled={isSubmitting || isLoading}
              />
              {touched.name && errors.name && (
                <div className="form-field__error">{errors.name}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                className={`form-input ${touched.email && errors.email ? 'form-input--error' : ''}`}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                disabled={isSubmitting || isLoading}
              />
              {touched.email && errors.email && (
                <div className="form-field__error">{errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                className={`form-input ${touched.password && errors.password ? 'form-input--error' : ''}`}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a strong password"
                disabled={isSubmitting || isLoading}
              />
              {touched.password && errors.password && (
                <div className="form-field__error">{errors.password}</div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-field">
              <label>Confirm password *</label>
              <input
                type="password"
                name="password_confirmation"
                className={`form-input ${touched.password_confirmation && errors.password_confirmation ? 'form-input--error' : ''}`}
                value={values.password_confirmation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                disabled={isSubmitting || isLoading}
              />
              {touched.password_confirmation && errors.password_confirmation && (
                <div className="form-field__error">{errors.password_confirmation}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn pri lg"
              disabled={isSubmitting || isLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSubmitting || isLoading ? (
                <>
                  <span className="spinner"></span> Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            <div className="auth-form__footer">
              Already have an account?{' '}
              <a onClick={() => navigate('/')} className="auth-form__link">
                Sign in
              </a>
            </div>

            <div className="auth-form__legal">
              By continuing you agree to Khaleej's Terms and Privacy Policy.
            </div>
          </form>
        </div>
      </div>
    </>
  );
}