import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { Sparkline, AreaChart, Donut } from '../components/Charts.jsx';
import { useNavigate } from 'react-router-dom';
import { RATES, SYMBOL, toINR, fmt } from '../lib/currency.js';

export default function Dashboard() {
  const { ccy } = usePage();
  const navigate = useNavigate();
  const inr = a => '₹' + fmt(Math.round(toINR(a, ccy)));

  const stats = [
    { ic: 'wine',  icon: 'wallet', lbl: 'Total saved', val: 8420, delta: '12.4%', up: true,  spark: [40, 52, 48, 61, 58, 72, 80], color: 'var(--wine)' },
    { ic: 'green', icon: 'in',     lbl: 'Income · Apr', val: 14500, delta: '2.1%', up: true,  spark: [60, 62, 65, 64, 68, 70, 72], color: 'var(--green)' },
    { ic: 'clay',  icon: 'out',    lbl: 'Spent · Apr',  val: 6080,  delta: '10.6%', up: false, spark: [70, 66, 72, 60, 58, 52, 48], color: 'var(--clay)' },
    { ic: 'gold',  icon: 'send',   lbl: 'Sent home',    val: 4500,  delta: '8.0%', up: true,  spark: [30, 38, 35, 44, 50, 48, 56], color: 'var(--gold)' },
  ];

  const flow = [12200, 13100, 13800, 14000, 14200, 14500, 14800];
  const flowLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

  const split = [
    { name: 'Family', v: 4500, color: 'var(--wine)' },
    { name: 'Rent',   v: 2800, color: 'var(--plum)' },
    { name: 'Food',   v: 1240, color: 'var(--gold)' },
    { name: 'Travel', v: 580,  color: 'var(--teal)' },
    { name: 'Other',  v: 560,  color: 'var(--clay)' },
  ];

  const wallets = [
    { c: 'AED', n: 'UAE Dirham', s: 'Salary · active', a: 22678 },
    { c: 'OMR', n: 'Omani Rial', s: 'Freelance · active', a: 340 },
    { c: 'SAR', n: 'Saudi Riyal', s: 'Old · inactive', a: 1200 },
  ];

  const tx = [
    { ic: 'wine',  g: 'S', t: 'Salary — ADNOC', c: 'Income', d: 'Apr 1', a: 11000, sign: 1, st: 'green', sl: 'Received' },
    { ic: 'clay',  g: 'R', t: 'Rent — JLT studio', c: 'Rent', d: 'Apr 3', a: 2800, sign: -1, st: 'green', sl: 'Paid' },
    { ic: 'wine',  g: 'H', t: 'Family transfer', c: 'Family', d: 'Apr 5', a: 4500, sign: -1, st: 'wine', sl: 'Sent home' },
    { ic: 'gold',  g: 'F', t: 'Carrefour groceries', c: 'Food', d: 'Apr 8', a: 312, sign: -1, st: 'green', sl: 'Paid' },
    { ic: 'green', g: '+', t: 'Freelance — Logo', c: 'Income', d: 'Apr 9', a: 1200, sign: 1, st: 'gold', sl: 'Pending' },
  ];

  return (
    <>
      <Topbar title="Welcome back, Rashid" sub="Here's how your money moved this month.">
        <div className="seg" style={{ marginRight: 4 }}>
          <button>Week</button><button className="on">Month</button><button>Year</button>
        </div>
        <button className="btn pri" onClick={() => navigate('/income')}><Icon name="plus" size={16} /> Add</button>
      </Topbar>

      {/* Highlights */}
      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} className="card stat">
            <div className="top">
              <span className={'ic ' + s.ic}><Icon name={s.icon} size={18} /></span>
              <span className={'delta ' + (s.up ? 'up' : 'down')}>{s.up ? '↑' : '↓'} {s.delta}</span>
            </div>
            <div className="lbl">{s.lbl}</div>
            <div className="row between center" style={{ marginTop: 2 }}>
              <div>
                <div className="val num">{SYMBOL[ccy]} {fmt(s.val)}</div>
                <div className="inr">{inr(s.val)}</div>
              </div>
              <Sparkline data={s.spark} color={s.color} />
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
              <div className="s">Trending up · last 7 months</div>
            </div>
            <div className="seg"><button>Monthly</button><button className="on">Yearly</button></div>
          </div>
          <div className="row" style={{ alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
            <div className="num" style={{ fontSize: 30, fontWeight: 800 }}>{SYMBOL[ccy]} 35,920</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>≈ {inr(35920)} reaches home</div>
          </div>
          <AreaChart data={flow} labels={flowLabels} color="var(--wine)" prefix={SYMBOL[ccy] + ' '} height={236} />
        </div>

        <div className="card pad-lg">
          <div className="card-h">
            <div className="t">Spending split</div>
            <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="dots" size={16} /></button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 14px' }}>
            <Donut data={split} size={176} stroke={24} center1={SYMBOL[ccy] + ' 9.7k'} center2="THIS MONTH" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {split.map((s, i) => (
              <div key={i} className="row between center" style={{ fontSize: 12.5 }}>
                <span className="row center" style={{ gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
                  <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{s.name}</span>
                </span>
                <span className="mono" style={{ color: 'var(--muted)' }}>{SYMBOL[ccy]} {fmt(s.v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + wallets */}
      <div className="grid cols-main" style={{ gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
        <div className="card pad-lg">
          <div className="card-h">
            <div className="t">Recent activity</div>
            <button className="btn ghost" onClick={() => navigate('/transactions')} style={{ fontSize: 12.5 }}>View all <Icon name="right" size={14} /></button>
          </div>
          <table className="tbl tbl-mini">
            <tbody>
              {tx.map((r, i) => (
                <tr key={i}>
                  <td style={{ width: '46%' }}>
                    <div className="merch">
                      <div className={'m-ic ic ' + r.ic}>{r.g}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.t}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.c} · {r.d}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontWeight: 700, color: r.sign > 0 ? 'var(--green)' : 'var(--ink)' }}>{r.sign > 0 ? '+' : '−'}{SYMBOL[ccy]} {fmt(r.a)}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{inr(r.a)}</div>
                  </td>
                  <td style={{ textAlign: 'right', width: 110 }}><span className={'status ' + r.st}>{r.sl}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card pad-lg">
          <div className="card-h">
            <div className="t">My wallets</div>
            <button className="btn ghost" onClick={() => navigate('/convert')} style={{ fontSize: 12.5 }}><Icon name="plus" size={14} /> Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {wallets.map((w, i) => (
              <div key={i} className="row center" style={{ gap: 12, padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
                <span className="m-ic ic wine" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{w.c}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{w.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.s}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="num" style={{ fontWeight: 700 }}>{fmt(w.a)}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{inr(w.a)}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn lg" onClick={() => navigate('/convert')} style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
            <Icon name="send" size={15} /> Send to India
          </button>
        </div>
      </div>
    </>
  );
}
