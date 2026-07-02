import { useState, useEffect } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { AreaChart, Donut } from '../components/Charts.jsx';
import { useNavigate } from 'react-router-dom';
import { SYMBOL, fmt } from '../lib/currency.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SavingsPlans } from '../components/SavingsPlans.jsx';
import { dashboardAPI } from '../api/dashboard';
import { splitsAPI } from '../api/splits';

const fmtDate = (d) => { try { return new Date((d || '').slice(0, 10) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return d; } };
const toISO = (d) => d.toISOString().slice(0, 10);

function presetRange(preset) {
  const now = new Date();
  if (preset === 'last_month') {
    const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const m = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
  }
  if (preset === 'last_3') {
    return { from: toISO(new Date(now.getFullYear(), now.getMonth() - 2, 1)), to: toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
  }
  // this_month
  return { from: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [splitSummary, setSplitSummary] = useState(null);
  const [splitView, setSplitView] = useState('expense'); // 'expense' | 'income'

  const [preset, setPreset] = useState('this_month');
  const [filters, setFilters] = useState({ ...presetRange('this_month'), currency: null }); // currency: null → backend default (display currency)
  const [openWallets, setOpenWallets] = useState({});
  const toggleWallet = (currency) => setOpenWallets((prev) => ({ ...prev, [currency]: !prev[currency] }));

  useEffect(() => {
    setLoading(true);
    const params = { from: filters.from, to: filters.to };
    if (filters.currency) params.currency = filters.currency;
    dashboardAPI.summary(params)
      .then((res) => {
        setData(res);
        if (!filters.currency) {
          setFilters((f) => ({ ...f, currency: res.filter?.currency || res.display_currency }));
        }
      })
      .catch((err) => setError(err.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, filters.currency]);

  useEffect(() => {
    splitsAPI.list().then((res) => setSplitSummary(res.summary)).catch(() => {});
  }, []);

  const applyPreset = (p) => {
    setPreset(p);
    setFilters((f) => ({ ...f, ...presetRange(p) }));
  };

  // --- currency / mode logic ---
  const main = data?.main_currency || 'OMR';
  const display = data?.display_currency || main;
  const rate = data?.display_rate ?? 1;
  const showHome = user?.preferences?.show_home_value ?? true;
  const differ = display !== main;

  const mode = data?.filter?.mode || 'single';
  const isAll = mode === 'all';
  const selCurrency = data?.filter?.currency || display;
  const availableCurrencies = data?.available_currencies || [];

  const sym = isAll ? (SYMBOL[display] || display) : (SYMBOL[selCurrency] || selCurrency);
  const mainSym = SYMBOL[main] || main;
  const toDisplay = (v) => (isAll ? Number(v) * rate : Number(v)); // single mode = already raw, no conversion

  const t = data?.totals || { income: 0, expense: 0, saved: 0 };
  const trend = data?.trend || [];
  const labels = trend.map((m) => m.label);
  const topCat = data?.by_category?.[0] || null;
  const wallets = data?.wallets || [];

  const stats = [
    { ic: 'green', icon: 'in', lbl: 'Income', val: t.income },
    { ic: 'clay', icon: 'out', lbl: 'Spent', val: t.expense },
    { ic: 'wine', icon: 'wallet', lbl: 'Saved', val: t.saved },
    { ic: 'gold', icon: 'send', lbl: topCat ? `Top: ${topCat.name}` : 'Top category', val: topCat?.total || 0 },
  ];

  const isIncomeView = splitView === 'income';
  const splitSource = isIncomeView ? (data?.income_by_category || []) : (data?.by_category || []);
  const split = splitSource.map((c) => ({ name: c.name, v: c.total, color: c.color || (isIncomeView ? 'var(--green)' : 'var(--wine)') }));
  const splitTotal = isIncomeView ? t.income : t.expense;

  const nets = trend.map((m) => m.net);

  return (
    <>
      <Topbar title={`Welcome back ${user?.name || ''}`} sub="Here's how your money moved this month.">
        <button className="btn pri tb-hide-sm" onClick={() => navigate('/expense')}><Icon name="plus" size={16} /> Add</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}

      {/* Filter bar */}
      <div className="card pad-lg filter-bar-dash">
        <div className="filter-bar-dash__dates">
          <div className="seg">
            <button className={preset === 'this_month' ? 'on' : ''} onClick={() => applyPreset('this_month')}>This month</button>
            <button className={preset === 'last_month' ? 'on' : ''} onClick={() => applyPreset('last_month')}>Last month</button>
            <button className={preset === 'last_3' ? 'on' : ''} onClick={() => applyPreset('last_3')}>Last 3 months</button>
          </div>
          <div className="filter-bar-dash__custom">
            <input type="date" className="input" value={filters.from}
              onChange={(e) => { setPreset(null); setFilters((f) => ({ ...f, from: e.target.value })); }} />
            <span className="muted text-small">to</span>
            <input type="date" className="input" value={filters.to}
              onChange={(e) => { setPreset(null); setFilters((f) => ({ ...f, to: e.target.value })); }} />
          </div>
        </div>
        <div className="filter-bar-dash__currencies">
          {availableCurrencies.map((c) => (
            <button key={c} className={'chip currency-chip' + (filters.currency === c ? ' active' : '')}
              onClick={() => setFilters((f) => ({ ...f, currency: c }))}>{c}</button>
          ))}
          <button className={'chip currency-chip' + (filters.currency === 'ALL' ? ' active' : '')}
            onClick={() => setFilters((f) => ({ ...f, currency: 'ALL' }))}>All</button>
        </div>
      </div>

      {loading && <div className="card pad-lg muted">Loading…</div>}

      {!loading && data && (
        <>
          {/* Highlights — single currency */}
          {!isAll && (
            <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {stats.map((s, i) => (
                <div key={i} className="card stat">
                  <div className="top">
                    <span className={'ic ' + s.ic}><Icon name={s.icon} size={18} /></span>
                    <div className="lbl">{s.lbl}</div>
                  </div>
                  <div style={{ marginTop: 2, paddingLeft: '20px' }}>
                    <div className="val num">{sym} {fmt(Number(s.val))}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Highlights — all currencies, stacked per-currency blocks */}
          {isAll && (
            <div className="currency-breakdown-stack">
              {(data.currency_breakdown || []).map((cb) => {
                const csym = SYMBOL[cb.currency] || cb.currency;
                const savedPositive = cb.saved >= 0;
                return (
                  <div key={cb.currency} className="card pad-lg currency-block">
                    <div className="currency-block__head">{cb.currency}</div>
                    <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                      <div className="card stat">
                        <div className="top"><span className="ic green"><Icon name="in" size={18} /></span><div className="lbl">Income</div></div>
                        <div style={{ marginTop: 2, paddingLeft: 20 }}><div className="val num">{csym} {fmt(cb.income)}</div></div>
                      </div>
                      <div className="card stat">
                        <div className="top"><span className="ic clay"><Icon name="out" size={18} /></span><div className="lbl">Spent</div></div>
                        <div style={{ marginTop: 2, paddingLeft: 20 }}><div className="val num">{csym} {fmt(cb.expense)}</div></div>
                      </div>
                      <div className="card stat">
                        <div className="top"><span className="ic wine"><Icon name="wallet" size={18} /></span><div className="lbl">Saved</div></div>
                        <div style={{ marginTop: 2, paddingLeft: 20 }}>
                          <div className="val num" style={{ color: savedPositive ? 'var(--green)' : 'var(--clay)' }}>
                            {savedPositive ? '' : '−'}{csym} {fmt(Math.abs(cb.saved))}
                          </div>
                        </div>
                      </div>
                      <div className="card stat">
                        <div className="top"><span className="ic gold"><Icon name="send" size={18} /></span><div className="lbl">{cb.top_category ? `Top: ${cb.top_category.name}` : 'Top category'}</div></div>
                        <div style={{ marginTop: 2, paddingLeft: 20 }}><div className="val num">{csym} {fmt(cb.top_category?.total || 0)}</div></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(data.currency_breakdown || []).length === 0 && (
                <div className="card pad-lg muted text-small">No transactions in this period.</div>
              )}
            </div>
          )}

          {/* Balances by currency — unchanged, all-time */}
          {wallets.length > 1 && (
            <div className="card pad-lg">
              <div className="card-h"><div className="t">Balances by currency</div></div>
              <div className="wallet-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                {wallets.map((w) => {
                  const wsym = SYMBOL[w.currency] || w.currency;
                  const positive = w.balance >= 0;
                  const hasTransfers = Number(w.transferred_in) > 0 || Number(w.transferred_out) > 0;
                  const isOpen = !!openWallets[w.currency];
                  return (
                    <div key={w.currency} className={'card wallet-card' + (isOpen ? ' open' : '')} style={{ flex: '1 1 150px', minWidth: 150 }}>
                      <button type="button" className="wallet-card__head" onClick={() => toggleWallet(w.currency)} aria-expanded={isOpen}>
                        <div className="wallet-card__main">
                          <span className="wallet-card__ccy">{w.currency}</span>
                          <div className="num wallet-card__bal" style={{ color: positive ? 'var(--green)' : 'var(--clay)' }}>
                            {positive ? '' : '−'}{wsym} {fmt(Math.abs(w.balance))}
                          </div>
                        </div>
                        <svg className="wallet-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="wallet-card__details">
                        <div className="muted text-small" style={{ marginTop: 2 }}>+{fmt(w.income)} in · −{fmt(w.expense)} out</div>
                        {hasTransfers && (
                          <div className="muted text-small" style={{ marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {Number(w.transferred_in) > 0 && <span style={{ color: 'var(--green)' }}>↘ {fmt(Number(w.transferred_in))} in</span>}
                            {Number(w.transferred_out) > 0 && <span style={{ color: 'var(--clay)' }}>↗ {fmt(Number(w.transferred_out))} out</span>}
                          </div>
                        )}
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
                  <div className="s">{isAll ? `Last 6 months · ${display}` : `Last 6 months · ${selCurrency}`}</div>
                </div>
              </div>
              <div className="num" style={{ fontSize: 30, fontWeight: 800, marginBottom: 2 }}>{sym} {fmt(toDisplay(t.saved))}</div>
              {isAll && differ && showHome && (
                <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{mainSym} {fmt(Number(t.saved))} in {main}</div>
              )}
              <AreaChart data={(nets.length ? nets : [0, 0]).map(toDisplay)} labels={labels} color="var(--wine)" prefix={sym + ' '} height={236} />
            </div>

            <div className="card pad-lg">
              <div className="card-h">
                <div className="t">{isIncomeView ? 'Income split' : 'Spending split'}</div>
                <div className="seg">
                  <button className={splitView === 'expense' ? 'on' : ''} onClick={() => setSplitView('expense')}>Expense</button>
                  <button className={splitView === 'income' ? 'on' : ''} onClick={() => setSplitView('income')}>Income</button>
                </div>
              </div>
              {split.length === 0 ? (
                <div className="muted text-small" style={{ padding: '20px 0' }}>{isIncomeView ? 'No income this period.' : 'No expenses this period.'}</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
                    <Donut data={split.map((s) => ({ ...s, v: toDisplay(s.v) }))} size={176} stroke={24}
                      center1={`${sym} ${fmt(toDisplay(splitTotal))}`} center2={isIncomeView ? 'INCOME' : (isAll ? 'THIS PERIOD' : selCurrency)} />
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