import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { adminAPI } from '../api/admin';
import '../styles/main.scss';

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return d; } };

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    adminAPI.dashboard()
      .then((res) => setData(res.overview))
      .catch((err) => setError(err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (<><Topbar title="Admin overview" sub="Loading…" /><div className="card pad-lg muted">Loading…</div></>);
  if (error)   return (<><Topbar title="Admin overview" /><div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div></>);

  const u = data.users;
  const maxSignup = Math.max(1, ...data.signups_14d.map((s) => s.value));

  const Stat = ({ label, value, sub, color }) => (
    <div className="card pad-lg" style={{ flex: 1, minWidth: 150 }}>
      <div className="muted text-small">{label}</div>
      <div className="num" style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: color || 'var(--ink)' }}>{value}</div>
      {sub && <div className="muted text-small" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      <Topbar title="Admin overview" sub="How the app is doing." />

      {/* Headline counters */}
      <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
        <Stat label="Total users"      value={u.total}  sub={`${u.admins} admin${u.admins === 1 ? '' : 's'}`} color="var(--wine)" />
        <Stat label="New today"        value={u.today} />
        <Stat label="New this week"    value={u.last_7}  sub={`${u.last_30} this month`} />
        <Stat label="Active (30d)"     value={u.active}  sub="logged a transaction" color="var(--green)" />
        <Stat label="Transactions"     value={data.transactions.total} sub={`${data.transactions.last_30} this month`} />
        <Stat label="Splits created"   value={data.splits_total} />
      </div>

      {/* Signups chart */}
      <div className="card pad-lg">
        <div className="card-h"><div className="t">Signups · last 14 days</div></div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, marginTop: 12 }}>
          {data.signups_14d.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 110 }}>
                <div title={`${s.value} signups`} style={{
                  height: `${(s.value / maxSignup) * 100}%`,
                  minHeight: s.value > 0 ? 4 : 0,
                  background: 'var(--wine)', borderRadius: '4px 4px 0 0',
                }} />
              </div>
              <span className="muted" style={{ fontSize: 9, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid cols-main" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top currencies */}
        <div className="card pad-lg">
          <div className="card-h"><div className="t">Most-used currencies</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {data.top_currencies.length === 0 && <div className="muted text-small">No data yet.</div>}
            {data.top_currencies.map((c) => {
              const max = Math.max(1, ...data.top_currencies.map((x) => x.count));
              return (
                <div key={c.currency}>
                  <div className="row between center text-small" style={{ marginBottom: 4 }}>
                    <span className="chip wine mono">{c.currency}</span>
                    <span className="muted">{c.count} txns</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--line)', borderRadius: 999 }}>
                    <div style={{ width: `${(c.count / max) * 100}%`, height: '100%', background: 'var(--wine)', borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className="card pad-lg">
          <div className="card-h"><div className="t">Newest users</div></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.recent_users.map((ru, i) => (
              <div key={ru.id} className="row between center" style={{ padding: '10px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
                <div className="row center" style={{ gap: 10 }}>
                  <div className="av" style={{ width: 32, height: 32, fontSize: 12 }}>{(ru.name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ru.name}</div>
                    <div className="muted text-small mono">{ru.email}</div>
                  </div>
                </div>
                <span className="muted text-small">{fmtDate(ru.created_at)}</span>
              </div>
            ))}
            {data.recent_users.length === 0 && <div className="muted text-small">No users yet.</div>}
          </div>
        </div>
      </div>
    </>
  );
}