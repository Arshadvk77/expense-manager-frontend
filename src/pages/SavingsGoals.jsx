import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { fmt } from '../lib/currency.js';
import { useAuth } from '../hooks/useAuth.js';
import { useCurrencies } from '../hooks/useCurrencies.js';
import { savingsAPI } from '../api/savings';
import '../styles/main.scss';

const GOAL_COLORS = ['#6B1A2E', '#7c3aed', '#0891b2', '#059669', '#ca8a04', '#db2777'];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

export default function SavingsGoals() {
  const { user } = useAuth();
  const { currencies } = useCurrencies();
  const trackedCodes = user?.preferences?.tracked_currencies?.length
    ? user.preferences.tracked_currencies
    : [user?.preferences?.main_currency || 'USD'];

  const [plans, setPlans]     = useState([]);
  const [suggested, setSuggested] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', currency: user?.preferences?.main_currency || trackedCodes[0] || 'USD', target_date: '', color: GOAL_COLORS[0] });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [saving, setSaving] = useState(false);

  const [contribFor, setContribFor] = useState(null);
  const [contribAmt, setContribAmt] = useState('');
  const [confirmId, setConfirmId]   = useState(null);

  function load() {
    setLoading(true);
    Promise.all([savingsAPI.list(), savingsAPI.suggested().catch(() => null)])
      .then(([list, sug]) => { setPlans(list.plans || []); setSuggested(sug); })
      .catch((err) => setError(err.message || 'Failed to load goals.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function create() {
    setError('');
    if (!form.name.trim()) { setError('Give your goal a name.'); return; }
    if (!(parseFloat(form.target_amount) > 0)) { setError('Enter a target amount.'); return; }
    setSaving(true);
    try {
      await savingsAPI.create({
        name: form.name.trim(),
        target_amount: parseFloat(form.target_amount),
        currency: form.currency,
        target_date: form.target_date || null,
        color: form.color,
      });
      setShowForm(false);
      setForm((f) => ({ ...f, name: '', target_amount: '', target_date: '' }));
      load();
    } catch (err) { setError(err.message || 'Could not create the goal.'); }
    finally { setSaving(false); }
  }

  async function contribute() {
    const amt = parseFloat(contribAmt);
    if (!(amt > 0)) return;
    try {
      await savingsAPI.contribute(contribFor.id, amt);
      setContribFor(null); setContribAmt('');
      load();
    } catch (err) { setError(err.message || 'Could not add contribution.'); }
  }

  async function archive(plan) {
    try { await savingsAPI.update(plan.id, { is_archived: true }); load(); }
    catch (err) { setError(err.message || 'Could not archive.'); }
  }

  async function confirmDelete() {
    try { await savingsAPI.remove(confirmId); setConfirmId(null); load(); }
    catch (err) { setError(err.message || 'Could not delete.'); }
  }

  return (
    <>
      <Topbar title="Savings goals" sub="Set a target. Watch it fill.">
        <button className="btn pri" onClick={() => setShowForm((v) => !v)}><Icon name="plus" size={16} /> New goal</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      {suggested && suggested.net_this_month > 0 && (
        <div className="card pad-lg row between center" style={{ borderColor: 'var(--green)' }}>
          <div>
            <div className="muted text-small">You saved this month</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
              {suggested.main_currency} {fmt(suggested.net_this_month)}
            </div>
          </div>
          {plans.length > 0 && (
            <button className="btn" onClick={() => { setContribFor(plans[0]); setContribAmt(String(suggested.net_this_month)); }}>
              Add to {plans[0].name}
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div className="card pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid grid-2cols">
            <div className="field">
              <label>Goal name</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="Emergency fund / New laptop" />
            </div>
            <div className="field">
              <label>Target amount</label>
              <input className="input" type="number" min="0" step="0.01" value={form.target_amount} onChange={set('target_amount')} placeholder="0.00" />
            </div>
            <div className="field">
              <label>Currency</label>
              <select className="input" value={form.currency} onChange={set('currency')}>
                {trackedCodes.map((c) => <option key={c} value={c}>{c}</option>)}
                {currencies.filter((c) => !trackedCodes.includes(c.code)).map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Target date (optional)</label>
              <div
                className="input"
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '0 12px', position: 'relative' }}
                onClick={(e) => { const inp = e.currentTarget.querySelector('input'); inp?.showPicker?.() || inp?.focus(); }}
              >
                <Icon name="cal" size={17} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: form.target_date ? 'var(--ink)' : 'var(--muted)' }}>
                  {form.target_date
                    ? new Date(form.target_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                    : 'No target date'}
                </span>
                {form.target_date && (
                  <button type="button" className="chip" style={{ fontSize: 11 }}
                    onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, target_date: '' })); }}>
                    Clear
                  </button>
                )}
                <input
                  type="date"
                  value={form.target_date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={set('target_date')}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 0 }}
                />
              </div>
            </div>
          </div>
          <div className="row center" style={{ gap: 8 }}>
            <span className="text-small muted">Colour</span>
            {GOAL_COLORS.map((col) => (
              <span key={col} onClick={() => setForm((f) => ({ ...f, color: col }))}
                style={{ width: 22, height: 22, borderRadius: '50%', background: col, cursor: 'pointer',
                  outline: form.color === col ? '2px solid var(--ink)' : '2px solid transparent', outlineOffset: 2 }} />
            ))}
          </div>
          <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
            <button className="btn pri" onClick={create} disabled={saving}>{saving ? 'Saving…' : 'Create goal'}</button>
          </div>
        </div>
      )}

      {loading && <div className="card pad-lg muted">Loading…</div>}
      {!loading && plans.length === 0 && <div className="card pad-lg muted text-small">No savings goals yet. Create one to start tracking.</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {plans.map((p) => {
          const pct = Number(p.progress) || 0;
          const color = p.color || 'var(--wine)';
          const remaining = Math.max(0, Number(p.target_amount) - Number(p.saved_amount));
          const done = pct >= 100;
          return (
            <div key={p.id} className="card pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="row between center">
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                {done && <span className="chip green">Reached 🎉</span>}
              </div>

              <div>
                <div className="row between center" style={{ fontSize: 13, marginBottom: 6 }}>
                  <span className="num" style={{ fontWeight: 700 }}>{p.currency} {fmt(Number(p.saved_amount))}</span>
                  <span className="muted">of {p.currency} {fmt(Number(p.target_amount))}</span>
                </div>
                <div style={{ height: 10, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .4s' }} />
                </div>
                <div className="row between center" style={{ marginTop: 6 }}>
                  <span className="text-small" style={{ fontWeight: 700, color }}>{pct}%</span>
                  {!done && <span className="muted text-small">{p.currency} {fmt(remaining)} to go</span>}
                </div>
              </div>

              {p.target_date && <div className="muted text-small">Target: {fmtDate(p.target_date)}</div>}

              <div className="row" style={{ gap: 8, marginTop: 'auto' }}>
                <button className="btn pri text-small" style={{ flex: 1 }} onClick={() => { setContribFor(p); setContribAmt(''); }}>Add money</button>
                <button className="btn ghost text-small" onClick={() => archive(p)}>Archive</button>
                <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(p.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute modal */}
      {contribFor && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setContribFor(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(20,12,10,.45)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 380, padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Add to {contribFor.name}</div>
            <div className="muted text-small" style={{ marginTop: 4 }}>
              {contribFor.currency} {fmt(Number(contribFor.saved_amount))} saved so far
            </div>
            <input className="input" type="number" min="0" step="0.01" autoFocus value={contribAmt}
              onChange={(e) => setContribAmt(e.target.value)} placeholder="Amount to add" style={{ marginTop: 14 }}
              onKeyDown={(e) => { if (e.key === 'Enter') contribute(); }} />
            <div className="row" style={{ gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button className="btn ghost" onClick={() => setContribFor(null)}>Cancel</button>
              <button className="btn pri" onClick={contribute} disabled={!(parseFloat(contribAmt) > 0)}>Add</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId != null}
        title="Delete this goal?"
        message="The goal and its saved progress will be removed. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}