import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Sparkline, AreaChart, Donut } from '../components/Charts.jsx';
import { useNavigate } from 'react-router-dom';
import { SYMBOL, fmt } from '../lib/currency.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SavingsPlans } from '../components/SavingsPlans.jsx';
import { dashboardAPI } from '../api/dashboard';
import { splitsAPI } from '../api/splits';

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return d; } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [splitSummary, setSplitSummary] = useState(null);

  useEffect(() => {
    dashboardAPI.summary()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    splitsAPI.list()
      .then((res) => setSplitSummary(res.summary))
      .catch(() => {}); // silent
  }, []);

  // --- currency display logic ---
  const main    = data?.main_currency || 'OMR';
  const display = data?.display_currency || main;
  const rate    = data?.display_rate ?? 1;            // main → display
  const showHome = user?.preferences?.show_home_value ?? true;
  const differ  = display !== main;

  const sym     = SYMBOL[display] || display;          // big numbers = display currency
  const mainSym = SYMBOL[main] || main;                // small line = home currency
  const toDisplay = (v) => Number(v) * rate;

  const t = data?.totals || { income: 0, expense: 0, saved: 0 };
  const trend = data?.trend || [];
  const labels = trend.map((m) => m.label);
  const topCat = data?.by_category?.[0] || null;
  const wallets = data?.wallets || [];

  const stats = [
    { ic: 'green', icon: 'in',     lbl: 'Income', val: t.income,  spark: trend.map((m) => m.income),  color: 'var(--green)' },
    { ic: 'clay',  icon: 'out',    lbl: 'Spent',  val: t.expense, spark: trend.map((m) => m.expense), color: 'var(--clay)' },
    { ic: 'wine',  icon: 'wallet', lbl: 'Saved',  val: t.saved,   spark: trend.map((m) => m.net),     color: 'var(--wine)' },
    { ic: 'gold',  icon: 'send',   lbl: topCat ? `Top: ${topCat.name}` : 'Top category', val: topCat?.total || 0, spark: trend.map((m) => m.net), color: 'var(--gold)' },
  ];

  const split = (data?.by_category || []).map((c) => ({ name: c.name, v: c.total, color: c.color || 'var(--wine)' }));
  const nets = trend.map((m) => m.net);

  return (
    <>
      <Topbar title={`Welcome back ${user?.name || ''}`} sub="Here's how your money moved this month.">
        <button className="btn pri tb-hide-sm" onClick={() => navigate('/expense')}><Icon name="plus" size={16} /> Add</button>
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
                  <div className="lbl">{s.lbl}</div>
                </div>
                <div style={{ marginTop: 2  , paddingLeft:'20px'}}>
                  <div style={{ minWidth: 0 }}>
                    <div className="val num">{sym} {fmt(toDisplay(s.val))}</div>
                    {differ && showHome && (
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 1 }}>
                        {mainSym} {fmt(Number(s.val))}
                      </div>
                    )}
                  </div>
                  {/* <Sparkline className="spark" data={s.spark.length ? s.spark : [0, 0]} color={s.color} /> */}
                </div>
              </div>
            ))}
          </div>

          {/* Balances by currency — only when user uses more than one */}
          {wallets.length > 1 && (
            <div className="card pad-lg">
              <div className="card-h"><div className="t">Balances by currency</div></div>
              <div className="wallet-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                {wallets.map((w) => {
                  const wsym = SYMBOL[w.currency] || w.currency;
                  const positive = w.balance >= 0;
                  return (
                    <div key={w.currency} className="card wallet-card" style={{ flex: '1 1 150px', minWidth: 150, padding: 14 }}>
                      <div className="row center" style={{ gap: 8 }}>
                        <span className="chip wine mono">{w.currency}</span>
                      </div>
                      <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 6, color: positive ? 'var(--green)' : 'var(--clay)' }}>
                        {positive ? '' : '−'}{wsym} {fmt(Math.abs(w.balance))}
                      </div>
                      <div className="muted text-small" style={{ marginTop: 2 }}>
                        +{fmt(w.income)} · −{fmt(w.expense)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Split teaser */}
          {splitSummary?.owed_to_me > 0 && (
            <div className="card pad-lg row between center">
              <div>
                <div className="muted text-small">People owe you</div>
                <div className="num" style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{fmt(splitSummary.owed_to_me)}</div>
              </div>
              <button className="btn ghost" onClick={() => navigate('/splits')}>View splits <Icon name="right" size={14} /></button>
            </div>
          )}

          {/* Chart + donut */}
          <div className="grid cols-main" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
            <div className="card pad-lg">
              <div className="card-h">
                <div>
                  <div className="t">Net savings</div>
                  <div className="s">Last 6 months · {display}</div>
                </div>
              </div>
              <div className="num" style={{ fontSize: 30, fontWeight: 800, marginBottom: 2 }}>{sym} {fmt(toDisplay(t.saved))}</div>
              {differ && showHome && (
                <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                  {mainSym} {fmt(Number(t.saved))} in {main}
                </div>
              )}
              <AreaChart data={(nets.length ? nets : [0, 0]).map(toDisplay)} labels={labels} color="var(--wine)" prefix={sym + ' '} height={236} />
            </div>

            <div className="card pad-lg">
              <div className="card-h"><div className="t">Spending split</div></div>
              {split.length === 0 ? (
                <div className="muted text-small" style={{ padding: '20px 0' }}>No expenses this month.</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
                    <Donut data={split.map((s) => ({ ...s, v: toDisplay(s.v) }))} size={176} stroke={24} center1={`${sym} ${fmt(toDisplay(t.expense))}`} center2="THIS MONTH" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {split.map((s, i) => (
                      <div key={i} className="row between center" style={{ fontSize: 12.5 }}>
                        <span className="row center" style={{ gap: 8 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
                          <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{s.name}</span>
                        </span>
                        <span className="mono" style={{ color: 'var(--muted)' }}>{sym} {fmt(toDisplay(s.v))}</span>
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

            <SavingsPlans mainCurrency={display} />
          </div>
        </>
      )}
    </>
  );
}