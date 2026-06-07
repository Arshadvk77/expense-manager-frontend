import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Bars, Donut, AreaChart } from '../components/Charts.jsx';
import { RATES, SYMBOL, toINR, fmt } from '../lib/currency.js';

export default function Reports() {
  const { ccy } = usePage();
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const pairs = [[12200, 7800], [13100, 8400], [13800, 7200], [14000, 7600], [14200, 6800], [14500, 6080]];
  const savings = [1800, 3200, 4800, 6900, 11000, 14800];

  const split = [
    { name: 'Family', v: 4500, color: 'var(--wine)' },
    { name: 'Rent', v: 2800, color: 'var(--plum)' },
    { name: 'Food', v: 1240, color: 'var(--gold)' },
    { name: 'Travel', v: 580, color: 'var(--teal)' },
    { name: 'Shopping', v: 340, color: 'var(--clay)' },
    { name: 'Other', v: 220, color: 'var(--muted-2)' },
  ];

  const kpis = [
    { ic: 'green', icon: 'in', l: 'Income · 6mo', v: 'AED 81.8k', d: '+9% YoY' },
    { ic: 'clay', icon: 'out', l: 'Expense · 6mo', v: 'AED 45.9k', d: '−4% YoY' },
    { ic: 'wine', icon: 'wallet', l: 'Saved · 6mo', v: 'AED 35.9k', d: '+18% YoY' },
    { ic: 'gold', icon: 'send', l: 'Sent home', v: '₹8.1L', d: 'lifetime' },
  ];

  return (
    <>
      <Topbar title="Reports" sub="Where the money went — and what stayed.">
        <div className="seg">{['Month', '3M', 'Year', 'All'].map((t, i) => <button key={t} className={i === 2 ? 'on' : ''}>{t}</button>)}</div>
        <button className="btn"><Icon name="download" size={15} /> Export PDF</button>
      </Topbar>

      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} className="card stat">
            <div className="top"><span className={'ic ' + k.ic}><Icon name={k.icon} size={18} /></span></div>
            <div className="lbl">{k.l}</div>
            <div className="val num" style={{ color: k.ic === 'wine' || k.ic === 'gold' ? 'var(--wine)' : 'var(--ink)' }}>{k.v}</div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>{k.d}</div>
          </div>
        ))}
      </div>

      <div className="grid cols-main" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
        <div className="card pad-lg">
          <div className="card-h">
            <div><div className="t">Income vs Expense</div><div className="s">Last 6 months</div></div>
            <div className="row" style={{ gap: 14, fontSize: 11.5, color: 'var(--muted)' }}>
              <span><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--wine)', display: 'inline-block', marginRight: 5 }} />Income</span>
              <span><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--gold)', display: 'inline-block', marginRight: 5 }} />Expense</span>
            </div>
          </div>
          <Bars pairs={pairs} labels={months} height={230} />
        </div>

        <div className="card pad-lg">
          <div className="card-h"><div className="t">By category</div><span className="chip">April</span></div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
            <Donut data={split} size={170} stroke={22} center1="AED 9.7k" center2="SPENT" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {split.slice(0, 4).map((s, i) => (
              <div key={i} className="row between center" style={{ fontSize: 12.5 }}>
                <span className="row center" style={{ gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} /><span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{s.name}</span></span>
                <span className="mono muted">{SYMBOL[ccy]} {fmt(s.v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card pad-lg">
        <div className="card-h">
          <div><div className="t">Cumulative savings</div><div className="s">Climbing steadily this year</div></div>
          <div className="num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--wine)' }}>₹8.1L total</div>
        </div>
        <AreaChart data={savings} labels={months} color="var(--wine)" prefix={SYMBOL[ccy] + ' '} height={210} />
      </div>
    </>
  );
}
