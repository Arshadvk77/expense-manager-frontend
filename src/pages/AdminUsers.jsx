import { useState, useEffect, useCallback } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../api/admin';
import '../styles/main.scss';

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };

export default function AdminUsers() {
  const { user: me } = useAuth();

  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [page, setPage]       = useState(1);
  const [lastPage, setLast]   = useState(1);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [adminsOnly, setAO]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [selected, setSelected]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const params = { per_page: 20, page: p };
      if (search.trim()) params.search = search.trim();
      if (adminsOnly) params.admins_only = 1;

      const [s, list] = await Promise.all([adminAPI.stats(), adminAPI.users(params)]);
      setStats(s.stats);
      const pg = list.users || {};
      setUsers(pg.data || []);
      setPage(pg.current_page || 1);
      setLast(pg.last_page || 1);
      setTotal(pg.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, adminsOnly]);

  useEffect(() => { load(1); }, [load]);

  async function openDetail(id) {
    try {
      const res = await adminAPI.user(id);
      setSelected(res.user);
    } catch (err) {
      setError(err.message || 'Could not load user details.');
    }
  }

  async function toggleAdmin(u) {
    try {
      const res = await adminAPI.setAdmin(u.id, !u.is_admin);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_admin: res.user.is_admin } : x)));
      if (selected?.id === u.id) setSelected({ ...selected, is_admin: res.user.is_admin });
    } catch (err) {
      setError(err.message || 'Could not update.');
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminAPI.removeUser(confirmId);
      setUsers((prev) => prev.filter((x) => x.id !== confirmId));
      setTotal((t) => Math.max(0, t - 1));
      if (selected?.id === confirmId) setSelected(null);
      setConfirmId(null);
    } catch (err) {
      setError(err.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  }

  const Stat = ({ label, value }) => (
    <div className="card pad-lg" style={{ flex: 1, minWidth: 160 }}>
      <div className="muted text-small">{label}</div>
      <div className="num" style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{value ?? '—'}</div>
    </div>
  );

  return (
    <>
      <Topbar title="Users" sub={`${total} registered`} />

      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <Stat label="Total users"        value={stats?.users_total} />
        <Stat label="Admins"             value={stats?.admins_total} />
        <Stat label="New last 7 days"    value={stats?.users_last_7_days} />
        <Stat label="New last 30 days"   value={stats?.users_last_30_days} />
        <Stat label="Transactions total" value={stats?.transactions_total} />
      </div>

      <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="card row center" style={{ flex: 1, minWidth: 240, gap: 10, padding: '10px 14px' }}>
          <Icon name="search" size={16} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink)' }}
            placeholder="Search name or email"
          />
        </div>
        <div className="seg">
          <button className={!adminsOnly ? 'on' : ''} onClick={() => setAO(false)}>All</button>
          <button className={adminsOnly ? 'on' : ''} onClick={() => setAO(true)}>Admins</button>
        </div>
      </div>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      <div className="card pad-lg">
        {loading && <div className="muted text-small" style={{ padding: 12 }}>Loading…</div>}
        {!loading && users.length === 0 && <div className="muted text-small" style={{ padding: 12 }}>No users.</div>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {users.map((u, i) => {
            const isMe = me?.id === u.id;
            return (
              <div key={u.id} className="row between center" style={{ padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 0, gap: 12, cursor: 'pointer' }} onClick={() => openDetail(u.id)}>
                <div className="row center" style={{ gap: 12, minWidth: 0 }}>
                  <div className="av" style={{ width: 36, height: 36, fontSize: 13 }}>{(u.name || '?').charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{u.name || '—'}</span>
                      {u.is_admin && <span className="chip wine">Admin</span>}
                      {isMe && <span className="chip">You</span>}
                    </div>
                    <div className="muted text-small mono">{u.email}</div>
                  </div>
                </div>
                <div className="row center" style={{ gap: 14, flexShrink: 0 }}>
                  <div className="muted text-small" style={{ textAlign: 'right' }}>
                    <div>{u.transactions_count ?? 0} txns</div>
                    <div>{fmtDate(u.created_at)}</div>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {!loading && lastPage > 1 && (
          <div className="row between center" style={{ marginTop: 14 }}>
            <span className="muted text-small">{total} total</span>
            <div className="row center" style={{ gap: 8 }}>
              <button className="btn" disabled={page <= 1}     onClick={() => load(page - 1)}>Prev</button>
              <span className="muted text-small mono">{page} / {lastPage}</span>
              <button className="btn" disabled={page >= lastPage} onClick={() => load(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 'min(440px, 100%)', height: '100%', borderRadius: 0, padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="row between center">
              <div style={{ fontWeight: 800, fontSize: 18 }}>User detail</div>
              <button className="btn ghost" onClick={() => setSelected(null)}>Close</button>
            </div>

            <div className="row center" style={{ gap: 14 }}>
              <div className="av" style={{ width: 56, height: 56, fontSize: 22 }}>{(selected.name || '?').charAt(0).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
                <div className="muted text-small mono">{selected.email}</div>
                <div className="muted text-small">Joined {fmtDate(selected.created_at)}</div>
              </div>
            </div>

            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <Stat label="Transactions" value={selected.transactions_count} />
              <Stat label="Recurring"    value={selected.recurring_transactions_count} />
              <Stat label="Categories"   value={selected.categories_count} />
            </div>

            <div className="card pad-lg">
              <div className="muted text-small">Main currency</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{selected.preferences?.main_currency || '—'}</div>
            </div>

            <div className="row" style={{ gap: 8, marginTop: 'auto' }}>
              <button className="btn" onClick={() => toggleAdmin(selected)} disabled={me?.id === selected.id && selected.is_admin}>
                {selected.is_admin ? 'Remove admin' : 'Make admin'}
              </button>
              <button className="btn" style={{ color: 'var(--clay)' }} onClick={() => setConfirmId(selected.id)} disabled={me?.id === selected.id}>
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId != null}
        loading={deleting}
        title="Delete this user?"
        message="All their transactions, categories and recurring payments will be removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}