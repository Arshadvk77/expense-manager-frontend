import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { fmt } from '../lib/currency.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrencies } from '../hooks/useCurrencies.js';
import { transfersAPI } from '../api/transfers';
import '../styles/main.scss';

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => { if (!d) return ''; try { return new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

export default function Transfers() {
  const { user } = useAuth();
  const { currencies } = useCurrencies();

  const tracked = user?.preferences?.tracked_currencies?.length
    ? user.preferences.tracked_currencies
    : [user?.preferences?.main_currency || 'USD'];

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  function load() {
    setLoading(true);
    transfersAPI.list()
      .then((res) => setTransfers(res.transfers || []))
      .catch((err) => setError(err.message || 'Failed to load transfers.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function confirmDelete() {
    try { await transfersAPI.remove(confirmId); setConfirmId(null); load(); }
    catch (err) { setError(err.message || 'Could not delete.'); }
  }

  return (
    <>
      <Topbar title="Transfers" sub="Move money between your currencies — not income or expense.">
        <button className="btn pri" onClick={() => setShowForm(true)}><Icon name="plus" size={16} /> New transfer</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      {showForm && (
        <TransferForm
          tracked={tracked}
          currencies={currencies}
          defaultFrom={user?.preferences?.display_currency || user?.preferences?.main_currency || tracked[0]}
          defaultTo={user?.preferences?.main_currency || tracked[0]}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
          onError={setError}
        />
      )}

      <div className="card pad-lg">
        <div className="card-h"><div className="t">Transfer history</div></div>
        {loading && <div className="muted text-small" style={{ padding: 12 }}>Loading…</div>}
        {!loading && transfers.length === 0 && <div className="muted text-small" style={{ padding: 12 }}>No transfers yet.</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transfers.map((tr, i) => (
            <div key={tr.id} className="row between center" style={{ padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 0, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row center" style={{ gap: 8, flexWrap: 'wrap', fontWeight: 700, fontSize: 14 }}>
                  <span className="chip wine mono">{tr.from_currency}</span>
                  <span className="mono">{fmt(Number(tr.from_amount))}</span>
                  <Icon name="right" size={14} />
                  <span className="chip wine mono">{tr.to_currency}</span>
                  <span className="mono">{fmt(Number(tr.to_amount))}</span>
                </div>
                <div className="muted text-small" style={{ marginTop: 3 }}>
                  {fmtDate(tr.date)} · rate 1 {tr.from_currency} = {Number(tr.rate).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tr.to_currency}
                  {Number(tr.fee) > 0 && <> · fee {tr.fee_currency} {fmt(Number(tr.fee))}</>}
                  {tr.note && <> · {tr.note}</>}
                </div>
              </div>
              <button className="btn ghost text-small" style={{ color: 'var(--clay)', flexShrink: 0 }} onClick={() => setConfirmId(tr.id)}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmId != null}
        title="Delete this transfer?"
        message="The transfer and its fee expense (if any) will be removed. Your balances will adjust back."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}

function TransferForm({ tracked, currencies, defaultFrom, defaultTo, onClose, onSaved, onError }) {
  const [date, setDate] = useState(today());
  const [fromCur, setFromCur] = useState(defaultFrom || 'OMR');
  const [fromAmt, setFromAmt] = useState('');
  const [toCur, setToCur] = useState(defaultTo || 'INR');
  const [toAmt, setToAmt] = useState('');
  const [fee, setFee] = useState('');
  const [feeCur, setFeeCur] = useState(defaultFrom || 'OMR');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fa = parseFloat(fromAmt) || 0;
  const ta = parseFloat(toAmt) || 0;
  const rate = fa > 0 ? ta / fa : 0;

  const currencyOptions = () => {
    const codes = [...tracked, ...currencies.filter((c) => !tracked.includes(c.code)).map((c) => c.code)];
    return codes;
  };

  async function submit() {
    onError('');
    if (!(fa > 0)) return onError('Enter the amount you sent.');
    if (!(ta > 0)) return onError('Enter the amount received.');
    if (fromCur === toCur) return onError('From and to currencies must be different.');

    setSaving(true);
    try {
      await transfersAPI.create({
        date,
        from_currency: fromCur, from_amount: fa,
        to_currency: toCur, to_amount: ta,
        fee: parseFloat(fee) || 0,
        fee_currency: parseFloat(fee) > 0 ? feeCur : null,
        note: note || null,
      });
      onSaved();
    } catch (err) {
      onError((err.errors && Object.values(err.errors)[0]?.[0]) || err.message || 'Could not record the transfer.');
    } finally { setSaving(false); }
  }

  const CurSelect = ({ value, onChange }) => (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 100 }}>
      {currencyOptions().map((code) => <option key={code} value={code}>{code}</option>)}
    </select>
  );

  return (
    <div className="card pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="text-semibold" style={{ fontSize: 15 }}>New transfer</div>

      {/* FROM */}
      <div className="field">
        <label>You sent</label>
        <div className="row center" style={{ gap: 8 }}>
          <CurSelect value={fromCur} onChange={setFromCur} />
          <input className="input" type="number" min="0" step="0.01" value={fromAmt} onChange={(e) => setFromAmt(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
        </div>
      </div>

      {/* TO */}
      <div className="field">
        <label>They received</label>
        <div className="row center" style={{ gap: 8 }}>
          <CurSelect value={toCur} onChange={setToCur} />
          <input className="input" type="number" min="0" step="0.01" value={toAmt} onChange={(e) => setToAmt(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
        </div>
      </div>

      {/* derived rate */}
      {rate > 0 && (
        <div className="muted text-small">
          Rate: 1 {fromCur} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCur}
        </div>
      )}

      {/* FEE */}
      <div className="field">
        <label>Remittance fee (optional)</label>
        <div className="row center" style={{ gap: 8 }}>
          <CurSelect value={feeCur} onChange={setFeeCur} />
          <input className="input" type="number" min="0" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
        </div>
        <div className="muted text-small" style={{ marginTop: 4 }}>The fee is logged as a real expense in your spending.</div>
      </div>

      {/* DATE */}
      <div className="field">
        <label>Date</label>
        <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '0 12px', position: 'relative', minHeight: 42 }}
          onClick={(e) => { const inp = e.currentTarget.querySelector('input'); inp?.showPicker?.() || inp?.focus(); }}>
          <Icon name="cal" size={17} />
          <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: date ? 'var(--ink)' : 'var(--muted)' }}>
            {date ? fmtDate(date) : 'Pick a date'}
          </span>
          <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 0 }} />
        </div>
      </div>

      <div className="field">
        <label>Note (optional)</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sent home via Al Ansari" />
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn pri" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Record transfer'}</button>
      </div>
    </div>
  );
}