import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon.jsx';
import { SiteNav, SiteFooter } from '../components/SiteChrome.jsx';

/* Khaleej — marketing landing page.
   Depends only on: theme.css tokens, landing.css, and the shared <Icon/>.
   Drop <Landing/> on a route (e.g. <Route path="/" element={<Landing/>} />). */

const FEATURES = [
  { ic: 'wine',  icon: 'wallet',  h: 'Dual-currency ledger', p: 'Every dirham you earn and every rupee you send, side by side. No spreadsheets, no mental math.' },
  { ic: 'gold',  icon: 'convert', h: 'Live INR rates',        p: 'Mid-market rates refreshed by the minute, with rate alerts so you transfer on a good day — not a bad one.' },
  { ic: 'green', icon: 'chart',   h: 'Goal tracking',         p: 'Set a savings target for home and watch the bar fill. Milestones at 25, 50, 75 and 100 percent.' },
];
const STEPS = [
  { h: 'Add your wallets', p: 'Connect the currencies you earn in — AED, OMR, SAR or QAR — in under a minute.' },
  { h: 'Log as you go',    p: 'Salary, rent, groceries, transfers. A tap each, paired with the rupee value automatically.' },
  { h: 'Send home smarter', p: 'Convert at the right rate and track exactly how much reaches your family back home.' },
];
const STATS = [
  { big: '4', cap: 'Gulf currencies, one ledger' },
  { big: '₹8.1L', cap: 'Median sent home / year' },
  { big: '~4 min', cap: 'Average transfer time' },
  { big: '0', cap: 'Fees on your first month' },
];

export default function Landing() {
  const navigate = useNavigate();
  const go = () => navigate('/register');
  const signin = () => navigate('/login');

  return (
    <div className="lp">
      <SiteNav active="features" />

      {/* Hero */}
      <header className="lp-hero">
        <div className="lp-wrap lp-hero-grid">
          <div>
            <span className="lp-eyebrow"><b>New</b> Rate alerts are live</span>
            <h1 className="lp-h1">Your money, <span className="em">both sides</span> of the sea.</h1>
            <p className="lp-sub">
              Khaleej is the calm ledger for Gulf workers — track the salary you earn abroad and the
              rupees that reach home, in one place, in two currencies.
            </p>
            <div className="lp-cta-row">
              <button className="btn pri lg" onClick={go}>Start free <Icon name="right" size={16} /></button>
              <button className="btn lg" onClick={signin}>See a live demo</button>
            </div>
            <div className="lp-note">
              <span><span className="tick"><Icon name="check" size={15} /></span> No card required</span>
              <span><span className="tick"><Icon name="check" size={15} /></span> AED · OMR · SAR · QAR</span>
              <span><span className="tick"><Icon name="check" size={15} /></span> Cancel anytime</span>
            </div>
          </div>

          {/* Product mock */}
          <div className="lp-mock">
            <div className="lp-float a">
              <span className="fi ic green"><Icon name="in" size={18} /></span>
              <div><div className="ft">Salary received</div><div className="fv">AED 11,000</div></div>
            </div>
            <div className="lp-mock-card">
              <div className="lp-mock-bal">
                <span className="glow" />
                <div className="lbl">Total saved</div>
                <div className="amt">AED 35,920</div>
                <div className="inr mono">≈ ₹8,13,580 reaches home</div>
              </div>
              <div className="lp-mock-rows">
                {[
                  { ic: 'wine',  g: 'H', n: 'Family transfer', s: 'Kerala · Apr 5', v: '− AED 4,500', c: 'var(--ink)' },
                  { ic: 'gold',  g: 'F', n: 'Carrefour, MoE', s: 'Food · Apr 8', v: '− AED 312', c: 'var(--ink)' },
                  { ic: 'green', g: '+', n: 'Freelance — Logo', s: 'Income · Apr 2', v: '+ AED 1,200', c: 'var(--green)' },
                ].map((r, i) => (
                  <div className="lp-mock-row" key={i}>
                    <span className={'m-ic ic ' + r.ic}>{r.g}</span>
                    <span className="nm"><b>{r.n}</b><small>{r.s}</small></span>
                    <span className="v" style={{ color: r.c }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-float b">
              <span className="fi ic gold"><Icon name="convert" size={18} /></span>
              <div><div className="ft">1 AED today</div><div className="fv">₹22.65</div></div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust strip */}
      <div className="lp-trust">
        <div className="lp-wrap lp-trust-in">
          <span>Built for workers across the Gulf</span>
          <b>Dubai</b><b>Muscat</b><b>Riyadh</b><b>Doha</b><b>Abu Dhabi</b>
        </div>
      </div>

      {/* Features */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head">
            <div className="lp-kicker">Why Khaleej</div>
            <h2 className="lp-h2">Everything a remittance life needs — nothing it doesn't.</h2>
            <p className="lp-lead">Three currencies in the morning, rupees by the evening. Khaleej keeps both halves of your money honest.</p>
          </div>
          <div className="lp-features">
            {FEATURES.map((f, i) => (
              <div className="lp-feat" key={i}>
                <span className={'fic ic ' + f.ic}><Icon name={f.icon} size={22} /></span>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
                <span className="more">Learn more <Icon name="right" size={14} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <div className="lp-steps-wrap">
        <section className="lp-section">
          <div className="lp-wrap">
            <div className="lp-head">
              <div className="lp-kicker">How it works</div>
              <h2 className="lp-h2">Set up once. Stay clear for good.</h2>
            </div>
            <div className="lp-steps">
              {STEPS.map((s, i) => (
                <div className="lp-step" key={i}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile app — coming soon */}
      <section className="lp-section" id="app">
        <div className="lp-wrap">
          <div className="lp-app">
            <div className="lp-app-copy">
              <span className="lp-eyebrow"><b>Soon</b> iOS &amp; Android</span>
              <h2 className="lp-h2" style={{ marginTop: 18 }}>Khaleej in your pocket — coming soon.</h2>
              <p className="lp-lead">Log an expense at the till, check today's rate on the bus, send home from the sofa. The full ledger, built for the phone you actually carry.</p>
              <div className="lp-store">
                <span className="lp-badge"><Icon name="download" size={18} /><span><small>Coming soon to</small><b>App Store</b></span></span>
                <span className="lp-badge"><Icon name="download" size={18} /><span><small>Coming soon to</small><b>Google Play</b></span></span>
              </div>
              <form className="lp-waitlist" onSubmit={e => e.preventDefault()}>
                <input className="input" placeholder="you@email.com" defaultValue="" aria-label="Email" />
                <button className="btn pri" type="submit">Notify me</button>
              </form>
              <div className="lp-note"><span><span className="tick"><Icon name="check" size={15} /></span> Early access · no spam, one email at launch</span></div>
            </div>
            <div className="lp-app-art">
              <div className="lp-phone">
                <span className="notch" />
                <div className="scr">
                  <div className="ph-top">
                    <div><div className="ph-hi">Hi, Rashid</div><div className="ph-sub">April overview</div></div>
                    <span className="ava">R</span>
                  </div>
                  <div className="ph-bal">
                    <span className="glow" />
                    <div className="lbl">Total saved</div>
                    <div className="amt">AED 35,920</div>
                    <div className="inr mono">≈ ₹8,13,580</div>
                  </div>
                  <div className="ph-rows">
                    {[
                      { ic: 'green', g: '+', n: 'Salary — ADNOC', v: '+ 11,000', c: 'var(--green)' },
                      { ic: 'wine',  g: 'H', n: 'Family transfer', v: '− 4,500', c: 'var(--ink)' },
                      { ic: 'gold',  g: 'F', n: 'Carrefour', v: '− 312', c: 'var(--ink)' },
                    ].map((r, i) => (
                      <div className="ph-row" key={i}>
                        <span className={'m-ic ic ' + r.ic} style={{ width: 30, height: 30, fontSize: 12 }}>{r.g}</span>
                        <span className="nm">{r.n}</span>
                        <span className="v num" style={{ color: r.c }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ph-tab">
                    <span className="on"><Icon name="grid" size={19} /></span>
                    <span><Icon name="chart" size={19} /></span>
                    <span className="fab"><Icon name="plus" size={20} /></span>
                    <span><Icon name="list" size={19} /></span>
                    <span><Icon name="gear" size={19} /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat band */}
      <div className="lp-band">
        <span className="glow g1" /><span className="glow g2" />
        <div className="lp-wrap lp-band-in">
          {STATS.map((s, i) => (
            <div className="lp-stat" key={i}>
              <div className="big num">{s.big}</div>
              <div className="cap">{s.cap}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <section className="lp-section">
        <div className="lp-wrap lp-quote">
          <div className="lp-kicker" style={{ marginBottom: 18 }}>Loved by senders</div>
          <p className="q">"I finally see my Dubai salary and my family's rupees in <span>one calm screen</span>. I send home on the right day now — not the day I happen to remember."</p>
          <div className="by">
            <span className="av">R</span>
            <span className="who"><b>Rashid Ahmed</b><small>Logistics · Dubai → Kochi</small></span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div className="lp-wrap">
          <div className="lp-cta">
            <h2>Start your ledger in two minutes.</h2>
            <p>Free for your first month, no card required. Track every dirham earned and every rupee sent home.</p>
            <div className="lp-cta-row" style={{ justifyContent: 'center' }}>
              <button className="btn pri lg" onClick={go}>Create your account <Icon name="right" size={16} /></button>
              <button className="btn lg" onClick={signin}>Sign in</button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
