import { useEffect, useState } from 'react';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Bars, Donut, AreaChart } from '../components/Charts.jsx';
import { fmt } from '../lib/currency.js';
import { reportsAPI } from '../api/reports';

const PERIODS = [
  { key: 'month', label: 'Month' },
  { key: '3m',    label: '3M' },
  { key: 'year',  label: 'Year' },
  { key: 'all',   label: 'All' },
];

const CAT_COLORS = ['var(--wine)', 'var(--plum)', 'var(--gold)', 'var(--teal)', 'var(--clay)', 'var(--muted-2)', '#0891b2', '#7c3aed'];

const compact = (n) => {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return fmt(n);
};

const changeLabel = (pct) => {
  if (pct === null || pct === undefined) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}% vs prev`;
};

export default function Reports() {
  const [period, setPeriod] = useState('year');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    reportsAPI.summary(period)
      .then(setData)
      .catch((err) => setError(err.message || 'Could not load reports.'))
      .finally(() => setLoading(false));
  }, [period]);

  const main = data?.main_currency || 'OMR';

  const kpis = [
    { ic: 'green', icon: 'in',     l: 'Income',  v: data?.kpis.income,  pct: data?.kpis.income_change_pct },
    { ic: 'clay',  icon: 'out',    l: 'Expense', v: data?.kpis.expense, pct: data?.kpis.expense_change_pct },
    { ic: 'wine',  icon: 'wallet', l: 'Saved',   v: data?.kpis.saved,   pct: data?.kpis.saved_change_pct },
    { ic: 'gold',  icon: 'send',   l: 'Currencies used', v: data?.by_currency?.length ?? 0, raw: true },
  ];

  const pairs   = (data?.trend || []).map((t) => [t.income, t.expense]);
  const months  = (data?.trend || []).map((t) => t.month);
  const savings = (data?.savings_cumulative || []).map((s) => s.value);

  const byCategory = (data?.by_category || []).map((c, i) => ({
    name: c.name,
    v: c.value,
    color: c.color || CAT_COLORS[i % CAT_COLORS.length],
  }));
  const categoryTotal = byCategory.reduce((s, c) => s + c.v, 0);

  const byCurrency      = data?.by_currency || [];
  const maxCurrencySpend = Math.max(1, ...byCurrency.map((c) => c.expense_main));

  return (
    <>
      <Topbar title="Reports" sub="Where the money went — and what stayed.">
        <div className="seg">
          {PERIODS.map((p) => (
            <button key={p.key} className={period === p.key ? 'on' : ''} onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
        <button className="btn"><Icon name="download" size={15} /> Export PDF</button>
      </Topbar>

      {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>{error}</div>}
      {loading && <div className="card pad-lg muted">Loading…</div>}

      {!loading && data && (
        <>
          {/* KPIs */}
          <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {kpis.map((k, i) => (
              <div key={i} className="card stat">
                <div className="top"><span className={'ic ' + k.ic}><Icon name={k.icon} size={18} /></span></div>
                <div className="lbl">{k.l}</div>
                <div className="val num" style={{ color: k.ic === 'wine' || k.ic === 'gold' ? 'var(--wine)' : 'var(--ink)' }}>
                  {k.raw ? k.v : `${main} ${compact(k.v || 0)}`}
                </div>
                {!k.raw && <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{changeLabel(k.pct)}</div>}
              </div>
            ))}
          </div>

          {/* Trend + by category */}
          <div className="grid cols-main" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
            <div className="card pad-lg">
              <div className="card-h">
                <div><div className="t">Income vs Expense</div><div className="s">Last 6 months · {main}</div></div>
                <div className="row" style={{ gap: 14, fontSize: 11.5, color: 'var(--muted)' }}>
                  <span><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--wine)', display: 'inline-block', marginRight: 5 }} />Income</span>
                  <span><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--gold)', display: 'inline-block', marginRight: 5 }} />Expense</span>
                </div>
              </div>
              <Bars pairs={pairs} labels={months} height={230} />
            </div>

            <div className="card pad-lg">
              <div className="card-h"><div className="t">By category</div><span className="chip">{period}</span></div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
                <Donut data={byCategory} size={170} stroke={22} center1={`${main} ${compact(categoryTotal)}`} center2="SPENT" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {byCategory.slice(0, 4).map((s, i) => (
                  <div key={i} className="row between center" style={{ fontSize: 12.5 }}>
                    <span className="row center" style={{ gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
                      <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{s.name}</span>
                    </span>
                    <span className="mono muted">{main} {fmt(s.v)}</span>
                  </div>
                ))}
                {byCategory.length === 0 && <div className="muted text-small">No expenses in this period.</div>}
              </div>
            </div>
          </div>

          {/* By currency — NEW */}
          <div className="card pad-lg">
            <div className="card-h">
              <div>
                <div className="t">By currency</div>
                <div className="s">How much you actually moved, in each currency</div>
              </div>
              <span className="chip">{byCurrency.length} {byCurrency.length === 1 ? 'currency' : 'currencies'}</span>
            </div>

            {byCurrency.length === 0 && <div className="muted text-small">No transactions in this period.</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              {byCurrency.map((c) => {
                const widthPct = Math.max(2, (c.expense_main / maxCurrencySpend) * 100);
                return (
                  <div key={c.currency}>
                    <div className="row between center" style={{ marginBottom: 6 }}>
                      <div className="row center" style={{ gap: 10 }}>
                        <span className="chip wine mono">{c.currency}</span>
                        <span className="muted text-small">{c.count} txn{c.count === 1 ? '' : 's'}</span>
                      </div>
                      <div className="row center" style={{ gap: 14, fontSize: 13 }}>
                        {c.income > 0 && (
                          <span><span className="muted text-small">in </span><span className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(c.income)}</span></span>
                        )}
                        {c.expense > 0 && (
                          <span><span className="muted text-small">out </span><span className="num" style={{ color: 'var(--clay)', fontWeight: 700 }}>{fmt(c.expense)}</span></span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${widthPct}%`, height: '100%', background: 'var(--wine)', borderRadius: 999 }} />
                    </div>
                    {c.currency !== main && c.expense_main > 0 && (
                      <div className="muted text-small" style={{ marginTop: 4 }}>
                        ≈ {main} {fmt(c.expense_main)} spent
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cumulative savings */}
          <div className="card pad-lg">
            <div className="card-h">
              <div><div className="t">Cumulative savings</div><div className="s">Last 6 months</div></div>
              <div className="num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--wine)' }}>
                {main} {compact(savings[savings.length - 1] || 0)}
              </div>
            </div>
            <AreaChart data={savings} labels={months} color="var(--wine)" prefix={`${main} `} height={210} />
          </div>
        </>
      )}
    </>
  );
}