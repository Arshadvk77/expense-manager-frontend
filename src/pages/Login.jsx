import { useNavigate } from 'react-router-dom';
import '../styles/main.scss';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="auth-wrap">
      {/* Brand panel */}
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

      {/* Form */}
      <div className="auth-form">
        <div className="auth-form__container">
          <div className="auth-form__badge">Welcome back</div>
          <h1 className="auth-form__title">Sign in to your ledger</h1>

          <div className="form-field">
            <label>Email</label>
            <input className="form-input" defaultValue="rashid.a@khaleej.app" />
          </div>

          <div className="form-field">
            <label className="form-field__row">
              <span>Password</span>
              <a className="form-field__link" onClick={() => navigate('/forgot')}>Forgot?</a>
            </label>
            <input className="form-input" type="password" defaultValue="••••••••••" />
          </div>

          <button className="btn pri lg" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center' }}>
            Continue
          </button>

          <div className="divider">
            <div className="divider__line" />
            <span className="divider__text">or</span>
            <div className="divider__line" />
          </div>

          <button className="btn lg" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center' }}>
            Continue with Apple
          </button>

          <div className="auth-form__footer">
            New to Khaleej? <a onClick={() => navigate('/register')} className="auth-form__link">Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}