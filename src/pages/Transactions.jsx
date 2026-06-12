import { useState, useEffect, useCallback } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { fmt } from '../lib/currency.js';
import { transactionsAPI } from '../api/transactions'; // 👉 adjust path
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';

import '../styles/main.scss';

const FILTERS = ['All', 'Income', 'Expense'];

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
};

export default function Transactions() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);  // replaces deletingId
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { per_page: 20, page: p };
      if (filter !== 'All') params.type = filter.toLowerCase();

      const res = await transactionsAPI.list(params);
      const paginator = res.transactions || {};
      setItems(paginator.data || []);
      setPage(paginator.current_page || 1);
      setLastPage(paginator.last_page || 1);
      setTotal(paginator.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load transactions.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(1); }, [load]);

  async function confirmDelete() {
  const id = confirmId;
  setDeleting(true);
  setError('');
  try {
    await transactionsAPI.remove(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    setConfirmId(null);
  } catch (err) {
    setError(err.message || 'Failed to delete transaction.');
  } finally {
    setDeleting(false);
  }
}

  const title = (t) => t.source || t.note || t.category?.name || (t.type === 'income' ? 'Income' : 'Expense');

  const visible = items.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      title(t).toLowerCase().includes(q) ||
      (t.category?.name || '').toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  });

  return (
    <>
      <Topbar title="Transactions" sub="Every currency, in one place.">
        <button className="btn"><Icon name="download" size={15} /> Export</button>
        <button className="btn pri" onClick={() => navigate('/add-expense')}>
          <Icon name="plus" size={16} /> New
        </button>
      </Topbar>

      {/* Filter bar */}
      <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="card row center" style={{ flex: 1, minWidth: 240, gap: 10, padding: '10px 14px' }}>
          <Icon name="search" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink)' }}
            placeholder="Search merchant, note or amount"
          />
        </div>
        <div className="seg">
          {FILTERS.map((t) => (
            <button key={t} className={filter === t ? 'on' : ''} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      <div className="card pad-lg" style={{ paddingTop: 6, paddingBottom: 10 }}>
        <table className="tbl tbl-tx">
          <thead>
            <tr>
              <th>Activity</th><th>Category</th><th>Date</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Converted</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
            )}

            {!loading && visible.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>No transactions yet.</td></tr>
            )}

            {!loading && visible.map((t) => {
              const income = t.type === 'income';
              const color = t.category?.color || '#888';
              return (
                <tr key={t.id}>
                  <td style={{ width: '30%' }}>
                    <div className="merch">
                      <div className="m-ic" style={{ background: color + '22', color }}>{title(t).charAt(0)}</div>
                      <div style={{ fontWeight: 700 }}>{title(t)}</div>
                    </div>
                  </td>
                  <td><span className="chip">{t.category?.name || '—'}</span></td>
                  <td className="muted">{fmtDate(t.date)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="num" style={{ fontWeight: 700, fontSize: 14.5, color: income ? 'var(--green)' : 'var(--ink)' }}>
                      {income ? '+' : '−'}{t.currency_symbol || t.currency} {fmt(Number(t.amount))}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {t.main_currency} {fmt(Number(t.main_amount))}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn ghost text-small" onClick={() => navigate(`/transactions/${t.id}/edit`)}>Edit</button>
                    <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(t.id)}>
  Delete
</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && lastPage > 1 && (
          <div className="row between center" style={{ marginTop: 12 }}>
            <span className="muted text-small">{total} total</span>
            <div className="row center" style={{ gap: 8 }}>
              <button className="btn" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
              <span className="muted text-small mono">{page} / {lastPage}</span>
              <button className="btn" disabled={page >= lastPage} onClick={() => load(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmId != null}
        loading={deleting}
        title="Delete transaction?"
        message="This entry will be removed from your records. You can’t undo this."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    
    </>
  );
}