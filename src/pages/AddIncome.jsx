import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { RATES, SYMBOL, toINR, fmt } from '../lib/currency.js';

export default function AddIncome() {
  const { ccy } = usePage();
  const navigate = useNavigate();
  const amount = 11000;

  return (
    <>
      <Topbar title="Add income" sub="Log money in — salary, freelance, or a transfer.">
        <button className="btn ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
        <button className="btn pri" onClick={() => navigate('/transactions')}>
          <Icon name="check" size={16} /> Save
        </button>
      </Topbar>

      <div className="cols-main">
        {/* Form */}
        <div className="card card--flex-column">
          {/* Amount Section */}
          <div className="amount-section">
            <div className="muted text-small text-semibold">Amount</div>
            <div className="amount-display">
              <span className="mono amount-display__currency">{ccy}</span>
              <span className="num amount-display__value">
                {fmt(amount)}<span className="amount-display__cents">.00</span>
              </span>
              <span className="mono amount-display__inr">
                ≈ ₹{fmt(Math.round(toINR(amount, ccy)))}
              </span>
            </div>
            <div className="currency-chips">
              {['AED', 'OMR', 'SAR', 'QAR'].map(c => (
                <span 
                  key={c} 
                  className={`chip ${c === ccy ? 'wine' : ''} cursor-pointer`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <hr className="hr" />

          {/* Form Fields Grid */}
          <div className="form-grid">
            <div className="field">
              <label>Source</label>
              <div className="input select-input">
                <span>Salary — ADNOC</span>
                <Icon name="down" size={15} />
              </div>
            </div>
            <div className="field">
              <label>Date</label>
              <div className="input select-input">
                <span>1 April 2026</span>
                <Icon name="cal" size={15} />
              </div>
            </div>
            <div className="field field--full-width">
              <label>Notes</label>
              <input className="input" defaultValue="April salary · includes housing allowance" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn ghost text-small">
              <Icon name="recur" size={14} /> Repeat monthly
            </button>
            <button className="btn ghost text-small">
              Attach receipt
            </button>
          </div>
        </div>

        {/* Right Column - INR Preview & Stats */}
        <div className="right-column">
          {/* INR Preview Card */}
          <div className="card inr-preview-card">
            <div className="inr-preview-card__label">Equivalent in INR</div>
            <div className="inr-preview-card__amount num">
              ₹{fmt(Math.round(toINR(amount, ccy)))}
            </div>
            <div className="inr-preview-card__rate mono">
              1 {ccy} = ₹{RATES[ccy].toFixed(2)}
            </div>
            <div className="inr-preview-card__lock">
              <span>Lock this rate</span>
              <span className="toggle-small toggle-small--on">
                <span className="toggle-small__knob toggle-small__knob--on" />
              </span>
            </div>
          </div>

          {/* Monthly Stats Card */}
          <div className="card">
            <div className="muted text-small text-semibold">This month so far</div>
            {[
              ['Income', 14500], 
              ['+ this entry', amount, true], 
              ['New total', 14500 + amount, false, true]
            ].map((r, i) => (
              <div 
                key={i} 
                className={`stats-row ${i === 2 ? 'stats-row--highlight' : ''} ${i === 2 ? 'stats-row--with-border' : ''}`}
              >
                <span className="mono stats-row__label">{r[0]}</span>
                <span className={`num stats-row__value ${r[2] ? 'stats-row__value--positive' : ''}`}>
                  {r[2] ? '+ ' : ''}{ccy} {fmt(r[1])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}