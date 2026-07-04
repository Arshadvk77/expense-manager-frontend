import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Toggle } from '../components/Toggle.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { transactionsAPI } from '../api/transactions';
import { recurringAPI } from '../api/recurring';
import { categoriesAPI } from '../api/categories';
import { transfersAPI } from '../api/transfers';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrencies } from '../hooks/useCurrencies.js';
import { ColorRow } from '../components/ColorRow.jsx';
import { Alert } from '../components/Alert';
import { fmt } from '../lib/currency.js';
import '../styles/main.scss';

const FREQS = ['daily', 'weekly', 'monthly', 'yearly'];
const CAT_COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#ca8a04', '#dc2626', '#db2777', '#475569'];
const FALLBACK_TRACKED = ['USD'];
const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ mode = 'add', defaultType = 'expense' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const { user } = useAuth();
  const { currencies } = useCurrencies();

  const trackedCodes = user?.preferences?.tracked_currencies?.length
    ? user.preferences.tracked_currencies
    : FALLBACK_TRACKED;

  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState(null);
  const [currency, setCurrency] = useState(
    user?.preferences?.display_currency
    || user?.preferences?.main_currency
    || trackedCodes[0]
    || 'USD'
  );
  const [categoryId, setCategoryId] = useState(null);
  const [date, setDate] = useState(today());
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');

  // recurring (add mode only)
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [interval, setIntervalN] = useState(1);
  const [ends, setEnds] = useState('never');
  const [endDate, setEndDate] = useState('');
  const [maxOcc, setMaxOcc] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // category create
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CAT_COLORS[0]);
  const [creatingCat, setCreatingCat] = useState(false);

  // category edit/delete
  const [editCatId, setEditCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState(CAT_COLORS[0]);
  const [savingCat, setSavingCat] = useState(false);
  const [confirmCatId, setConfirmCatId] = useState(null);

  const homeCcy = user?.preferences?.main_currency;

  // preferred-rate prefs (used only as a hint on the form)
  const displayCcy      = user?.preferences?.display_currency;
  const displayRatePref = Number(user?.preferences?.display_rate_pref) || 0; // 1 display = X home
  const displayUseLive  = user?.preferences?.display_use_live ?? false;

  // exchange rate state
  const [liveRate, setLiveRate] = useState(null);
  const [customRate, setCustomRate] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  // --- TRANSFER state ---
  const [trFromCur, setTrFromCur] = useState(user?.preferences?.display_currency || homeCcy || trackedCodes[0] || 'OMR');
  const [trFromAmt, setTrFromAmt] = useState('');
  const [trToCur, setTrToCur]     = useState(homeCcy || trackedCodes[0] || 'INR');
  const [trToAmt, setTrToAmt]     = useState('');
  const [trFee, setTrFee]         = useState('');
  const [trFeeCur, setTrFeeCur]   = useState(user?.preferences?.display_currency || homeCcy || trackedCodes[0] || 'OMR');

  const isTransfer = type === 'transfer';

  useEffect(() => {
    if (isEdit) return;
    const pref = user?.preferences?.display_currency || user?.preferences?.main_currency;
    if (pref) {
      setCurrency(pref);
      setTrFromCur(pref);
      setTrFeeCur(pref);
    }
    if (homeCcy) setTrToCur(homeCcy);
  }, [isEdit, user?.preferences?.display_currency, user?.preferences?.main_currency]); // eslint-disable-line

  // load existing transaction for edit
  useEffect(() => {
    if (!isEdit) return;
    transactionsAPI.get(id)
      .then((res) => {
        const t = res.transaction;
        setType(t.type);
        setAmount(String(t.amount));
        setCurrency(t.currency);
        setCategoryId(t.category_id ?? null);
        setDate((t.date || '').slice(0, 10));
        setSource(t.source ?? '');
        setNote(t.note ?? '');
      })
      .catch((err) => setError(err.message || 'Could not load this transaction.'))
      .finally(() => setLoading(false));
  }, [isEdit, id]);

  // fetch live rate when currency changes (skip when it equals home currency, or in transfer mode)
  useEffect(() => {
    setRateError(''); setLiveRate(null);
    if (isTransfer || !currency || currency === homeCcy) return;
    setRateLoading(true);
    transactionsAPI.getRate(currency, homeCcy)
      .then((res) => { if (res.success) setLiveRate(res.rate); else setRateError('Live rate unavailable'); })
      .catch(() => setRateError('Live rate unavailable'))
      .finally(() => setRateLoading(false));
  }, [currency, homeCcy, isTransfer]);

  // categories for the active type (only income/expense have categories)
  useEffect(() => {
    if (isTransfer) return;
    categoriesAPI.list({ type })
      .then((res) => setCategories((res.categories || []).filter((c) => c.parent_id === null)))
      .catch(() => setCategories([]));
  }, [type, isTransfer]);

  const amountNum = parseFloat(amount) || 0;

  // transfer derived
  const trFa = parseFloat(trFromAmt) || 0;
  const trTa = parseFloat(trToAmt) || 0;
  const trRate = trFa > 0 ? trTa / trFa : 0;

  async function save() {
    setError(''); setFieldErrors({}); setAlert(null);

    // ---- TRANSFER branch ----
    if (isTransfer) {
      if (!(trFa > 0)) { setError('Enter the amount you sent.'); return; }
      if (!(trTa > 0)) { setError('Enter the amount received.'); return; }
      if (trFromCur === trToCur) { setError('From and to currencies must be different.'); return; }

      setSaving(true);
      try {
        const res = await transfersAPI.create({
          date,
          from_currency: trFromCur, from_amount: trFa,
          to_currency: trToCur, to_amount: trTa,
          fee: parseFloat(trFee) || 0,
          fee_currency: parseFloat(trFee) > 0 ? trFeeCur : null,
          note: note || null,
        });
        setAlert({ type: 'success', message: res.message || 'Transfer recorded.' });
        setTimeout(() => navigate('/transactions'), 800);
      } catch (err) {
        if (err.errors) setFieldErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
        setError(err.message || 'Could not record the transfer.');
      } finally {
        setSaving(false);
      }
      return;
    }

    // ---- INCOME / EXPENSE branch ----
    if (amountNum <= 0) {
      setFieldErrors({ amount: 'Enter an amount greater than 0.' });
      return;
    }

    setSaving(true);
    try {
      const ratePayload = (useCustom && parseFloat(customRate) > 0)
        ? { rate_source: 'custom', rate_to_main: parseFloat(customRate) }
        : {};

      if (isEdit) {
        const res = await transactionsAPI.update(id, {
          type, amount: amountNum, currency, category_id: categoryId, date,
          source: source || null, note: note || null, ...ratePayload,
        });
        setAlert({ type: 'success', message: res.message || 'Transaction updated.' });
        setTimeout(() => navigate('/transactions'), 800);
      } else if (repeat) {
        const res = await recurringAPI.create({
          type, amount: amountNum, currency, category_id: categoryId || null,
          source: source || null, note: note || null,
          frequency, interval: Number(interval) || 1, start_date: date,
          ends, end_date: ends === 'on_date' ? endDate : null,
          max_occurrences: ends === 'after_count' ? Number(maxOcc) : null,
        });
        setAlert({ type: 'success', message: res.message || 'Recurring payment created.' });
        setTimeout(() => navigate('/recurring'), 800);
      } else {
        const res = await transactionsAPI.create({
          type, amount: amountNum, currency, category_id: categoryId, date,
          source: source || null, note: note || null, ...ratePayload,
        });
        setAlert({ type: 'success', message: res.message || 'Saved.' });
        setTimeout(() => navigate('/transactions'), 800);
      }
    } catch (err) {
      if (err.errors) setFieldErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await transactionsAPI.remove(id);
      navigate('/transactions');
    } catch (err) {
      setError(err.message || 'Failed to delete.');
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setCreatingCat(true); setError('');
    try {
      const res = await categoriesAPI.create({ name, type, color: newCatColor });
      const cat = res.category;
      setCategories((prev) => [...prev, cat]);
      setCategoryId(cat.id);
      setNewCatName('');
      setNewCatOpen(false);
    } catch (err) {
      setError(err.message || 'Could not create the category.');
    } finally {
      setCreatingCat(false);
    }
  }

  function startEditCat(cat, e) {
    e.stopPropagation();
    setEditCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatColor(cat.color || CAT_COLORS[0]);
    setNewCatOpen(false);
  }

  async function saveCatEdit() {
    const name = editCatName.trim();
    if (!name) return;
    setSavingCat(true); setError('');
    try {
      const res = await categoriesAPI.update(editCatId, { name, color: editCatColor });
      setCategories((prev) => prev.map((c) => (c.id === editCatId ? res.category : c)));
      setEditCatId(null);
    } catch (err) {
      setError(err.message || 'Could not update the category.');
    } finally {
      setSavingCat(false);
    }
  }

  async function deleteCat() {
    try {
      await categoriesAPI.remove(confirmCatId);
      setCategories((prev) => prev.filter((c) => c.id !== confirmCatId));
      if (categoryId === confirmCatId) setCategoryId(null);
      setEditCatId(null);
      setConfirmCatId(null);
    } catch (err) {
      setError(err.message || 'Could not delete the category.');
      setConfirmCatId(null);
    }
  }

  if (loading) {
    return (<><Topbar title="Edit transaction" sub="Loading…" /><div className="card pad-lg muted">Loading…</div></>);
  }

  const title = isEdit
    ? `Edit ${type}`
    : (isTransfer ? 'New transfer' : (type === 'income' ? 'Add income' : 'Log an expense'));

  const subtitle = isEdit
    ? 'Update the details or delete this entry.'
    : (isTransfer ? 'Move money between your currencies — not income or expense.' : 'Set the amount, pick a category, done.');

  const effectiveRate = useCustom && parseFloat(customRate) > 0 ? parseFloat(customRate) : liveRate;
  const homeAmount = effectiveRate ? amountNum * effectiveRate : null;
  const sameCurrency = currency === homeCcy;

  // preferred-rate hint: only when the entered currency is the user's display currency,
  // they have a preferred rate set, and they haven't switched to live in settings.
  const showPreferredHint =
    !sameCurrency &&
    currency === displayCcy &&
    displayRatePref > 0 &&
    !displayUseLive;

  // currency options for transfer selects: tracked first, then the rest
  const allCurrencyCodes = [...trackedCodes, ...currencies.filter((c) => !trackedCodes.includes(c.code)).map((c) => c.code)];

  const saveLabel = saving
    ? 'Saving…'
    : (isEdit ? 'Save changes' : (isTransfer ? 'Record transfer' : 'Save'));

  return (
    <>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <Topbar title={title} sub={subtitle}>
        <button className="btn ghost" onClick={() => navigate(-1)} disabled={saving || deleting}>Cancel</button>
        <button className="btn pri" onClick={save} disabled={saving || deleting}>
          <Icon name="check" size={16} /> {saveLabel}
        </button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      <div className="card card--padding-large" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 680 }}>
        {/* Type toggle — three tabs (hide Transfer in edit mode) */}
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          {(isEdit ? ['expense', 'income'] : ['expense', 'income', 'transfer']).map((tp) => (
            <button key={tp} className={type === tp ? 'on' : ''} onClick={() => { setType(tp); setCategoryId(null); }}>
              {tp[0].toUpperCase() + tp.slice(1)}
            </button>
          ))}
        </div>

        {/* ===================== TRANSFER MODE ===================== */}
        {isTransfer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* You sent */}
            <div className="form-field">
              <label>You sent</label>
              <div className="row center" style={{ gap: 8 }}>
                <select className="form-input" value={trFromCur} onChange={(e) => setTrFromCur(e.target.value)} style={{ width: 110 }}>
                  {allCurrencyCodes.map((code) => <option key={code} value={code}>{code}</option>)}
                </select>
                <input className="form-input" type="number" min="0" step="0.01" value={trFromAmt}
                  onChange={(e) => setTrFromAmt(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
              </div>
            </div>

            {/* They received */}
            <div className="form-field">
              <label>They received</label>
              <div className="row center" style={{ gap: 8 }}>
                <select className="form-input" value={trToCur} onChange={(e) => setTrToCur(e.target.value)} style={{ width: 110 }}>
                  {allCurrencyCodes.map((code) => <option key={code} value={code}>{code}</option>)}
                </select>
                <input className="form-input" type="number" min="0" step="0.01" value={trToAmt}
                  onChange={(e) => setTrToAmt(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
              </div>
            </div>

            {/* derived rate */}
            {trRate > 0 && (
              <div className="muted text-small">
                Rate: 1 {trFromCur} = {trRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {trToCur}
              </div>
            )}

            {/* fee */}
            <div className="form-field">
              <label>Remittance fee (optional)</label>
              <div className="row center" style={{ gap: 8 }}>
                <select className="form-input" value={trFeeCur} onChange={(e) => setTrFeeCur(e.target.value)} style={{ width: 110 }}>
                  {allCurrencyCodes.map((code) => <option key={code} value={code}>{code}</option>)}
                </select>
                <input className="form-input" type="number" min="0" step="0.01" value={trFee}
                  onChange={(e) => setTrFee(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
              </div>
              <div className="muted text-small" style={{ marginTop: 4 }}>The fee is logged as a real expense in your spending.</div>
            </div>

            {/* date */}
            <div className="form-field">
              <label>Date</label>
              <div className="form-input"
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', position: 'relative' }}
                onClick={(e) => { const inp = e.currentTarget.querySelector('input'); inp?.showPicker?.() || inp?.focus(); }}>
                <Icon name="cal" size={17} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: date ? 'var(--ink)' : 'var(--muted)' }}>
                  {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Pick a date'}
                </span>
                {date !== today() && (
                  <button type="button" className="chip" style={{ fontSize: 11 }}
                    onClick={(e) => { e.stopPropagation(); setDate(today()); }}>Today</button>
                )}
                <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 0 }} />
              </div>
            </div>

            {/* note */}
            <div className="form-field">
              <label>Note (optional)</label>
              <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sent home via Al Ansari" />
            </div>

            <div className="card" style={{ padding: 12, background: 'var(--bg-soft, transparent)' }}>
              <div className="text-small muted">
                Transfers don't count as income or expense — they only move money between your currency balances. The fee (if any) is recorded as a real expense.
              </div>
            </div>
          </div>
        ) : (
        /* ===================== INCOME / EXPENSE MODE ===================== */
        <>
          {/* Amount */}
          <div>
            <div className="text-muted text-small text-semibold">Amount</div>
            <div className="amount-row">
              <span className="amount-row__currency mono">{currency}</span>
              <input
                className="num" type="number" inputMode="decimal" min="0" step="0.01"
                value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                style={{ border: 0, outline: 'none', background: 'transparent', font: 'inherit', fontSize: 52, fontWeight: 800, flex: 1, minWidth: 0, color: 'var(--ink)' }}
              />
            </div>

            {!sameCurrency && homeAmount != null && (
              <div className="muted" style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                ≈ {homeCcy} {homeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}

            {fieldErrors.amount && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.amount}</div>}

            {/* Tracked currencies as chips */}
            <div className="currency-chips" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {trackedCodes.map((code) => (
                <span key={code} className={`chip ${code === currency ? 'wine' : ''} cursor-pointer`} onClick={() => setCurrency(code)}>{code}</span>
              ))}
              <select
                value={trackedCodes.includes(currency) ? '' : currency}
                onChange={(e) => e.target.value && setCurrency(e.target.value)}
                style={{ marginLeft: 'auto', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 10px', background: 'transparent', fontSize: 12, color: 'var(--ink)', width: '90px' }}
              >
                <option value="">Other…</option>
                {currencies.filter((c) => !trackedCodes.includes(c.code)).map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            {/* Exchange rate row — only when currency ≠ home */}
            {!sameCurrency && (
              <div className="card" style={{ marginTop: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-soft, transparent)' }}>
                <div className="row between center" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <div className="text-small">
                    <span className="muted">Rate: </span>
                    <span className="mono text-semibold">
                      1 {currency} = {effectiveRate ? effectiveRate.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '—'} {homeCcy}
                    </span>
                    {rateLoading && <span className="muted"> · fetching…</span>}
                    {rateError && !useCustom && <span style={{ color: 'var(--clay)' }}> · {rateError}</span>}
                  </div>
                  <label className="row center text-small" style={{ gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={useCustom} onChange={(e) => { setUseCustom(e.target.checked); if (e.target.checked && liveRate) setCustomRate(String(liveRate)); }} />
                    Set my own rate
                  </label>
                </div>

                {/* preferred-rate hint (display only — does not change saving) */}
                {showPreferredHint && (
                  <div className="text-small" style={{ color: 'var(--wine)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>Your saved rate: 1 {currency} = {displayRatePref.toLocaleString(undefined, { maximumFractionDigits: 6 })} {homeCcy}.</span>
                    <button
                      type="button"
                      className="btn ghost text-small"
                      style={{ padding: '2px 8px' }}
                      onClick={() => { setUseCustom(true); setCustomRate(String(displayRatePref)); }}
                    >
                      Use it
                    </button>
                  </div>
                )}

                {useCustom && (
                  <div className="row center" style={{ gap: 8 }}>
                    <span className="text-small mono">1 {currency} =</span>
                    <input
                      className="form-input" type="number" min="0" step="0.000001"
                      value={customRate} onChange={(e) => setCustomRate(e.target.value)}
                      placeholder="rate" style={{ width: 140 }}
                    />
                    <span className="text-small mono">{homeCcy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <div className="text-muted text-small text-semibold" style={{ marginBottom: 12 }}>Category</div>
            <div className="category-grid">
              {categories.map((c) => {
                const isOwn = !c.is_system;
                return (
                  <button
                    key={c.id} type="button"
                    onClick={() => setCategoryId(c.id === categoryId ? null : c.id)}
                    className={`card category-grid__button ${c.id === categoryId ? 'category-grid__button--active' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <span className="m-ic" style={{ width: 32, height: 32, background: (c.color || '#888') + '22', color: c.color || 'var(--ink)' }}>
                      {(c.name || '?').charAt(0)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>

                    {isOwn && (
                      <span
                        onClick={(e) => startEditCat(c, e)}
                        title="Edit category"
                        style={{ position: 'absolute', top: 6, right: 6, padding: 3, borderRadius: 6, opacity: 0.6 }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
                      >
                        <Icon name="gear" size={13} />
                      </span>
                    )}
                  </button>
                );
              })}

              <button type="button" className="card category-grid__button" onClick={() => { setNewCatOpen((v) => !v); setEditCatId(null); }} style={{ borderStyle: 'dashed' }}>
                <span className="m-ic" style={{ width: 32, height: 32, background: 'var(--line)', color: 'var(--ink)' }}>
                  <Icon name="plus" size={16} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>New</span>
              </button>
            </div>

            {newCatOpen && (
              <div className="card" style={{ marginTop: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <input
                    className="form-input" autoFocus value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') createCategory(); }}
                    placeholder={`New ${type} category`} style={{ flex: 1, minWidth: 160 }}
                  />
                  <button className="btn pri" onClick={createCategory} disabled={creatingCat || !newCatName.trim()}>
                    {creatingCat ? 'Adding…' : 'Add'}
                  </button>
                  <button className="btn ghost" onClick={() => { setNewCatOpen(false); setNewCatName(''); }}>Cancel</button>
                </div>
                <ColorRow value={newCatColor} onChange={setNewCatColor} />
              </div>
            )}

            {editCatId && (
              <div className="card" style={{ marginTop: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, borderColor: 'var(--wine)' }}>
                <div className="text-small text-semibold">Edit category</div>
                <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <input
                    className="form-input" autoFocus value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveCatEdit(); }}
                    style={{ flex: 1, minWidth: 160 }}
                  />
                  <button className="btn pri" onClick={saveCatEdit} disabled={savingCat || !editCatName.trim()}>
                    {savingCat ? 'Saving…' : 'Save'}
                  </button>
                  <button className="btn ghost" onClick={() => setEditCatId(null)}>Cancel</button>
                  <button className="btn ghost" style={{ color: 'var(--clay)' }} onClick={() => setConfirmCatId(editCatId)}>
                    <Icon name="trash" size={14} /> Delete
                  </button>
                </div>
                <ColorRow value={editCatColor} onChange={setEditCatColor} />
              </div>
            )}

            {fieldErrors.category_id && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.category_id}</div>}
          </div>

          <hr className="hr" />

          {/* Details */}
          <div className="grid grid-2cols">
            <div className="form-field">
              <label>{repeat ? 'Starts on' : 'Date'}</label>
              <div
                className="form-input"
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', position: 'relative' }}
                onClick={(e) => { const inp = e.currentTarget.querySelector('input'); inp?.showPicker?.() || inp?.focus(); }}
              >
                <Icon name="cal" size={17} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: date ? 'var(--ink)' : 'var(--muted)' }}>
                  {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Pick a date'}
                </span>
                {!repeat && date !== today() && (
                  <button type="button" className="chip" onClick={(e) => { e.stopPropagation(); setDate(today()); }} style={{ fontSize: 11 }}>
                    Today
                  </button>
                )}
                <input
                  type="date" value={date} max={!repeat ? today() : undefined} onChange={(e) => setDate(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 0 }}
                />
              </div>
              {fieldErrors.date && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 4 }}>{fieldErrors.date}</div>}
            </div>
            <div className="form-field">
              <label>Source / label</label>
              <input className="form-input" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Salary — ADNOC" />
            </div>
            <div className="form-field form-field--full-width">
              <label>Notes</label>
              <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" />
            </div>
          </div>

          {/* Repeat (add mode only) */}
          {!isEdit && (
            <>
              <hr className="hr" />
              <div className="row between center">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Repeat this</div>
                  <div className="muted text-small">Auto-create it on a schedule (salary, rent, subscriptions).</div>
                </div>
                <Toggle on={repeat} onClick={() => setRepeat((v) => !v)} />
              </div>

              {repeat && (
                <div className="grid grid-2cols">
                  <div className="form-field">
                    <label>Frequency</label>
                    <select className="form-input" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                      {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Every</label>
                    <input className="form-input" type="number" min="1" value={interval} onChange={(e) => setIntervalN(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label>Ends</label>
                    <select className="form-input" value={ends} onChange={(e) => setEnds(e.target.value)}>
                      <option value="never">Never (until I stop)</option>
                      <option value="on_date">On a date</option>
                      <option value="after_count">After N times</option>
                    </select>
                  </div>
                  {ends === 'on_date' && (
                    <div className="form-field">
                      <label>End date</label>
                      <input className="form-input" type="date" min={date} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  )}
                  {ends === 'after_count' && (
                    <div className="form-field">
                      <label>Number of times</label>
                      <input className="form-input" type="number" min="1" value={maxOcc} onChange={(e) => setMaxOcc(e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Delete (edit mode only) */}
          {isEdit && (
            <>
              <hr className="hr" />
              <button className="btn ghost" style={{ color: 'var(--clay)', alignSelf: 'flex-start' }} onClick={() => setConfirmOpen(true)} disabled={deleting || saving}>
                <Icon name="trash" size={15} /> Delete transaction
              </button>
            </>
          )}
        </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        loading={deleting}
        title="Delete transaction?"
        message="This entry will be removed from your records. You can’t undo this."
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={confirmCatId != null}
        title="Delete category?"
        message="Transactions using this category will keep their data but lose the label. This can't be undone."
        confirmLabel="Delete"
        onConfirm={deleteCat}
        onCancel={() => setConfirmCatId(null)}
      />
    </>
  );
}