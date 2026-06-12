import { useState, useEffect } from 'react';
import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { RATES, toINR, fmt } from '../lib/currency.js';
import { transactionsAPI } from '../api/transactions'; // 👉 adjust path
import { categoriesAPI } from '../api/categories';
import '../styles/main.scss';

const CURRENCIES = ['AED', 'OMR', 'SAR', 'QAR', 'USD'];
const today = () => new Date().toISOString().slice(0, 10);

export default function AddIncome() {
  const { ccy } = usePage();
  const navigate = useNavigate();

  const [amount, setAmount]         = useState('');
  const [currency, setCurrency]     = useState(ccy || 'AED');
  const [categoryId, setCategoryId] = useState(null);
  const [source, setSource]         = useState('');
  const [date, setDate]             = useState(today());
  const [note, setNote]             = useState('');

  const [categories, setCategories]   = useState([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    categoriesAPI.list({ type: 'income' })
      .then(res => setCategories((res.categories || []).filter(c => c.parent_id === null)))
      .catch(() => setCategories([]));
  }, []);

  const amountNum = parseFloat(amount) || 0;

  async function save() {
    setError('');
    setFieldErrors({});

    if (amountNum <= 0) {
      setFieldErrors({ amount: 'Enter an amount greater than 0.' });
      return;
    }

    setSaving(true);
    try {
      await transactionsAPI.create({
        type: 'income',
        amount: amountNum,
        currency,
        category_id: categoryId,
        date,
        source: source || null,
        note: note || null,
      });
      navigate('/transactions');
    } catch (err) {
      if (err.errors) {
        setFieldErrors(Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
        ));
      }
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar title="Add income" sub="Log money in — salary, freelance, or a transfer.">
        <button className="btn ghost" onClick={() => navigate('/dashboard')} disabled={saving}>Cancel</button>
        <button className="btn pri" onClick={save} disabled={saving}>
          <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </Topbar>

      {error && (
        <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      <div className="cols-main">
        <div className="card card--flex-column">
          {/* Amount */}
          <div className="amount-section">
            <div className="muted text-small text-semibold">Amount</div>
            <div className="amount-display">
              <span className="mono amount-display__currency">{currency}</span>
              <input
                className="num"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ border: 0, outline: 'none', background: 'transparent', font: 'inherit', fontSize: 52, fontWeight: 800, flex: 1, minWidth: 0, color: 'var(--ink)' }}
              />
              <span className="mono amount-display__inr">≈ ₹{fmt(Math.round(toINR(amountNum, currency)))}</span>
            </div>
            {fieldErrors.amount && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.amount}</div>}

            <div className="currency-chips">
              {CURRENCIES.map(c => (
                <span key={c} className={`chip ${c === currency ? 'wine' : ''} cursor-pointer`} onClick={() => setCurrency(c)}>{c}</span>
              ))}
            </div>
          </div>

          {/* Income category */}
          <div>
            <div className="muted text-small text-semibold" style={{ marginBottom: 12 }}>Category</div>
            <div className="category-grid">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id === categoryId ? null : c.id)}
                  className={`card category-grid__button ${c.id === categoryId ? 'category-grid__button--active' : ''}`}
                >
                  <span className="m-ic" style={{ width: 32, height: 32, background: (c.color || '#888') + '22', color: c.color || 'var(--ink)' }}>
                    {(c.name || '?').charAt(0)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-muted text-small">No income categories yet — run the seeder or create one.</div>
              )}
            </div>
            {fieldErrors.category_id && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.category_id}</div>}
          </div>

          <hr className="hr" />

          {/* Fields */}
          <div className="form-grid">
            <div className="field">
              <label>Source</label>
              <input className="input" value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Salary — ADNOC" />
            </div>
            <div className="field">
              <label>Date</label>
              <input className="input" type="date" max={today()} value={date} onChange={e => setDate(e.target.value)} />
              {fieldErrors.date && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 4 }}>{fieldErrors.date}</div>}
            </div>
            <div className="field field--full-width">
              <label>Notes</label>
              <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. April salary · includes housing allowance" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="right-column">
          <div className="card inr-preview-card">
            <div className="inr-preview-card__label">Equivalent in INR</div>
            <div className="inr-preview-card__amount num">₹{fmt(Math.round(toINR(amountNum, currency)))}</div>
            <div className="inr-preview-card__rate mono">1 {currency} = ₹{(RATES[currency] ?? 0).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </>
  );
}