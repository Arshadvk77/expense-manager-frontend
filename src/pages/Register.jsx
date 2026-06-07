import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import '../styles/main.scss';

export default function Register() {
  const navigate = useNavigate();
  const { ccy, setCcy } = useApp();

  return (
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
        <div className="auth-form__container auth-form__container--wide">
          <div className="auth-form__badge">Get started</div>
          <h1 className="auth-form__title">Create your account</h1>

          <div className="form-field">
            <label>Full name</label>
            <input className="form-input" defaultValue="Rashid Ahmed" />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input className="form-input" type="email" defaultValue="rashid.a@khaleej.app" />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input className="form-input" type="password" defaultValue="••••••••••" />
          </div>

          <div className="form-field">
            <label>Primary currency</label>
            <div className="currency-grid">
              {['AED', 'OMR', 'SAR', 'QAR'].map(c => (
                <button
                  key={c}
                  onClick={() => setCcy(c)}
                  className={`currency-btn ${ccy === c ? 'currency-btn--active' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button className="btn pri lg" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center' }}>
            Create account
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
            Already have an account? <a onClick={() => navigate('/')} className="auth-form__link">Sign in</a>
          </div>

          <div className="auth-form__legal">
            By continuing you agree to Khaleej's Terms and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}