// src/pages/Setup/CurrencySetup.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCurrencies } from '../../hooks/useCurrencies.js';
import { Alert } from '../../components/Alert';
import { Icon } from '../../components/Icon';
import apiClient from '../../api/client';
import '../../styles/setup.scss';

// small set of popular codes to surface as quick-pick tiles
const POPULAR = ['INR', 'AED', 'OMR', 'SAR', 'QAR', 'USD', 'GBP', 'EUR'];

export default function CurrencySetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { currencies } = useCurrencies(); // full list from backend

  // if they already set a home currency, this step is done — leave
  useEffect(() => {
    if (user?.preferences?.main_currency) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [mainCurrency, setMainCurrency] = useState(user?.preferences?.main_currency || '');
  const [tracked, setTracked] = useState(user?.preferences?.tracked_currencies || []);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const getCcy = (code) => currencies.find((c) => c.code === code);

  // popular tiles that actually exist in the backend list
  const popularAvailable = POPULAR.filter((code) => currencies.some((c) => c.code === code));

  const filtered = currencies.filter((c) => {
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q);
  });

  const toggleTracked = (code) => {
    if (code === mainCurrency) return; // home is always tracked, can't toggle
    setTracked((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const handleSubmit = async () => {
    if (!mainCurrency) {
      setAlert({ type: 'error', message: 'Please choose your home currency first.' });
      return;
    }
    setIsLoading(true);
    setAlert(null);

    // home currency is always part of tracked
    const finalTracked = tracked.includes(mainCurrency) ? tracked : [mainCurrency, ...tracked];

    try {
      const { data } = await apiClient.post('/user/currencies', {
        main_currency: mainCurrency,
        tracked_currencies: finalTracked,
      });

      if (data.success) {
        // keep local user in sync so guards see the new currency immediately
        updateUser?.({
          ...user,
          preferences: { ...(user?.preferences || {}), main_currency: mainCurrency, tracked_currencies: finalTracked },
        });
        navigate('/dashboard', { replace: true });
      } else {
        setAlert({ type: 'error', message: data.message || 'Could not save your currencies.' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-wrap">
      <div className="setup-container">
        <div className="setup-header">
          <div className="setup-logo">
            <div className="setup-logo__icon">K</div>
            <div className="setup-logo__text">Khaleej</div>
          </div>
        </div>

        <div className="setup-content">
          <h1 className="setup-title">Set up your currencies</h1>
          <p className="setup-subtitle">
            Two quick steps — pick your home currency, then any others you use day to day.
          </p>

          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          {/* STEP 1 — Home currency */}
          <div className="currency-section">
            <label className="currency-section__label">
              1 · Your home currency <span className="required">*</span>
            </label>
            <p className="currency-section__hint">
              Everything is anchored to this. <strong>It can’t be changed later</strong>, so pick the country you call home.
            </p>

            <div className="currency-grid">
              {popularAvailable.map((code) => {
                const c = getCcy(code);
                return (
                  <button
                    key={code}
                    onClick={() => setMainCurrency(code)}
                    className={`currency-card ${mainCurrency === code ? 'currency-card--active' : ''}`}
                  >
                    <div className="currency-card__code">{code}</div>
                    <div className="currency-card__name">{c?.name}</div>
                    {mainCurrency === code && (
                      <div className="currency-card__check"><Icon name="check" size={16} /></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* full-list dropdown for anything not in the popular tiles */}
            <select
              className="form-input"
              style={{ marginTop: 10 }}
              value={popularAvailable.includes(mainCurrency) ? '' : mainCurrency}
              onChange={(e) => e.target.value && setMainCurrency(e.target.value)}
            >
              <option value="">Or pick another currency…</option>
              {currencies
                .filter((c) => !popularAvailable.includes(c.code))
                .map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name} {c.flag}</option>
                ))}
            </select>
          </div>

          {/* STEP 2 — Other currencies (optional) */}
          <div className="currency-section">
            <label className="currency-section__label">2 · Other currencies you use</label>
            <p className="currency-section__hint">Optional — these show as quick shortcuts when adding a transaction.</p>

            {/* selected chips */}
            <div className="selected-currencies">
              <div className="selected-currencies__list">
                {mainCurrency && (
                  <span className="selected-currency" style={{ opacity: 0.7 }}>
                    {mainCurrency} · home
                  </span>
                )}
                {tracked.filter((c) => c !== mainCurrency).map((code) => (
                  <span key={code} className="selected-currency">
                    {code}
                    <button onClick={() => toggleTracked(code)} className="selected-currency__remove">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="currency-search">
              <Icon name="search" size={18} />
              <input
                type="text"
                placeholder="Search by code or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="currency-search__input"
              />
            </div>

            {search.trim() && (
              <div className="currency-list">
                {filtered
                  .filter((c) => c.code !== mainCurrency && !tracked.includes(c.code))
                  .slice(0, 40)
                  .map((c) => (
                    <button key={c.code} onClick={() => { toggleTracked(c.code); setSearch(''); }} className="currency-list-item">
                      <div className="currency-list-item__info">
                        <div className="currency-list-item__code">{c.code} {c.flag}</div>
                        <div className="currency-list-item__name">{c.name}</div>
                      </div>
                      <div className="currency-list-item__add"><Icon name="plus" size={20} /></div>
                    </button>
                  ))}
                {filtered.length === 0 && (
                  <div className="currency-list__empty"><p>No currencies found</p></div>
                )}
              </div>
            )}
          </div>

          {/* Action — no skip, setup is required */}
          <div className="setup-actions">
            <button className="btn pri lg btn-full" onClick={handleSubmit} disabled={isLoading || !mainCurrency}>
              {isLoading ? 'Saving…' : 'Continue to dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}