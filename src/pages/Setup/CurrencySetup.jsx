// src/pages/Setup/CurrencySetup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from '../../components/Alert';
import { Icon } from '../../components/Icon';
import '../../styles/setup.scss';
import apiClient from '../../api/client';

export default function CurrencySetup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mainCurrency, setmainCurrency]       = useState(
    user?.preferences?.main_currency ?? 'AED'    // pre-fill if returning user
  );
  const [additionalCurrencies, setAdditionalCurrencies] = useState(
    user?.preferences?.tracked_currencies ?? []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [alert, setAlert]           = useState(null);

  const allCurrencies = [
    { code: 'AED', name: 'UAE Dirham',          country: 'United Arab Emirates', flag: '🇦🇪', symbol: 'د.إ' },
    { code: 'USD', name: 'US Dollar',           country: 'United States',        flag: '🇺🇸', symbol: '$'   },
    { code: 'EUR', name: 'Euro',                country: 'European Union',        flag: '🇪🇺', symbol: '€'   },
    { code: 'GBP', name: 'British Pound',       country: 'United Kingdom',        flag: '🇬🇧', symbol: '£'   },
    { code: 'INR', name: 'Indian Rupee',        country: 'India',                 flag: '🇮🇳', symbol: '₹'   },
    { code: 'SAR', name: 'Saudi Riyal',         country: 'Saudi Arabia',          flag: '🇸🇦', symbol: '﷼'   },
    { code: 'OMR', name: 'Omani Rial',          country: 'Oman',                  flag: '🇴🇲', symbol: 'ر.ع.' },
    { code: 'QAR', name: 'Qatari Riyal',        country: 'Qatar',                 flag: '🇶🇦', symbol: 'ر.ق' },
    { code: 'KWD', name: 'Kuwaiti Dinar',       country: 'Kuwait',                flag: '🇰🇼', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar',      country: 'Bahrain',               flag: '🇧🇭', symbol: '.د.ب' },
    { code: 'TRY', name: 'Turkish Lira',        country: 'Turkey',                flag: '🇹🇷', symbol: '₺'   },
    { code: 'EGP', name: 'Egyptian Pound',      country: 'Egypt',                 flag: '🇪🇬', symbol: '£'   },
    { code: 'PKR', name: 'Pakistani Rupee',     country: 'Pakistan',              flag: '🇵🇰', symbol: '₨'   },
    { code: 'BDT', name: 'Bangladeshi Taka',    country: 'Bangladesh',            flag: '🇧🇩', symbol: '৳'   },
    { code: 'LKR', name: 'Sri Lankan Rupee',    country: 'Sri Lanka',             flag: '🇱🇰', symbol: 'Rs'  },
    { code: 'NPR', name: 'Nepalese Rupee',      country: 'Nepal',                 flag: '🇳🇵', symbol: 'रु'  },
    { code: 'PHP', name: 'Philippine Peso',     country: 'Philippines',           flag: '🇵🇭', symbol: '₱'   },
    { code: 'IDR', name: 'Indonesian Rupiah',   country: 'Indonesia',             flag: '🇮🇩', symbol: 'Rp'  },
    { code: 'MYR', name: 'Malaysian Ringgit',   country: 'Malaysia',              flag: '🇲🇾', symbol: 'RM'  },
    { code: 'SGD', name: 'Singapore Dollar',    country: 'Singapore',             flag: '🇸🇬', symbol: 'S$'  },
    { code: 'THB', name: 'Thai Baht',           country: 'Thailand',              flag: '🇹🇭', symbol: '฿'   },
    { code: 'VND', name: 'Vietnamese Dong',     country: 'Vietnam',               flag: '🇻🇳', symbol: '₫'   },
    { code: 'CNY', name: 'Chinese Yuan',        country: 'China',                 flag: '🇨🇳', symbol: '¥'   },
    { code: 'JPY', name: 'Japanese Yen',        country: 'Japan',                 flag: '🇯🇵', symbol: '¥'   },
    { code: 'KRW', name: 'South Korean Won',    country: 'South Korea',           flag: '🇰🇷', symbol: '₩'   },
    { code: 'AUD', name: 'Australian Dollar',   country: 'Australia',             flag: '🇦🇺', symbol: 'A$'  },
    { code: 'CAD', name: 'Canadian Dollar',     country: 'Canada',                flag: '🇨🇦', symbol: 'C$'  },
    { code: 'CHF', name: 'Swiss Franc',         country: 'Switzerland',           flag: '🇨🇭', symbol: 'Fr'  },
    { code: 'ZAR', name: 'South African Rand',  country: 'South Africa',          flag: '🇿🇦', symbol: 'R'   },
  ];

  const getCurrency = code => allCurrencies.find(c => c.code === code);

  const filteredCurrencies = allCurrencies.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCurrency = code => {
    if (!additionalCurrencies.includes(code) && code !== mainCurrency) {
      setAdditionalCurrencies(prev => [...prev, code]);
    }
  };

  const handleRemoveCurrency = code => {
    setAdditionalCurrencies(prev => prev.filter(c => c !== code));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setAlert(null);

    try {
      const { data } = await apiClient.post('/user/currencies', {
        main_currency:   mainCurrency,
        tracked_currencies: additionalCurrencies,
      });

      if (data.success) {
        navigate('/dashboard');
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to save currency preferences' });
      }
    } catch (error) {
      setAlert({
        type:    'error',
        message: error.response?.data?.message || 'An error occurred. Please try again.',
      });
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
          <div className="setup-progress">
            <div className="setup-progress__step setup-progress__step--active">1</div>
            <div className="setup-progress__line"></div>
            <div className="setup-progress__step">2</div>
          </div>
        </div>

        <div className="setup-content">
          <h1 className="setup-title">Choose your currencies</h1>
          <p className="setup-subtitle">
            Select the currencies you work with. You can always change these later in settings.
          </p>

          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          {/* Primary Currency */}
          <div className="currency-section">
            <label className="currency-section__label">
              Primary Currency <span className="required">*</span>
            </label>
            <p className="currency-section__hint">
              Used as the default in dashboards and reports.
            </p>

            <div className="currency-grid">
              {['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR', 'OMR', 'QAR'].map(code => {
                const currency = getCurrency(code);
                return (
                  <button
                    key={code}
                    onClick={() => setmainCurrency(code)}
                    className={`currency-card ${mainCurrency === code ? 'currency-card--active' : ''}`}
                  >
                    <div className="currency-card__flag">{currency?.flag}</div>
                    <div className="currency-card__code">{code}</div>
                    <div className="currency-card__name">{currency?.name}</div>
                    {mainCurrency === code && (
                      <div className="currency-card__check">
                        <Icon name="check" size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              className="btn ghost btn-full"
              onClick={() => document.getElementById('currency-search').scrollIntoView({ behavior: 'smooth' })}
            >
              <Icon name="search" size={16} /> View all {allCurrencies.length} currencies
            </button>
          </div>

          {/* Additional Currencies */}
          <div className="currency-section" id="currency-search">
            <label className="currency-section__label">Track additional currencies</label>
            <p className="currency-section__hint">Add currencies you frequently convert between (optional).</p>

            <div className="currency-search">
              <Icon name="search" size={18} />
              <input
                type="text"
                placeholder="Search by currency name, code, or country…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="currency-search__input"
              />
            </div>

            {additionalCurrencies.length > 0 && (
              <div className="selected-currencies">
                <div className="selected-currencies__label">Selected:</div>
                <div className="selected-currencies__list">
                  {additionalCurrencies.map(code => {
                    const currency = getCurrency(code);
                    return (
                      <span key={code} className="selected-currency">
                        {currency?.flag} {code}
                        <button onClick={() => handleRemoveCurrency(code)} className="selected-currency__remove">×</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="currency-list">
              {filteredCurrencies
                .filter(c => c.code !== mainCurrency && !additionalCurrencies.includes(c.code))
                .map(currency => (
                  <button
                    key={currency.code}
                    onClick={() => handleAddCurrency(currency.code)}
                    className="currency-list-item"
                  >
                    <div className="currency-list-item__flag">{currency.flag}</div>
                    <div className="currency-list-item__info">
                      <div className="currency-list-item__code">{currency.code}</div>
                      <div className="currency-list-item__name">{currency.name}</div>
                      <div className="currency-list-item__country">{currency.country}</div>
                    </div>
                    <div className="currency-list-item__add">
                      <Icon name="plus" size={20} />
                    </div>
                  </button>
                ))}

              {filteredCurrencies.length === 0 && (
                <div className="currency-list__empty">
                  <Icon name="search" size={48} />
                  <p>No currencies found</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="setup-actions">
            <button className="btn ghost" onClick={() => navigate('/dashboard')}>
              Skip for now
            </button>
            <button className="btn pri lg" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Continue to dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}