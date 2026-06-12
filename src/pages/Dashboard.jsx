import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Sparkline, AreaChart, Donut } from '../components/Charts.jsx';
import { useNavigate } from 'react-router-dom';
import { SYMBOL, fmt } from '../lib/currency.js';
import { useAuth } from '../hooks/useAuth.js';
import { SavingsPlans } from '../components/SavingsPlans.jsx';
import { dashboardAPI } from '../api/dashboard';

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return d; } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    dashboardAPI.summary()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const main = data?.main_currency || 'OMR';
  const sym  = SYMBOL[main] || main;
  const t     = data?.totals || { income: 0, expense: 0, saved: 0 };
  const trend = data?.trend || [];
  const labels = trend.map((m) => m.label);
  const topCat = data?.by_category?.[0] || null;

  const stats = [
    { ic: 'green', icon: 'in',     lbl: 'Income',  val: t.income,  spark: trend.map((m) => m.income),  color: 'var(--green)' },
    { ic: 'clay',  icon: 'out',    lbl: 'Spent',   val: t.expense, spark: trend.map((m) => m.expense), color: 'var(--clay)' },
    { ic: 'wine',  icon: 'wallet', lbl: 'Saved',   val: t.saved,   spark: trend.map((m) => m.net),     color: 'var(--wine)' },
    { ic: 'gold',  icon: 'send',   lbl: topCat ? `Top: ${topCat.name}` : 'Top category', val: topCat?.total || 0, spark: trend.map((m) => m.net), color: 'var(--gold)' },
  ];

  const split = (data?.by_category || []).map((c) => ({ name: c.name, v: c.total, color: c.color || 'var(--wine)' }));
  const nets  = trend.map((m) => m.net);

  return (
    <>
      <Topbar title={`Welcome back ${user?.name || ''}`} sub="Here's how your money moved this month.">
        <button className="btn pri" onClick={() => navigate('/add-expense')}><Icon name="plus" size={16} /> Add</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}
      {loading && <div className="card pad-lg muted">Loading…</div>}

      {!loading && data && (
        <>
          {/* Highlights */}
          <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {stats.map((s, i) => (
              <div key={i} className="card stat">
                <div className="top">
                  <span className={'ic ' + s.ic}><Icon name={s.icon} size={18} /></span>
                </div>
                <div className="lbl">{s.lbl}</div>
                <div className="row between center" style={{ marginTop: 2 }}>
                  <div className="val num">{sym} {fmt(Number(s.val))}</div>
                  <Sparkline data={s.spark.length ? s.spark : [0, 0]} color={s.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Chart + donut */}
          <div className="grid cols-main" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
            <div className="card pad-lg">
              <div className="card-h">
                <div>
                  <div className="t">Net savings</div>
                  <div className="s">Last 6 months · {main}</div>
                </div>
              </div>
              <div className="num" style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>{sym} {fmt(Number(t.saved))}</div>
              <AreaChart data={nets.length ? nets : [0, 0]} labels={labels} color="var(--wine)" prefix={sym + ' '} height={236} />
            </div>

            <div className="card pad-lg">
              <div className="card-h"><div className="t">Spending split</div></div>
              {split.length === 0 ? (
                <div className="muted text-small" style={{ padding: '20px 0' }}>No expenses this month.</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
                    <Donut data={split} size={176} stroke={24} center1={`${sym} ${fmt(Number(t.expense))}`} center2="THIS MONTH" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {split.map((s, i) => (
                      <div key={i} className="row between center" style={{ fontSize: 12.5 }}>
                        <span className="row center" style={{ gap: 8 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
                          <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{s.name}</span>
                        </span>
                        <span className="mono" style={{ color: 'var(--muted)' }}>{sym} {fmt(Number(s.v))}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity + savings */}
          <div className="grid cols-main" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
            <div className="card pad-lg">
              <div className="card-h">
                <div className="t">Recent activity</div>
                <button className="btn ghost" onClick={() => navigate('/transactions')} style={{ fontSize: 12.5 }}>View all <Icon name="right" size={14} /></button>
              </div>
              <table className="tbl tbl-mini">
                <tbody>
                  {(data.recent || []).map((r) => {
                    const income = r.type === 'income';
                    return (
                      <tr key={r.id}>
                        <td style={{ width: '52%' }}>
                          <div className="merch">
                            <div className="m-ic" style={{ background: (r.category?.color || '#888') + '22', color: r.category?.color || 'var(--ink)' }}>
                              {(r.source || r.note || r.category?.name || '•').charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{r.source || r.note || r.category?.name || (income ? 'Income' : 'Expense')}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.category?.name || '—'} · {fmtDate(r.date)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="num" style={{ fontWeight: 700, color: income ? 'var(--green)' : 'var(--ink)' }}>
                            {income ? '+' : '−'}{r.currency_symbol || r.currency} {fmt(Number(r.amount))}
                          </div>
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{r.main_currency} {fmt(Number(r.main_amount))}</div>
                        </td>
                      </tr>
                    );
                  })}
                  {(data.recent || []).length === 0 && (
                    <tr><td className="muted text-small" style={{ padding: 16 }}>No transactions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Savings plan section */}
            <SavingsPlans mainCurrency={main} />
          </div>
        </>
      )}
    </>
  );
}