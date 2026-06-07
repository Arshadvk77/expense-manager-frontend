import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { AreaChart } from '../components/Charts.jsx';
import { RATES, SYMBOL, toINR, fmt } from '../lib/currency.js';

export default function Convert() {
  const { ccy } = usePage();
  const amount = 5000;
  const inr = Math.round(toINR(amount, ccy));
  const rateHist = [22.33, 22.4, 22.38, 22.45, 22.5, 22.48, 22.55, 22.6, 22.62, 22.65];
  const hist = [
    { f: 'AED 4,500', t: '₹1,01,925', d: 'Apr 4', r: '22.65' },
    { f: 'AED 3,200', t: '₹71,840', d: 'Mar 12', r: '22.45' },
    { f: 'AED 5,000', t: '₹1,12,100', d: 'Feb 28', r: '22.42' },
  ];

  return (
    <>
      <Topbar title="Convert" sub="Live mid-market rates · IndusInd buy reference.">
        <button className="btn"><Icon name="bell" size={15} /> Rate alert</button>
        <button className="btn pri"><Icon name="send" size={15} /> Send to India</button>
      </Topbar>

      <div className="grid cols-main" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <div className="card pad-lg">
          <div style={{ background: 'var(--bg-2)', borderRadius: 18, padding: '20px 22px' }} className="row between center">
            <div>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>You send</div>
              <div className="num amt-xl" style={{ fontSize: 46, fontWeight: 800, marginTop: 6 }}>{fmt(amount)}<span style={{ color: 'var(--muted)' }}>.00</span></div>
            </div>
            <span className="chip" style={{ background: 'var(--card)', padding: '8px 14px' }}><span className="m-ic ic wine" style={{ width: 26, height: 26, fontFamily: 'var(--mono)', fontSize: 10 }}>{ccy}</span> {ccy} <Icon name="down" size={14} /></span>
          </div>

          <div className="row" style={{ justifyContent: 'center', margin: '-12px 0', position: 'relative', zIndex: 1 }}>
            <div className="icon-btn" style={{ borderRadius: 999 }}><Icon name="convert" size={16} /></div>
          </div>

          <div style={{ background: 'var(--wine-tint)', borderRadius: 18, padding: '20px 22px' }} className="row between center">
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--wine)' }}>They receive</div>
              <div className="num amt-xl" style={{ fontSize: 46, fontWeight: 800, marginTop: 6, color: 'var(--wine)' }}>₹{fmt(inr)}</div>
            </div>
            <span className="chip" style={{ background: 'var(--card)', padding: '8px 14px' }}><span className="m-ic ic gold" style={{ width: 26, height: 26, fontSize: 12 }}>₹</span> INR <Icon name="down" size={14} /></span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 20 }}>
            {[['Rate', `₹${RATES[ccy].toFixed(2)}`], ['Fee', `${ccy} 0.00`], ['Arrives', '~ 4 min']].map((r, i) => (
              <div key={i}>
                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r[0]}</div>
                <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{r[1]}</div>
                {i === 1 && <div className="mono" style={{ fontSize: 9.5, color: 'var(--green)', marginTop: 2 }}>WAIVED · APR</div>}
              </div>
            ))}
          </div>

          <button className="btn pri lg" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>Review &amp; send</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card pad-lg">
            <div className="card-h" style={{ marginBottom: 8 }}>
              <div><div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Rate · 30 days</div><div className="num" style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>₹{RATES[ccy].toFixed(2)}</div></div>
              <span className="delta up">↑ 1.03%</span>
            </div>
            <AreaChart data={rateHist} labels={['', '', '', '', '', '', '', '', '', '']} color="var(--wine)" prefix="₹" height={120} />
          </div>

          <div className="card pad-lg">
            <div className="t" style={{ marginBottom: 6 }}>Past conversions</div>
            {hist.map((h, i) => (
              <div key={i} className="row between center" style={{ padding: '11px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{h.f} → {h.t}</div><div className="mono muted" style={{ fontSize: 10.5 }}>{h.d} · @ ₹{h.r}</div></div>
                <button className="btn ghost" style={{ fontSize: 12, padding: '5px 10px' }}>Repeat</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
