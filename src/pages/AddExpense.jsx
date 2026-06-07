import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { RATES, SYMBOL, toINR, fmt } from '../lib/currency.js';
import '../styles/main.scss';

export default function AddExpense() {
  const { ccy } = usePage();
  const navigate = useNavigate();
  const amount = 312;

  const cats = [
    { id: 'rent', label: 'Rent', g: 'R', ic: 'plum' },
    { id: 'food', label: 'Food', g: 'F', ic: 'gold', on: true },
    { id: 'travel', label: 'Travel', g: 'T', ic: 'teal' },
    { id: 'shop', label: 'Shopping', g: 'S', ic: 'clay' },
    { id: 'family', label: 'Family', g: 'H', ic: 'wine' },
    { id: 'other', label: 'Other', g: '•', ic: 'green' },
  ];

  return (
    <>
      <Topbar title="Log an expense" sub="Tap a category, set the amount, done in seconds.">
        <button className="btn btn--ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
        <button className="btn btn--primary" onClick={() => navigate('/transactions')}>
          <Icon name="check" size={16} /> Save
        </button>
      </Topbar>

      <div className="cols-main">
        {/* Left column - Form */}
        <div className="card card--padding-large" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Amount section */}
          <div>
            <div className="text-muted text-small text-semibold">Amount</div>
            <div className="amount-row">
              <span className="amount-row__currency mono">{ccy}</span>
              <span className="amount-row__value num">
                {fmt(amount)}<span className="amount-row__value-cents">.00</span>
              </span>
              <span className="amount-row__inr mono">≈ ₹{fmt(Math.round(toINR(amount, ccy)))}</span>
            </div>
          </div>

          {/* Category section */}
          <div>
            <div className="text-muted text-small text-semibold" style={{ marginBottom: 12 }}>Category</div>
            <div className="category-grid">
              {cats.map(c => (
                <button 
                  key={c.id} 
                  className={`card category-grid__button ${c.on ? 'category-grid__button--active' : ''}`}
                >
                  <span className={`m-ic ic ${c.ic}`} style={{ width: 32, height: 32 }}>{c.g}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="hr" />

          {/* Details grid */}
          <div className="grid grid-2cols">
            <div className="form-field">
              <label>Date</label>
              <div className="form-input form-input--with-icon">
                <span>8 April 2026</span>
                <Icon name="cal" size={15} />
              </div>
            </div>
            <div className="form-field">
              <label>Payment</label>
              <div className="form-input form-input--with-icon">
                <span>Card · Emirates NBD</span>
                <Icon name="down" size={15} />
              </div>
            </div>
            <div className="form-field form-field--full-width">
              <label>Notes</label>
              <input className="form-input" defaultValue="Carrefour weekly groceries" />
            </div>
          </div>
        </div>

        {/* Right column - Budget info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Budget card */}
          <div className="card card--padding-large">
            <div className="card-header">
              <div className="card-header__title">Food budget · April</div>
              <span className="chip chip--gold">69%</span>
            </div>
            <div className="budget-stats">
              <span className="budget-stats__amount num">AED 1,240</span>
              <span className="budget-stats__total mono">of 1,800</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill progress-bar__fill--gold" style={{ width: '69%' }} />
            </div>
            <div className="budget-footer">
              <span>AED 560 left</span>
              <span>22 days</span>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card card--padding-large">
            <div className="card-header__title" style={{ marginBottom: 4 }}>Recent in Food</div>
            {[['Carrefour, MoE', 287, 'Apr 1'], ['Spinneys, JLT', 198, 'Mar 28'], ['Talabat dinner', 76, 'Mar 26']].map((r, i) => (
              <div key={i} className="recent-item">
                <div>
                  <div className="recent-item__title">{r[0]}</div>
                  <div className="recent-item__date">{r[2]}</div>
                </div>
                <span className="recent-item__amount num">AED {fmt(r[1])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}