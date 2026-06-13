import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Toggle } from '../components/Toggle.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { transactionsAPI } from '../api/transactions';
import { recurringAPI } from '../api/recurring';
import { categoriesAPI } from '../api/categories';
import { useAuth } from '../hooks/useAuth';
import { useCurrencies } from '../hooks/useCurrencies.js';
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

  const [type, setType]       = useState(defaultType);
  const [amount, setAmount]   = useState('');
  const [currency, setCurrency] = useState(user?.preferences?.main_currency || trackedCodes[0] || 'OMR');
  const [categoryId, setCategoryId] = useState(null);
  const [date, setDate]       = useState(today());
  const [source, setSource]   = useState('');
  const [note, setNote]       = useState('');

  // recurring (add mode only)
  const [repeat, setRepeat]       = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [interval, setIntervalN]  = useState(1);
  const [ends, setEnds]           = useState('never');
  const [endDate, setEndDate]     = useState('');
  const [maxOcc, setMaxOcc]       = useState('');

  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(isEdit);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const [newCatOpen, setNewCatOpen]   = useState(false);
  const [newCatName, setNewCatName]   = useState('');
  const [newCatColor, setNewCatColor] = useState(CAT_COLORS[0]);
  const [creatingCat, setCreatingCat] = useState(false);

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

  // categories for the active type
  useEffect(() => {
    categoriesAPI.list({ type })
      .then((res) => setCategories((res.categories || []).filter((c) => c.parent_id === null)))
      .catch(() => setCategories([]));
  }, [type]);

  const amountNum = parseFloat(amount) || 0;

  async function save() {
    setError(''); setFieldErrors({});
    if (amountNum <= 0) {
      setFieldErrors({ amount: 'Enter an amount greater than 0.' });
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await transactionsAPI.update(id, { type, amount: amountNum, currency, category_id: categoryId, date, source: source || null, note: note || null });
        navigate('/transactions');
      } else if (repeat) {
        await recurringAPI.create({
          type, amount: amountNum, currency, category_id: categoryId || null,
          source: source || null, note: note || null,
          frequency, interval: Number(interval) || 1, start_date: date,
          ends, end_date: ends === 'on_date' ? endDate : null,
          max_occurrences: ends === 'after_count' ? Number(maxOcc) : null,
        });
        navigate('/recurring');
      } else {
        await transactionsAPI.create({ type, amount: amountNum, currency, category_id: categoryId, date, source: source || null, note: note || null });
        navigate('/transactions');
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

  if (loading) {
    return (<><Topbar title="Edit transaction" sub="Loading…" /><div className="card pad-lg muted">Loading…</div></>);
  }

  const title = isEdit ? `Edit ${type}` : (type === 'income' ? 'Add income' : 'Log an expense');

  return (
    <>
      <Topbar title={title} sub={isEdit ? 'Update the details or delete this entry.' : 'Set the amount, pick a category, done.'}>
        <button className="btn ghost" onClick={() => navigate(-1)} disabled={saving || deleting}>Cancel</button>
        <button className="btn pri" onClick={save} disabled={saving || deleting}>
          <Icon name="check" size={16} /> {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Save')}
        </button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      <div className="card card--padding-large" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 680 }}>
        {/* Type toggle */}
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          {['expense', 'income'].map((tp) => (
            <button key={tp} className={type === tp ? 'on' : ''} onClick={() => { setType(tp); setCategoryId(null); }}>
              {tp[0].toUpperCase() + tp.slice(1)}
            </button>
          ))}
        </div>

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
          {fieldErrors.amount && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.amount}</div>}

          {/* Tracked currencies as chips, full list in the dropdown */}
          <div className="currency-chips" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {trackedCodes.map((code) => (
              <span key={code} className={`chip ${code === currency ? 'wine' : ''} cursor-pointer`} onClick={() => setCurrency(code)}>{code}</span>
            ))}
            <select
              value={trackedCodes.includes(currency) ? '' : currency}
              onChange={(e) => e.target.value && setCurrency(e.target.value)}
              style={{ marginLeft: 'auto', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 10px', background: 'transparent', fontSize: 12, color: 'var(--ink)' }}
            >
              <option value="">Other…</option>
              {currencies.filter((c) => !trackedCodes.includes(c.code)).map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <div className="text-muted text-small text-semibold" style={{ marginBottom: 12 }}>Category</div>
          <div className="category-grid">
            {categories.map((c) => (
              <button
                key={c.id} type="button"
                onClick={() => setCategoryId(c.id === categoryId ? null : c.id)}
                className={`card category-grid__button ${c.id === categoryId ? 'category-grid__button--active' : ''}`}
              >
                <span className="m-ic" style={{ width: 32, height: 32, background: (c.color || '#888') + '22', color: c.color || 'var(--ink)' }}>
                  {(c.name || '?').charAt(0)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
              </button>
            ))}

            {/* + New tile */}
            <button type="button" className="card category-grid__button" onClick={() => setNewCatOpen((v) => !v)} style={{ borderStyle: 'dashed' }}>
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
              <div className="row center" style={{ gap: 8 }}>
                {CAT_COLORS.map((col) => (
                  <span
                    key={col} onClick={() => setNewCatColor(col)}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: col, cursor: 'pointer',
                      outline: newCatColor === col ? '2px solid var(--ink)' : '2px solid transparent', outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {fieldErrors.category_id && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.category_id}</div>}
        </div>

        <hr className="hr" />

        {/* Details */}
        <div className="grid grid-2cols">
          <div className="form-field">
            <label>{repeat ? 'Starts on' : 'Date'}</label>
            <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
    </>
  );
}