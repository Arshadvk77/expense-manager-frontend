import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { fmt } from '../lib/currency.js';
import { useAuth } from '../hooks/useAuth.js';
import { useCurrencies } from '../hooks/useCurrencies.js';
import { splitsAPI } from '../api/splits';
import '../styles/main.scss';

const today = () => new Date().toISOString().slice(0, 10);

export default function Splits() {
  const { user } = useAuth();
  const { currencies } = useCurrencies();
  const trackedCodes = user?.preferences?.tracked_currencies?.length
    ? user.preferences.tracked_currencies
    : [user?.preferences?.main_currency || 'USD'];

  const [bills, setBills]       = useState([]);
  const [summary, setSummary]   = useState(null);
  const [owedByMe, setOwedByMe] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  function load() {
    setLoading(true);
    splitsAPI.list()
      .then((res) => { setBills(res.bills || []); setSummary(res.summary); setOwedByMe(res.owed_by_me || []); })
      .catch((err) => setError(err.message || 'Failed to load splits.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function settle(pid, v) {
    try { await splitsAPI.settle(pid, v); load(); }
    catch (err) { setError(err.message || 'Could not update.'); }
  }
  async function confirmDelete() {
    try { await splitsAPI.remove(confirmId); setConfirmId(null); load(); }
    catch (err) { setError(err.message || 'Could not delete.'); }
  }

  return (
    <>
      <Topbar title="Split bills" sub="Who owes what — settled up.">
        <button className="btn pri" onClick={() => setShowForm(true)}><Icon name="plus" size={16} /> New split</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      {summary && (
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="card pad-lg" style={{ flex: 1, minWidth: 160 }}>
            <div className="muted text-small">Owed to you</div>
            <div className="num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{fmt(summary.owed_to_me)}</div>
          </div>
          <div className="card pad-lg" style={{ flex: 1, minWidth: 160 }}>
            <div className="muted text-small">You owe</div>
            <div className="num" style={{ fontSize: 24, fontWeight: 800, color: 'var(--clay)' }}>{fmt(summary.i_owe)}</div>
          </div>
          <div className="card pad-lg" style={{ flex: 1, minWidth: 160 }}>
            <div className="muted text-small">Net balance</div>
            <div className="num" style={{ fontSize: 24, fontWeight: 800, color: summary.net >= 0 ? 'var(--green)' : 'var(--clay)' }}>
              {summary.net >= 0 ? '+' : ''}{fmt(summary.net)}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <SplitForm
          trackedCodes={trackedCodes}
          currencies={currencies}
          mainCurrency={user?.preferences?.main_currency || trackedCodes[0]}
          myName={user?.name || 'Me'}
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load(); }}
          onError={setError}
        />
      )}

      <div className="card pad-lg">
        <div className="card-h"><div className="t">Bills you paid</div></div>
        {loading && <div className="muted text-small" style={{ padding: 12 }}>Loading…</div>}
        {!loading && bills.length === 0 && <div className="muted text-small" style={{ padding: 12 }}>No splits yet.</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {bills.map((b, i) => {
            const owing = (b.participants || []).filter((p) => !p.is_payer);
            const outstanding = owing.filter((p) => !p.is_settled).reduce((s, p) => s + Number(p.share_amount), 0);
            return (
              <div key={b.id} style={{ padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
                <div className="row between center" style={{ gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                    <div className="muted text-small">{b.currency} {fmt(Number(b.total_amount))} · {b.date?.slice(0, 10)}</div>
                  </div>
                  <div className="row center" style={{ gap: 10, flexShrink: 0 }}>
                    <span className="num text-small" style={{ color: outstanding > 0 ? 'var(--clay)' : 'var(--green)' }}>
                      {outstanding > 0 ? `${fmt(outstanding)} pending` : 'All settled'}
                    </span>
                    <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(b.id)}>Delete</button>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {owing.map((p) => (
                    <div key={p.id} className="row between center" style={{ fontSize: 13, paddingLeft: 8 }}>
                      <span className="row center" style={{ gap: 8 }}>
                        <span className={'chip ' + (p.is_settled ? 'green' : 'gold')}>{p.is_settled ? 'Paid' : 'Owes'}</span>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        {p.friend_user_id && <Icon name="user" size={12} />}
                      </span>
                      <span className="row center" style={{ gap: 10 }}>
                        <span className="mono muted">{b.currency} {fmt(Number(p.share_amount))}</span>
                        <button className="btn ghost text-small" onClick={() => settle(p.id, !p.is_settled)}>
                          {p.is_settled ? 'Undo' : 'Mark paid'}
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {owedByMe.length > 0 && (
        <div className="card pad-lg">
          <div className="card-h"><div className="t">You owe</div></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {owedByMe.map((p, i) => (
              <div key={p.id} className="row between center" style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 0, fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{p.bill_title}</span>
                  <span className="muted text-small"> · to {p.payer_name} · {p.date}</span>
                </div>
                <span className="row center" style={{ gap: 8 }}>
                  <span className={'chip ' + (p.is_settled ? 'green' : 'clay')}>{p.is_settled ? 'Settled' : 'Unpaid'}</span>
                  <span className="mono">{p.currency} {fmt(p.share)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId != null}
        title="Delete this split?"
        message="The split and the expense it created in your tracker will both be removed."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}

function SplitForm({ trackedCodes, currencies, mainCurrency, myName, onClose, onCreated, onError }) {
  const [title, setTitle]       = useState('');
  const [total, setTotal]       = useState('');
  const [currency, setCurrency] = useState(mainCurrency || 'USD');
  const [date, setDate]         = useState(today());
  const [saving, setSaving]     = useState(false);
  const [people, setPeople]     = useState([{ name: myName, share: '', is_me: true, friend_user_id: null }]);
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);

  const addPerson = (name = '', friend_user_id = null) =>
    setPeople((p) => [...p, { name, share: '', is_me: false, friend_user_id }]);
  const removePerson = (idx) => setPeople((p) => p.filter((_, i) => i !== idx));
  const setField = (idx, f, v) => setPeople((p) => p.map((x, i) => (i === idx ? { ...x, [f]: v } : x)));

  function splitEvenly() {
    const t = parseFloat(total) || 0;
    if (!(t > 0) || people.length === 0) return;
    const each = Math.floor((t / people.length) * 100) / 100;
    const shares = people.map(() => each);
    const remainder = Math.round((t - each * people.length) * 100) / 100;
    const meIdx = people.findIndex((p) => p.is_me);
    shares[meIdx >= 0 ? meIdx : 0] += remainder;
    setPeople((p) => p.map((x, i) => ({ ...x, share: String(Math.round(shares[i] * 100) / 100) })));
  }

  async function runSearch(q) {
    setSearch(q);
    if (q.trim().length < 2) { setResults([]); return; }
    try { setResults((await splitsAPI.searchUsers(q.trim())).users || []); } catch { setResults([]); }
  }

  async function submit() {
    onError('');
    if (!title.trim()) { onError('Add a title.'); return; }
    const t = parseFloat(total);
    if (!(t > 0)) { onError('Enter a total amount.'); return; }

    const participants = people.map((p) => ({
      name: p.name.trim() || 'Unnamed',
      share: parseFloat(p.share) || 0,
      is_me: p.is_me,
      friend_user_id: p.friend_user_id,
    }));

    setSaving(true);
    try {
      await splitsAPI.create({ title, total_amount: t, currency, date, participants });
      onCreated();
    } catch (err) {
      onError((err.errors && Object.values(err.errors)[0]?.[0]) || err.message || 'Could not create the split.');
    } finally { setSaving(false); }
  }

  const shareSum = people.reduce((s, p) => s + (parseFloat(p.share) || 0), 0);
  const t = parseFloat(total) || 0;
  const balanced = Math.abs(shareSum - t) <= 0.01;

  return (
    <div className="card pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="grid grid-2cols">
        <div className="field">
          <label>What was it for?</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner at Bait Al Luban" />
        </div>
        <div className="field">
          <label>Total amount</label>
          <input className="input" type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>Currency</label>
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {trackedCodes.map((c) => <option key={c} value={c}>{c}</option>)}
            {currencies.filter((c) => !trackedCodes.includes(c.code)).map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="row between center" style={{ marginBottom: 8 }}>
          <div className="text-semibold text-small">Split between {people.length}</div>
          <button className="btn ghost text-small" onClick={splitEvenly} disabled={!(t > 0)}>Split evenly</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {people.map((p, idx) => (
            <div key={idx} className="row center" style={{ gap: 8 }}>
              <input className="input" value={p.name} disabled={p.is_me}
                onChange={(e) => setField(idx, 'name', e.target.value)} style={{ flex: 1 }} placeholder="Friend's name" />
              <input className="input" type="number" min="0" step="0.01" value={p.share}
                onChange={(e) => setField(idx, 'share', e.target.value)} style={{ width: 110 }} placeholder="0.00" />
              {p.is_me
                ? <span className="chip wine" style={{ whiteSpace: 'nowrap' }}>You</span>
                : <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => removePerson(idx)}>×</button>}
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', marginTop: 10 }}>
          <input className="input" value={search} onChange={(e) => runSearch(e.target.value)}
            placeholder="Search a registered user, or type a name + Enter"
            onKeyDown={(e) => { if (e.key === 'Enter' && search.trim()) { addPerson(search.trim()); setSearch(''); setResults([]); } }} />
          {results.length > 0 && (
            <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 10, padding: 4, maxHeight: 200, overflow: 'auto' }}>
              {results.map((u) => (
                <div key={u.id} style={{ padding: '8px 10px', cursor: 'pointer', borderRadius: 8, fontSize: 13 }}
                  onClick={() => { addPerson(u.name, u.id); setSearch(''); setResults([]); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--line)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontWeight: 600 }}>{u.name}</span>
                  <span className="muted text-small" style={{ marginLeft: 8 }}>{u.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="row between center text-small" style={{ color: balanced ? 'var(--green)' : 'var(--clay)' }}>
        <span>Shares: {fmt(shareSum)} / {fmt(t)}</span>
        <span>{balanced ? '✓ Balanced' : 'Shares must equal the total'}</span>
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn pri" onClick={submit} disabled={saving || !balanced}>{saving ? 'Saving…' : 'Create split'}</button>
      </div>
    </div>
  );
}