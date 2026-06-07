import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/main.scss';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle password reset logic
        setSubmitted(true);
    };

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
                        Reset your<br />password
                    </div>
                    <p className="auth-brand__description">
                        We'll send you a link to reset your password and get back to managing your finances.
                    </p>
                </div>

                <div className="auth-brand__features">
                    <span>24/7 Support</span>
                    <span>·</span>
                    <span>Secure reset</span>
                    <span>·</span>
                    <span>Quick recovery</span>
                </div>
            </div>

            <div className="auth-form">
                <div className="auth-form__container auth-form__container--narrow">
                    {!submitted ? (
                        <>
                            <div className="auth-form__badge">Need help?</div>
                            <h1 className="auth-form__title">Forgot password?</h1>

                            <p className="auth-form__subtitle">
                                Enter your email address and we'll send you instructions to reset your password.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-field">
                                    <label>Email address</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="rashid.a@khaleej.app"
                                        required
                                    />
                                </div>

                                <button className="btn pri lg" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center' }}>
                                    Send reset link
                                </button>
                            </form>

                            <div className="divider">
                                <div className="divider__line" />
                                <span className="divider__text">or</span>
                                <div className="divider__line" />
                            </div>

                            <div className="auth-form__footer">
                                Remember your password? <a onClick={() => navigate('/')} className="auth-form__link">Back to sign in</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="auth-form__badge">Check your email</div>
                            <h1 className="auth-form__title">Reset link sent</h1>

                            <p className="auth-form__subtitle">
                                We've sent a password reset link to <strong>{email}</strong>.
                                Please check your inbox and follow the instructions.
                            </p>

                            <button className="btn btn--primary btn--large btn--full" onClick={() => navigate('/')}>
                                Return to sign in
                            </button>

                            <div className="auth-form__footer">
                                Didn't receive the email? <a onClick={() => setSubmitted(false)} className="auth-form__link">Try again</a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}