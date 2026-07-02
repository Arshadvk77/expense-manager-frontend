import { useState, useEffect, useCallback, useRef } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { fmt } from '../lib/currency.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { transactionsAPI, downloadBlob } from '../api/transactions';
import { transfersAPI } from '../api/transfers';
import { categoriesAPI } from '../api/categories';
import '../styles/main.scss';

const FILTERS = ['All', 'Income', 'Expense', 'Transfer'];

const fmtDate = (d) => {
  try {
    return new Date((d || '').slice(0, 10) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
};

export default function Transactions() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState('All');
  const [categoryId, setCategoryId] = useState(''); // '' = all categories
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);

  // transfers (only used when the Transfer tab is active)
  const [transfers, setTransfers] = useState([]);
  const [confirmTransferId, setConfirmTransferId] = useState(null);
  const [deletingTransfer, setDeletingTransfer] = useState(false);

  const isTransferTab = filter === 'Transfer';

  // load all categories once (income + expense) for the dropdown
  useEffect(() => {
    Promise.all([
      categoriesAPI.list({ type: 'expense' }).catch(() => ({ categories: [] })),
      categoriesAPI.list({ type: 'income' }).catch(() => ({ categories: [] })),
    ]).then(([exp, inc]) => {
      const all = [...(exp.categories || []), ...(inc.categories || [])]
        .filter((c) => c.parent_id === null);
      setCategories(all);
    });
  }, []);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      if (filter === 'Transfer') {
        const res = await transfersAPI.list();
        setTransfers(res.transfers || []);
      } else {
        const params = { per_page: 20, page: p };
        if (filter !== 'All') params.type = filter.toLowerCase();
        if (categoryId) params.category_id = categoryId;

        const res = await transactionsAPI.list(params);
        const paginator = res.transactions || {};
        setItems(paginator.data || []);
        setPage(paginator.current_page || 1);
        setLastPage(paginator.last_page || 1);
        setTotal(paginator.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load.');
      setItems([]);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, categoryId]);

  useEffect(() => { load(1); }, [load]);

  // if the user switches to the Transfer tab, clear the category filter (transfers have none)
  useEffect(() => {
    if (isTransferTab && categoryId) setCategoryId('');
  }, [isTransferTab]); // eslint-disable-line

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

  async function confirmDeleteTransfer() {
    const id = confirmTransferId;
    setDeletingTransfer(true);
    setError('');
    try {
      await transfersAPI.remove(id);
      setTransfers((prev) => prev.filter((t) => t.id !== id));
      setConfirmTransferId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete transfer.');
    } finally {
      setDeletingTransfer(false);
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

  const visibleTransfers = transfers.filter((tr) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (tr.note || '').toLowerCase().includes(q) ||
      (tr.from_currency || '').toLowerCase().includes(q) ||
      (tr.to_currency || '').toLowerCase().includes(q) ||
      String(tr.from_amount).includes(q) ||
      String(tr.to_amount).includes(q)
    );
  });

  async function handleExport() {
    try {
      const blob = await transactionsAPI.exportFile();
      downloadBlob(blob, `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      setError('Export failed.');
    }
  }

  async function handleTemplate() {
    const blob = await transactionsAPI.template();
    downloadBlob(blob, 'transactions-template.xlsx');
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const res = await transactionsAPI.importFile(file);
      let msg = `Imported ${res.imported}.`;
      if (res.skipped) msg += ` Skipped ${res.skipped} — ${(res.errors || []).slice(0, 3).join('; ')}`;
      setError(res.skipped ? msg : '');
      load(1);
    } catch (err) {
      setError(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId));

  return (
    <>
      <Topbar title="Transactions" sub="Every currency, in one place.">
        <button className="btn" onClick={handleTemplate}>Template</button>
        <button className="btn" onClick={() => fileRef.current?.click()} disabled={importing}>
          <Icon name="download" size={15} /> {importing ? 'Importing…' : 'Import'}
        </button>
        <button className="btn" onClick={handleExport}><Icon name="download" size={15} /> Export</button>
        <button className="btn pri" onClick={() => navigate('/expense')}><Icon name="plus" size={16} /></button>
      </Topbar>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ display: 'none' }} />

      {/* Filter bar */}
      <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="card row center" style={{ flex: 1, minWidth: 220, gap: 10, padding: '10px 14px' }}>
          <Icon name="search" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink)' }}
            placeholder="Search merchant, note or amount"
          />
        </div>

        {/* category dropdown — hidden on the Transfer tab */}
        {!isTransferTab && (
          <div className="card row center" style={{ gap: 8, padding: '8px 12px', minWidth: 150 }}>
            <Icon name="filter" size={15} />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink)', cursor: 'pointer' }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="seg">
          {FILTERS.map((t) => (
            <button key={t} className={filter === t ? 'on' : ''} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* active category chip (quick clear) */}
      {!isTransferTab && activeCategory && (
        <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="muted text-small">Filtered by:</span>
          <span className="chip wine" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {activeCategory.name}
            <button
              onClick={() => setCategoryId('')}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', fontWeight: 700, lineHeight: 1, padding: 0 }}
              aria-label="Clear category filter"
            >×</button>
          </span>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>
          {error}
        </div>
      )}

      {/* ============ TRANSFER TABLE ============ */}
      {isTransferTab ? (
        <div className="card pad-lg" style={{ paddingTop: 6, paddingBottom: 10 }}>
          <table className="tbl tbl-tx">
            <thead>
              <tr>
                <th>Transfer</th><th>Rate</th><th>Fee</th><th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
              )}
              {!loading && visibleTransfers.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>No transfers yet.</td></tr>
              )}
              {!loading && visibleTransfers.map((tr) => (
                <tr key={tr.id}>
                  <td style={{ width: '36%' }}>
                    <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span className="chip wine mono">{tr.from_currency}</span>
                      <span className="mono" style={{ fontWeight: 700 }}>{fmt(Number(tr.from_amount))}</span>
                      <Icon name="right" size={14} />
                      <span className="chip wine mono">{tr.to_currency}</span>
                      <span className="mono" style={{ fontWeight: 700 }}>{fmt(Number(tr.to_amount))}</span>
                    </div>
                    {tr.note && <div className="muted text-small" style={{ marginTop: 3 }}>{tr.note}</div>}
                  </td>
                  <td className="mono muted text-small">
                    1 {tr.from_currency} = {Number(tr.rate).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tr.to_currency}
                  </td>
                  <td className="mono text-small">
                    {Number(tr.fee) > 0 ? `${tr.fee_currency} ${fmt(Number(tr.fee))}` : '—'}
                  </td>
                  <td className="muted">{fmtDate(tr.date)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmTransferId(tr.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && visibleTransfers.length > 0 && (
            <div className="muted text-small" style={{ marginTop: 12, paddingLeft: 4 }}>
              Transfers don't count as income or expense — they move money between your currency balances. Any fee is logged as a separate expense.
            </div>
          )}
        </div>
      ) : (
      /* ============ INCOME / EXPENSE TABLE ============ */
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
                <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                  {activeCategory ? `No transactions in "${activeCategory.name}".` : 'No transactions yet.'}
                </td></tr>
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
                        {t.main_currency} {t.main_amount}
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
      )}

      <ConfirmDialog
        open={confirmId != null}
        loading={deleting}
        title="Delete transaction?"
        message="This entry will be removed from your records. You can't undo this."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />

      <ConfirmDialog
        open={confirmTransferId != null}
        loading={deletingTransfer}
        title="Delete this transfer?"
        message="The transfer and its fee expense (if any) will be removed. Your balances will adjust back."
        confirmLabel="Delete"
        onConfirm={confirmDeleteTransfer}
        onCancel={() => setConfirmTransferId(null)}
      />
    </>
  );
}