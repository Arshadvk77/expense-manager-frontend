import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { fmt } from '../lib/currency.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrencies } from '../hooks/useCurrencies.js';
import { splitsAPI } from '../api/splits';
import { categoriesAPI } from '../api/categories';
import '../styles/main.scss';

const today = () => new Date().toISOString().slice(0, 10);

const SPLIT_METHODS = [
  { key: 'equal', label: '=', hint: 'Split equally' },
  { key: 'exact', label: '1.23', hint: 'Exact amounts' },
  { key: 'percent', label: '%', hint: 'By percentage' },
  { key: 'shares', label: '|||', hint: 'By shares' },
];

export default function Splits() {
  const { user } = useAuth();
  const { currencies } = useCurrencies();
  const trackedCodes = user?.preferences?.tracked_currencies?.length
    ? user.preferences.tracked_currencies
    : [user?.preferences?.main_currency || 'USD'];

  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [owedByMe, setOwedByMe] = useState([]);
  const [people, setPeople] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openPerson, setOpenPerson] = useState({}); // name => bool
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [showBills, setShowBills] = useState(false); // toggle to see raw bill list (edit/delete)

  function load() {
    setLoading(true);
    Promise.all([splitsAPI.list(), splitsAPI.byPerson()])
      .then(([res, pp]) => {
        setBills(res.bills || []);
        setSummary(res.summary);
        setOwedByMe(res.owed_by_me || []);
        setPeople(pp.people || []);
      })
      .catch((err) => setError(err.message || 'Failed to load splits.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  useEffect(() => {
    categoriesAPI.list({ type: 'expense' })
      .then((res) => setCategories((res.categories || []).filter((c) => c.parent_id === null)))
      .catch(() => setCategories([]));
  }, []);

  async function settle(pid, v) {
    try { await splitsAPI.settle(pid, v); load(); }
    catch (err) { setError(err.message || 'Could not update.'); }
  }
  async function settlePersonAll(name, isSettled) {
    try { await splitsAPI.settlePerson(name, isSettled); load(); }
    catch (err) { setError(err.message || 'Could not settle.'); }
  }
  async function confirmDelete() {
    try { await splitsAPI.remove(confirmId); setConfirmId(null); load(); }
    catch (err) { setError(err.message || 'Could not delete.'); }
  }

  function openNew() { setEditBill(null); setShowForm(true); setError(''); }
  function openEdit(b) { setEditBill(b); setShowForm(true); setError(''); }
  function closeForm() { setShowForm(false); setEditBill(null); }

  return (
    <>
      <Topbar title="Split bills" sub="Who owes what — settled up.">
        <button className="btn pri" onClick={openNew}><Icon name="plus" size={16} /> New split</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      {summary && (
        <div className="khaleej-split-tabs" style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, width: '100%' }}>
          <div className="khaleej-split-tab card" style={{ flex: '1 1 0', minWidth: 0, padding: '12px 8px', textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: 11 }}>Owed to you</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', wordBreak: 'break-word' }}>{fmt(summary.owed_to_me)}</div>
          </div>
          <div className="khaleej-split-tab card" style={{ flex: '1 1 0', minWidth: 0, padding: '12px 8px', textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: 11 }}>You owe</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--clay)', wordBreak: 'break-word' }}>{fmt(summary.i_owe)}</div>
          </div>
          <div className="khaleej-split-tab card" style={{ flex: '1 1 0', minWidth: 0, padding: '12px 8px', textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: 11 }}>Settled</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--wine)', wordBreak: 'break-word' }}>{fmt(summary.settled_total || 0)}</div>
          </div>
        </div>
      )}

      {showForm && (
        <SplitForm
          editBill={editBill}
          trackedCodes={trackedCodes}
          currencies={currencies}
          categories={categories}
          mainCurrency={user?.preferences?.main_currency || trackedCodes[0]}
          myName={user?.name || 'Me'}
          myUserId={user?.id}
          onClose={closeForm}
          onSaved={() => { closeForm(); load(); }}
          onError={setError}
        />
      )}

      {/* ===== WHO OWES YOU — per-person grouped ===== */}
      <div className="card pad-lg">
        <div className="card-h"><div className="t">Who owes you</div></div>
        {loading && <div className="muted text-small" style={{ padding: 12 }}>Loading…</div>}
        {!loading && people.length === 0 && <div className="muted text-small" style={{ padding: 12 }}>Nobody owes you right now. ✓</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {people.map((person, i) => {
            const isOpen = !!openPerson[person.name];
            const hasOutstanding = person.total_owed > 0.001;
            return (
              <div key={person.name + i} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
                {/* person header */}
                <div className="row between center" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setOpenPerson((p) => ({ ...p, [person.name]: !p[person.name] }))}
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, padding: 0, textAlign: 'left' }}
                  >
                    <span className="ava" style={{ width: 38, height: 38, borderRadius: 12, fontSize: 15, flexShrink: 0 }}>
                      {(person.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {person.name}
                        {person.friend_user_id && <Icon name="user" size={12} />}
                      </div>
                      <div className="muted text-small">
                        {person.items.length} item{person.items.length === 1 ? '' : 's'}
                        {person.total_settled > 0 && ` · ${fmt(person.total_settled)} settled`}
                      </div>
                    </span>
                    <Icon name={isOpen ? 'up' : 'down'} size={15} />
                  </button>

                  <div className="row center" style={{ gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 800, fontSize: 16, color: hasOutstanding ? 'var(--clay)' : 'var(--green)' }}>
                        {person.currency} {fmt(person.total_owed)}
                      </div>
                      <div className="muted text-small">owes you</div>
                    </div>
                    {hasOutstanding && (
                      <button className="btn pri text-small" onClick={() => settlePersonAll(person.name, true)}>
                        Settle all
                      </button>
                    )}
                  </div>
                </div>

                {/* expanded: per-bill items with their own Mark paid */}
                {isOpen && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 48 }}>
                    {person.items.map((it) => (
                      <div key={it.participant_id} className="split-owe-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={'chip ' + (it.is_settled ? 'green' : 'gold')} style={{ flexShrink: 0 }}>
                          {it.is_settled ? 'Paid' : 'Owes'}
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.bill_title}</span>
                            {it.category && (
                              <span className="chip" style={{ background: (it.category.color || '#888') + '22', color: it.category.color || 'var(--ink)' }}>
                                {it.category.name}
                              </span>
                            )}
                          </div>
                          <div className="muted text-small">{it.date}</div>
                        </span>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{it.currency} {fmt(it.owes)}</span>
                        <button
                          className={'btn text-small ' + (it.is_settled ? 'ghost' : 'pri')}
                          style={{ flexShrink: 0, padding: '5px 12px' }}
                          onClick={() => settle(it.participant_id, !it.is_settled)}
                        >
                          {it.is_settled ? 'Undo' : 'Mark paid'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== You owe (on other people's bills) ===== */}
      {owedByMe.length > 0 && (
        <div className="card pad-lg">
          <div className="card-h"><div className="t">You owe</div></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {owedByMe.map((p, i) => (
              <div key={p.id} className="row between center" style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 0, fontSize: 13, gap: 8, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600 }}>{p.bill_title}</span>
                  <span className="muted text-small"> · to {p.payer_name} · {p.date}</span>
                </div>
                <span className="row center" style={{ gap: 8, marginLeft: 'auto' }}>
                  <span className={'chip ' + (p.is_settled ? 'green' : 'clay')}>{p.is_settled ? 'Settled' : 'Unpaid'}</span>
                  <span className="mono">{p.currency} {fmt(p.share)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== All bills (edit / delete) — collapsed by default ===== */}
      <div className="card pad-lg">
        <div className="row between center" style={{ cursor: 'pointer' }} onClick={() => setShowBills((v) => !v)}>
          <div className="t">All splits</div>
          <button className="btn ghost text-small">
            {showBills ? 'Hide' : `Show all (${bills.length})`} <Icon name={showBills ? 'up' : 'down'} size={14} />
          </button>
        </div>

        {showBills && (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
            {bills.length === 0 && <div className="muted text-small" style={{ padding: 12 }}>No splits yet.</div>}
            {bills.map((b, i) => {
              const payer = (b.participants || []).find((p) => Number(p.paid_amount) > 0);
              const owing = (b.participants || []).filter((p) => Number(p.share_amount) > Number(p.paid_amount));
              const outstanding = owing.filter((p) => !p.is_settled)
                .reduce((s, p) => s + (Number(p.share_amount) - Number(p.paid_amount)), 0);
              return (
                <div key={b.id} className="row between center" style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 0, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</span>
                      {b.category && (
                        <span className="chip" style={{ background: (b.category.color || '#888') + '22', color: b.category.color || 'var(--ink)' }}>
                          {b.category.name}
                        </span>
                      )}
                    </div>
                    <div className="muted text-small" style={{ marginTop: 2 }}>
                      {b.date?.slice(0, 10)}{payer && <> · paid by {payer.name}</>} · {fmt(Number(b.total_amount))} {b.currency}
                    </div>
                  </div>
                  <div className="row center" style={{ gap: 8, flexShrink: 0 }}>
                    <span className="num text-small" style={{ color: outstanding > 0.01 ? 'var(--clay)' : 'var(--green)' }}>
                      {outstanding > 0.01 ? `${fmt(outstanding)} pending` : 'All settled'}
                    </span>
                    <button className="btn ghost text-small" onClick={() => openEdit(b)}><Icon name="edit" size={14} /></button>
                    <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(b.id)}><Icon name="trash" size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

function SplitForm({ editBill, trackedCodes, currencies, categories, mainCurrency, myName, myUserId, onClose, onSaved, onError }) {
  const isEdit = !!editBill;

  const [title, setTitle] = useState(editBill?.title || '');
  const [categoryId, setCategoryId] = useState(editBill?.category_id ?? '');
  const [total, setTotal] = useState(editBill ? String(editBill.total_amount) : '');
  const [currency, setCurrency] = useState(editBill?.currency || mainCurrency || 'USD');
  const [date, setDate] = useState(editBill?.date?.slice(0, 10) || today());
  const [method, setMethod] = useState(editBill?.split_method || 'equal');
  const [saving, setSaving] = useState(false);

  const initPeople = () => {
    if (editBill?.participants?.length) {
      return editBill.participants.map((p) => ({
        name: p.name,
        is_me: p.friend_user_id === myUserId,
        friend_user_id: p.friend_user_id,
        selected: Number(p.share_amount) > 0,
        exact: String(p.share_amount),
        percent: '',
        shares: '1',
      }));
    }
    return [{ name: myName, is_me: true, friend_user_id: myUserId, selected: true, exact: '', percent: '', shares: '1' }];
  };

  const [people, setPeople] = useState(initPeople);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const initPayer = () => {
    if (editBill?.participants?.length) {
      const idx = editBill.participants.findIndex((p) => Number(p.paid_amount) > 0);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  };
  const [payerIdx, setPayerIdx] = useState(initPayer);

  const t = parseFloat(total) || 0;

  const addPerson = (name = '', fid = null) =>
    setPeople((p) => [...p, { name, is_me: false, friend_user_id: fid, selected: true, exact: '', percent: '', shares: '1' }]);
  const removePerson = (idx) => {
    setPeople((p) => p.filter((_, i) => i !== idx));
    if (payerIdx === idx) setPayerIdx(0);
    else if (payerIdx > idx) setPayerIdx((x) => x - 1);
  };
  const setField = (idx, f, v) => setPeople((p) => p.map((x, i) => (i === idx ? { ...x, [f]: v } : x)));
  const toggleSel = (idx) => setPeople((p) => p.map((x, i) => (i === idx ? { ...x, selected: !x.selected } : x)));

  function computeShares() {
    const inv = people.map((p, i) => ({ ...p, _idx: i })).filter((p) => p.selected);
    const shares = {};
    if (inv.length === 0) return shares;

    if (method === 'equal') {
      // work in integer cents to avoid float drift, then spread leftover cents fairly
      const totalCents = Math.round(t * 100);
      const n = inv.length;
      const base = Math.floor(totalCents / n);   // everyone gets at least this many cents
      let leftover = totalCents - base * n;       // 0..n-1 cents to distribute

      inv.forEach((p, k) => {
        // give the first `leftover` people one extra cent each — fairest spread
        const cents = base + (k < leftover ? 1 : 0);
        shares[p._idx] = cents / 100;
      });
    } else if (method === 'exact') {
      inv.forEach((p) => { shares[p._idx] = parseFloat(p.exact) || 0; });
    } else if (method === 'percent') {
      inv.forEach((p) => { shares[p._idx] = Math.round(((parseFloat(p.percent) || 0) / 100) * t * 100) / 100; });
    } else if (method === 'shares') {
      // proportional split in integer cents with fair remainder distribution
      const totalCents = Math.round(t * 100);
      const weights = inv.map((p) => Math.max(0, parseFloat(p.shares) || 0));
      const weightSum = weights.reduce((s, w) => s + w, 0) || 1;

      // first pass: floor each person's cents
      let assigned = 0;
      const raw = inv.map((p, k) => {
        const exact = (weights[k] / weightSum) * totalCents;
        const floorCents = Math.floor(exact);
        assigned += floorCents;
        return { idx: p._idx, floorCents, frac: exact - floorCents };
      });

      // distribute the remaining cents to the people with the largest fractional parts
      let remaining = totalCents - assigned;
      raw.sort((a, b) => b.frac - a.frac);
      for (let k = 0; k < raw.length && remaining > 0; k++) {
        raw[k].floorCents += 1;
        remaining--;
      }

      raw.forEach((r) => { shares[r.idx] = r.floorCents / 100; });
    }
    return shares;
  }

  const shares = computeShares();
  const shareSum = Object.values(shares).reduce((s, v) => s + v, 0);
  const sharesBalanced = Math.abs(shareSum - t) <= 0.01;

  const paidFor = (i) => (i === payerIdx ? t : 0);

  async function runSearch(q) {
    setSearch(q);
    if (q.trim().length < 2) { setResults([]); return; }
    try { setResults((await splitsAPI.searchUsers(q.trim())).users || []); } catch { setResults([]); }
  }

  async function submit() {
    onError('');
    if (!title.trim()) return onError('Add a title.');
    if (!(t > 0)) return onError('Enter a total amount.');
    if (!sharesBalanced) return onError(`Shares add up to ${fmt(shareSum)}, but the bill is ${fmt(t)}.`);

    const participants = people.map((p, i) => ({
      name: p.name.trim() || 'Unnamed',
      share: shares[i] || 0,
      paid: paidFor(i),
      is_me: p.is_me,
      friend_user_id: p.friend_user_id,
    })).filter((p) => p.share > 0 || p.paid > 0);

    setSaving(true);
    try {
      const payload = { title, category_id: categoryId || null, total_amount: t, currency, split_method: method, date, participants };
      if (isEdit) await splitsAPI.update(editBill.id, payload);
      else await splitsAPI.create(payload);
      onSaved();
    } catch (err) {
      onError((err.errors && Object.values(err.errors)[0]?.[0]) || err.message || 'Could not save the split.');
    } finally { setSaving(false); }
  }

  return (
    <div className="card pad-lg" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="text-semibold" style={{ fontSize: 15 }}>{isEdit ? 'Edit split' : 'New split'}</div>

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
          <label>Category (optional)</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <div
            className="input"
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '0 12px', position: 'relative', minHeight: 42 }}
            onClick={(e) => { const inp = e.currentTarget.querySelector('input'); inp?.showPicker?.() || inp?.focus(); }}
          >
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
      </div>

      {/* SPLIT METHOD + PEOPLE */}
      <div>
        <div className="text-semibold text-small" style={{ marginBottom: 8 }}>Split between</div>
        <div className="seg" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
          {SPLIT_METHODS.map((m) => (
            <button key={m.key} className={method === m.key ? 'on' : ''} onClick={() => setMethod(m.key)} title={m.hint}>{m.label}</button>
          ))}
        </div>
        <div className="muted text-small" style={{ marginBottom: 8 }}>{SPLIT_METHODS.find((m) => m.key === method)?.hint}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {people.map((p, i) => (
            <div key={i} className="row between center split-person-row" style={{ gap: 8 }}>
              <span className="row center" style={{ gap: 8, flex: 1, minWidth: 0 }}>
                <input type="checkbox" checked={p.selected} onChange={() => toggleSel(i)} />
                <input className="input" value={p.name} disabled={p.is_me}
                  onChange={(e) => setField(i, 'name', e.target.value)} style={{ flex: 1, minWidth: 0 }} placeholder="Friend's name" />
              </span>

              {p.selected && method === 'exact' && (
                <input className="input split-amount-input" type="number" min="0" step="0.01" value={p.exact}
                  onChange={(e) => setField(i, 'exact', e.target.value)} style={{ width: 100 }} placeholder="0.00" />
              )}
              {p.selected && method === 'percent' && (
                <input className="input split-amount-input" type="number" min="0" step="0.1" value={p.percent}
                  onChange={(e) => setField(i, 'percent', e.target.value)} style={{ width: 80 }} placeholder="%" />
              )}
              {p.selected && method === 'shares' && (
                <input className="input split-amount-input" type="number" min="0" step="1" value={p.shares}
                  onChange={(e) => setField(i, 'shares', e.target.value)} style={{ width: 70 }} placeholder="parts" />
              )}

              {p.selected && <span className="mono muted text-small split-share-preview" style={{ width: 84, textAlign: 'right' }}>{currency} {fmt(shares[i] || 0)}</span>}

              {!p.is_me && <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => removePerson(i)}>×</button>}
            </div>
          ))}
        </div>

        {/* add person — search registered user OR type a name */}
        <div style={{ position: 'relative', marginTop: 10 }}>
          <input className="input" value={search} onChange={(e) => runSearch(e.target.value)}
            placeholder="Add someone — search a user, or type any name + Enter"
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
          {search.trim().length >= 2 && results.length === 0 && (
            <div className="muted text-small" style={{ marginTop: 6 }}>
              No registered user found — press Enter to add “{search.trim()}” as a name.
            </div>
          )}
        </div>

        <div className="text-small" style={{ marginTop: 8, color: sharesBalanced ? 'var(--green)' : 'var(--clay)' }}>
          Shares: {fmt(shareSum)} / {fmt(t)} {sharesBalanced ? '✓ Balanced' : '— must equal total'}
        </div>
      </div>

      {/* PAID BY */}
      <div className="field">
        <label>Paid by</label>
        <select className="input" value={payerIdx} onChange={(e) => setPayerIdx(Number(e.target.value))}>
          {people.map((p, i) => <option key={i} value={i}>{p.is_me ? 'You' : (p.name || 'Unnamed')}</option>)}
        </select>
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn pri" onClick={submit} disabled={saving || !sharesBalanced}>
          {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create split')}
        </button>
      </div>
    </div>
  );
}