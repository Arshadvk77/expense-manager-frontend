import { useState, useEffect } from 'react';
import { Icon } from './Icon.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { fmt } from '../lib/currency.js';
import { savingsAPI } from '../api/savings';

export function SavingsPlans({ mainCurrency = 'OMR' }) {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState('');
  const [target, setTarget]     = useState('');
  const [date, setDate]         = useState('');
  const [saving, setSaving]     = useState(false);

  const [contrib, setContrib]     = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  function load() {
    setLoading(true);
    savingsAPI.list()
      .then((res) => setPlans(res.plans || []))
      .catch((err) => setError(err.message || 'Failed to load savings plans.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function addPlan() {
    if (!name.trim() || !(parseFloat(target) > 0)) {
      setError('Enter a goal name and a target greater than 0.');
      return;
    }
    setSaving(true); setError('');
    try {
      await savingsAPI.create({
        name: name.trim(),
        target_amount: parseFloat(target),
        currency: mainCurrency,
        target_date: date || null,
      });
      setName(''); setTarget(''); setDate(''); setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not create the plan.');
    } finally {
      setSaving(false);
    }
  }

  async function contribute(id) {
    const amt = parseFloat(contrib[id]);
    if (!(amt > 0)) return;
    try {
      const res = await savingsAPI.contribute(id, amt);
      setPlans((prev) => prev.map((p) => (p.id === id ? res.plan : p)));
      setContrib((c) => ({ ...c, [id]: '' }));
    } catch (err) {
      setError(err.message || 'Could not add contribution.');
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await savingsAPI.remove(confirmId);
      setPlans((prev) => prev.filter((p) => p.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setError(err.message || 'Could not delete the plan.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="card pad-lg">
      <div className="card-h">
        <div>
          <div className="t">Savings plans</div>
          <div className="s">Track your goals</div>
        </div>
        <button className="btn ghost" style={{ fontSize: 12.5 }} onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={14} /> New goal
        </button>
      </div>

      {error && <div className="text-small" style={{ color: 'var(--clay)', marginBottom: 10 }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ background: 'var(--card-2)', marginBottom: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input" placeholder="Goal name (e.g. Emergency fund)" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="row" style={{ gap: 10 }}>
            <input className="input" type="number" min="0" step="0.01" placeholder={`Target (${mainCurrency})`} value={target} onChange={(e) => setTarget(e.target.value)} />
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
            <button className="btn pri" onClick={addPlan} disabled={saving}>{saving ? 'Saving…' : 'Create goal'}</button>
          </div>
        </div>
      )}

      {loading && <div className="muted text-small">Loading…</div>}
      {!loading && plans.length === 0 && !showForm && (
        <div className="muted text-small">No savings goals yet. Create one to start tracking.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map((p) => {
          const pct = p.progress ?? 0;
          const done = pct >= 100;
          return (
            <div key={p.id}>
              <div className="row between center" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</span>
                <span className="mono text-small muted">
                  {p.currency} {fmt(Number(p.saved_amount))} / {fmt(Number(p.target_amount))}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${pct}%`, background: done ? 'var(--green)' : (p.color || 'var(--wine)') }} />
              </div>
              <div className="row between center" style={{ marginTop: 8, gap: 8 }}>
                <span className="text-small muted">
                  {done ? 'Goal reached 🎉' : `${pct}%`}{p.target_date ? ` · by ${p.target_date}` : ''}
                </span>
                <span className="row center" style={{ gap: 6 }}>
                  <input
                    className="input" type="number" min="0" step="0.01" placeholder="Add"
                    value={contrib[p.id] || ''}
                    onChange={(e) => setContrib((c) => ({ ...c, [p.id]: e.target.value }))}
                    style={{ width: 90, padding: '7px 10px' }}
                  />
                  <button className="btn" onClick={() => contribute(p.id)}>Add</button>
                  <button className="btn ghost" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(p.id)}>×</button>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmId != null}
        loading={deleting}
        title="Delete savings goal?"
        message="This goal and its progress will be removed."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}