import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLogin } from '../utils/validators';
import { Alert } from '../components/Alert';
import '../styles/main.scss';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateLogin(values);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const result = await login(values);
      if (result.success) {
        setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setAlert({ type: 'error', message: result.error || 'Login failed.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

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
              Your money,<br />both sides<br />of the sea.
            </div>
            <p className="auth-brand__description">
              Track the salary you earn in the Gulf and the rupees that reach home — in one calm ledger.
            </p>
          </div>

          <div className="auth-brand__features">
            <span>AED · OMR · SAR · QAR</span>
            <span>·</span>
            <span>Live INR rates</span>
            <span>·</span>
            <span>Goal tracking</span>
          </div>
        </div>

        <div className="auth-form">
          <form onSubmit={handleSubmit} className="auth-form__container">
            <div className="auth-form__badge">Welcome back</div>
            <h1 className="auth-form__title">Sign in to your ledger</h1>

            {/* Email Field */}
            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                value={values.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <div className="form-field__error">{errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label className="form-field__row">
                <span>Password *</span>
                <a onClick={() => navigate('/forgot-password')} className="form-field__link">
                  Forgot?
                </a>
              </label>
              <input
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <div className="form-field__error">{errors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn pri lg"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isLoading ? (
                <><span className="spinner"></span> Signing in...</>
              ) : (
                'Continue'
              )}
            </button>

            <div className="divider">
              <div className="divider__line" />
              <span className="divider__text">or</span>
              <div className="divider__line" />
            </div>

            <button type="button" className="btn lg" style={{ width: '100%', justifyContent: 'center' }}>
              Continue with Apple
            </button>

            <div className="auth-form__footer">
              New to Khaleej?{' '}
              <a onClick={() => navigate('/register')} className="auth-form__link">
                Create an account
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}