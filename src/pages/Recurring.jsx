import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { fmt } from '../lib/currency.js';
import { recurringAPI } from '../api/recurring';
import { categoriesAPI } from '../api/categories';
import '../styles/main.scss';

const CURRENCIES = ['OMR', 'AED', 'SAR', 'QAR', 'USD', 'INR'];
const FREQS = ['daily', 'weekly', 'monthly', 'yearly'];
const today = () => new Date().toISOString().slice(0, 10);
const freqLabel = (f, n) => (n > 1 ? `Every ${n} ${f.replace('ly', n > 1 ? 's' : '')}` : { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[f]);

export default function Recurring() {
  const [rules, setRules]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories, setCategories]   = useState([]);

  const [form, setForm] = useState({
    type: 'expense', amount: '', currency: 'OMR', category_id: '',
    frequency: 'monthly', interval: 1, start_date: today(),
    ends: 'never', end_date: '', max_occurrences: '', source: '', note: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  function load() {
    setLoading(true);
    recurringAPI.list()
      .then((res) => setRules(res.recurring || []))
      .catch((err) => setError(err.message || 'Failed to load recurring payments.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  useEffect(() => {
    categoriesAPI.list({ type: form.type })
      .then((res) => setCategories((res.categories || []).filter((c) => c.parent_id === null)))
      .catch(() => setCategories([]));
  }, [form.type]);

  async function create() {
    setSaving(true); setError(''); setFieldErrors({});
    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        currency: form.currency,
        category_id: form.category_id || null,
        frequency: form.frequency,
        interval: Number(form.interval) || 1,
        start_date: form.start_date,
        ends: form.ends,
        end_date: form.ends === 'on_date' ? form.end_date : null,
        max_occurrences: form.ends === 'after_count' ? Number(form.max_occurrences) : null,
        source: form.source || null,
        note: form.note || null,
      };
      if (!(payload.amount > 0)) { setFieldErrors({ amount: 'Enter an amount.' }); setSaving(false); return; }

      await recurringAPI.create(payload);
      setShowForm(false);
      setForm((f) => ({ ...f, amount: '', source: '', note: '', max_occurrences: '', end_date: '' }));
      load();
    } catch (err) {
      if (err.errors) setFieldErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      setError(err.message || 'Could not create the recurring payment.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rule) {
    try {
      const res = await recurringAPI.update(rule.id, { is_active: !rule.is_active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? res.recurring : r)));
    } catch (err) {
      setError(err.message || 'Could not update.');
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await recurringAPI.remove(confirmId);
      setRules((prev) => prev.filter((r) => r.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setError(err.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Topbar title="Recurring payments" sub="Salary, rent, subscriptions — on autopilot.">
        <button className="btn pri" onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={16} /> New
        </button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      {showForm && (
        <div className="card pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="seg" style={{ alignSelf: 'flex-start' }}>
            {['expense', 'income'].map((tp) => (
              <button key={tp} className={form.type === tp ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, type: tp, category_id: '' }))}>
                {tp[0].toUpperCase() + tp.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-2cols">
            <div className="field">
              <label>Amount</label>
              <input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
              {fieldErrors.amount && <div className="text-small" style={{ color: 'var(--clay)' }}>{fieldErrors.amount}</div>}
            </div>
            <div className="field">
              <label>Currency</label>
              <select className="input" value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <select className="input" value={form.category_id} onChange={set('category_id')}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Source / label</label>
              <input className="input" value={form.source} onChange={set('source')} placeholder="e.g. Salary — ADNOC / Rent" />
            </div>
            <div className="field">
              <label>Frequency</label>
              <select className="input" value={form.frequency} onChange={set('frequency')}>
                {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Every</label>
              <input className="input" type="number" min="1" value={form.interval} onChange={set('interval')} />
            </div>
            <div className="field">
              <label>Starts</label>
              <input className="input" type="date" value={form.start_date} onChange={set('start_date')} />
            </div>
            <div className="field">
              <label>Ends</label>
              <select className="input" value={form.ends} onChange={set('ends')}>
                <option value="never">Never (until I stop)</option>
                <option value="on_date">On a date</option>
                <option value="after_count">After N times</option>
              </select>
            </div>
            {form.ends === 'on_date' && (
              <div className="field">
                <label>End date</label>
                <input className="input" type="date" min={form.start_date} value={form.end_date} onChange={set('end_date')} />
              </div>
            )}
            {form.ends === 'after_count' && (
              <div className="field">
                <label>Number of times</label>
                <input className="input" type="number" min="1" value={form.max_occurrences} onChange={set('max_occurrences')} />
              </div>
            )}
          </div>

          <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
            <button className="btn pri" onClick={create} disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
          </div>
        </div>
      )}

      <div className="card pad-lg">
        {loading && <div className="muted text-small" style={{ padding: 12 }}>Loading…</div>}
        {!loading && rules.length === 0 && <div className="muted text-small" style={{ padding: 12 }}>No recurring payments yet.</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rules.map((r, i) => {
            const income = r.type === 'income';
            return (
              <div key={r.id} className="row between center" style={{ padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 0, gap: 12, opacity: r.is_active ? 1 : 0.55 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{r.source || r.note || r.category?.name || (income ? 'Income' : 'Expense')}</span>
                    <span className={'chip ' + (income ? 'green' : 'clay')}>{income ? 'Income' : 'Expense'}</span>
                    {!r.is_active && <span className="chip">Paused</span>}
                  </div>
                  <div className="muted text-small" style={{ marginTop: 2 }}>
                    {freqLabel(r.frequency, r.interval)} · next {r.next_run_date}
                    {r.ends === 'on_date' && ` · until ${r.end_date}`}
                    {r.ends === 'after_count' && ` · ${r.occurrences_count}/${r.max_occurrences} done`}
                  </div>
                </div>
                <div className="row center" style={{ gap: 8, flexShrink: 0 }}>
                  <span className="num" style={{ fontWeight: 700, color: income ? 'var(--green)' : 'var(--ink)' }}>
                    {income ? '+' : '−'}{r.currency} {fmt(Number(r.amount))}
                  </span>
                  <button className="btn ghost text-small" onClick={() => toggleActive(r)}>{r.is_active ? 'Pause' : 'Resume'}</button>
                  <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(r.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={confirmId != null}
        loading={deleting}
        title="Delete recurring payment?"
        message="Future payments will stop. Already-created transactions stay in your history."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}