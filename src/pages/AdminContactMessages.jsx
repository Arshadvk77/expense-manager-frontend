import { useState, useEffect, useCallback } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { adminAPI } from '../api/admin';
import '../styles/main.scss';

const FILTERS = [
  { key: 'all',       label: 'All',       params: {} },
  { key: 'unhandled', label: 'Unhandled', params: { handled: 0 } },
  { key: 'handled',   label: 'Handled',   params: { handled: 1 } },
];

const fmtDate = (d) => { try { return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

export default function AdminContactMessages() {
  const [filter, setFilter]     = useState('unhandled');
  const [search, setSearch]     = useState('');
  const [items, setItems]       = useState([]);
  const [page, setPage]         = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const f = FILTERS.find((x) => x.key === filter) || FILTERS[0];
      const params = { per_page: 20, page: p, ...f.params };
      if (search.trim()) params.search = search.trim();

      const res = await adminAPI.contactMessages(params);
      const pg = res.messages || {};
      setItems(pg.data || []);
      setPage(pg.current_page || 1);
      setLastPage(pg.last_page || 1);
      setTotal(pg.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load messages.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(1); }, [load]);

  async function toggleHandled(m) {
    try {
      const res = await adminAPI.setHandled(m.id, !m.is_handled);
      setItems((prev) => prev.map((x) => (x.id === m.id ? res.contact : x)));
    } catch (err) {
      setError(err.message || 'Could not update.');
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminAPI.removeMessage(confirmId);
      setItems((prev) => prev.filter((x) => x.id !== confirmId));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmId(null);
    } catch (err) {
      setError(err.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Topbar title="Contact messages" sub={`${total} message${total === 1 ? '' : 's'}`} />

      <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="card row center" style={{ flex: 1, minWidth: 240, gap: 10, padding: '10px 14px' }}>
          <Icon name="search" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink)' }}
            placeholder="Search name, email or message"
          />
        </div>
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      <div className="card pad-lg">
        {loading && <div className="muted text-small" style={{ padding: 16 }}>Loading…</div>}
        {!loading && items.length === 0 && <div className="muted text-small" style={{ padding: 16 }}>No messages.</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((m, i) => (
            <div key={m.id} style={{ padding: '16px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
              <div className="row between center" style={{ gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{m.first_name} {m.last_name}</span>
                    {m.topic && <span className="chip">{m.topic}</span>}
                    <span className={'chip ' + (m.is_handled ? 'green' : 'gold')}>{m.is_handled ? 'Handled' : 'New'}</span>
                  </div>
                  <a href={`mailto:${m.email}`} className="mono text-small" style={{ color: 'var(--wine)' }}>{m.email}</a>
                  <span className="muted text-small"> · {fmtDate(m.created_at)}</span>
                </div>
                <span className="row center" style={{ gap: 6, flexShrink: 0 }}>
                  <button className="btn ghost text-small" onClick={() => toggleHandled(m)}>
                    {m.is_handled ? 'Mark new' : 'Mark handled'}
                  </button>
                  <button className="btn ghost text-small" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(m.id)}>Delete</button>
                </span>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{m.message}</div>
            </div>
          ))}
        </div>

        {!loading && lastPage > 1 && (
          <div className="row between center" style={{ marginTop: 14 }}>
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
        title="Delete message?"
        message="This contact message will be permanently removed."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}