import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { RATES, SYMBOL, toINR, fmt } from '../lib/currency.js';

export default function Transactions() {
  const { ccy } = usePage();
  const inr = a => '₹' + fmt(Math.round(toINR(a, ccy)));
  const tx = [
    { ic: 'gold',  g: 'F', t: 'Carrefour, MoE', c: 'Food', d: 'Apr 8, 2026', a: 312, sign: -1, st: 'green', sl: 'Paid' },
    { ic: 'teal',  g: 'T', t: 'Salik road toll', c: 'Travel', d: 'Apr 7, 2026', a: 24, sign: -1, st: 'green', sl: 'Paid' },
    { ic: 'wine',  g: 'H', t: 'Family transfer — Kerala', c: 'Family', d: 'Apr 5, 2026', a: 4500, sign: -1, st: 'wine', sl: 'Sent home' },
    { ic: 'plum',  g: 'R', t: 'Rent — JLT studio', c: 'Rent', d: 'Apr 3, 2026', a: 2800, sign: -1, st: 'green', sl: 'Paid' },
    { ic: 'green', g: '+', t: 'Freelance — Logo work', c: 'Income', d: 'Apr 2, 2026', a: 1200, sign: 1, st: 'gold', sl: 'Pending' },
    { ic: 'wine',  g: 'S', t: 'Salary — ADNOC Distribution', c: 'Income', d: 'Apr 1, 2026', a: 11000, sign: 1, st: 'green', sl: 'Received' },
    { ic: 'green', g: '•', t: 'Du mobile postpaid', c: 'Other', d: 'Mar 30, 2026', a: 175, sign: -1, st: 'green', sl: 'Paid' },
    { ic: 'gold',  g: 'F', t: 'Spinneys, JLT', c: 'Food', d: 'Mar 28, 2026', a: 198, sign: -1, st: 'green', sl: 'Paid' },
  ];

  return (
    <>
      <Topbar title="Transactions" sub="Every dirham and rupee, in one place.">
        <button className="btn"><Icon name="download" size={15} /> Export</button>
        <button className="btn pri"><Icon name="plus" size={16} /> New</button>
      </Topbar>

      {/* Filter bar */}
      <div className="row center" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="card row center" style={{ flex: 1, minWidth: 240, gap: 10, padding: '10px 14px' }}>
          <Icon name="search" size={16} />
          <input style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink)' }} placeholder="Search merchant, note or amount" />
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>⌘K</span>
        </div>
        <div className="seg">
          {['All', 'Income', 'Expense'].map((t, i) => <button key={t} className={i === 0 ? 'on' : ''}>{t}</button>)}
        </div>
        <button className="btn"><Icon name="cal" size={15} /> Apr 1 – 30</button>
        <button className="btn"><Icon name="filter" size={15} /> Filter</button>
      </div>

      <div className="card pad-lg" style={{ paddingTop: 6, paddingBottom: 10 }}>
        <table className="tbl tbl-tx">
          <thead>
            <tr>
              <th>Activity</th><th>Category</th><th>Date</th>
              <th style={{ textAlign: 'right' }}>Amount ({ccy})</th>
              <th style={{ textAlign: 'right' }}>In INR</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tx.map((r, i) => (
              <tr key={i}>
                <td style={{ width: '36%' }}><div className="merch"><div className={'m-ic ic ' + r.ic}>{r.g}</div><div style={{ fontWeight: 700 }}>{r.t}</div></div></td>
                <td><span className="chip">{r.c}</span></td>
                <td className="muted">{r.d}</td>
                <td style={{ textAlign: 'right' }}><span className="num" style={{ fontWeight: 700, fontSize: 14.5, color: r.sign > 0 ? 'var(--green)' : 'var(--ink)' }}>{r.sign > 0 ? '+' : '−'}{fmt(r.a)}</span></td>
                <td style={{ textAlign: 'right' }}><span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{inr(r.a)}</span></td>
                <td><span className={'status ' + r.st}>{r.sl}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
