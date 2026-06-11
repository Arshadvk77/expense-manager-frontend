import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon.jsx';
import { SiteNav, SiteFooter, PageHero } from '../components/SiteChrome.jsx';

const VALUES = [
  { ic: 'wine',  icon: 'wallet', h: 'Clarity over cleverness', p: 'Money is stressful enough. Every screen earns its place or it goes. No dark patterns, no buried fees.' },
  { ic: 'green', icon: 'in',     h: 'Both shores matter',      p: 'A salary in Dubai and a family in Kochi are one story. We build for the whole journey, not half of it.' },
  { ic: 'gold',  icon: 'convert', h: 'Honest by default',      p: 'Mid-market rates, plain language, and numbers you can check. Trust is the only currency that compounds.' },
];
const STATS = [
  { big: '2024', cap: 'Founded in Dubai & Kochi' },
  { big: '4', cap: 'Gulf currencies supported' },
  { big: '11', cap: 'People across two shores' },
  { big: '₹40Cr+', cap: 'Tracked home to date' },
];
const TIMELINE = [
  ['2024', 'The napkin', 'A spreadsheet shared between a Dubai foreman and his family back home became the first prototype.'],
  ['2025', 'First ledger', 'Dual-currency tracking, live INR rates and goals shipped to a few hundred early senders.'],
  ['2026', 'Going mobile', 'Rate alerts launched; the iOS and Android apps enter early access.'],
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="lp">
      <SiteNav active="about" />
      <PageHero
        kicker="About"
        title="We built the ledger we wished our families had."
        lead="Khaleej started as a spreadsheet passed between a Gulf worker and his family back home. It grew into a calmer way to see money on both shores."
      />

      {/* Mission */}
      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap lp-about-mission">
          <div>
            <div className="lp-kicker">Our mission</div>
            <h2 className="lp-h2" style={{ marginTop: 12 }}>Make every dirham earned and every rupee sent feel understood.</h2>
          </div>
          <div className="lp-about-copy">
            <p>Millions of people earn in one currency and care for a family in another. The tools they're handed treat that as two unrelated problems — a banking app here, a remittance receipt there, mental math in between.</p>
            <p>Khaleej holds both halves in one calm view: what you earn, what you keep, and exactly how much reaches home. No spreadsheets at midnight, no guessing at the rate.</p>
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

      {/* Values */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head">
            <div className="lp-kicker">What we believe</div>
            <h2 className="lp-h2">Three principles we don't bend.</h2>
          </div>
          <div className="lp-features">
            {VALUES.map((v, i) => (
              <div className="lp-feat" key={i}>
                <span className={'fic ic ' + v.ic}><Icon name={v.icon} size={22} /></span>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <div className="lp-steps-wrap">
        <section className="lp-section">
          <div className="lp-wrap" style={{ maxWidth: 760 }}>
            <div className="lp-head" style={{ marginBottom: 36 }}>
              <div className="lp-kicker">Our story</div>
              <h2 className="lp-h2">From napkin to ledger.</h2>
            </div>
            <div className="lp-timeline">
              {TIMELINE.map(([y, h, p], i) => (
                <div className="lp-tl-item" key={i}>
                  <div className="lp-tl-year">{y}</div>
                  <div className="lp-tl-body">
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-cta">
            <h2>Come build calmer money with us.</h2>
            <p>Whether you want to use Khaleej or help build it, both shores are welcome.</p>
            <div className="lp-cta-row" style={{ justifyContent: 'center' }}>
              <button className="btn pri lg" onClick={() => navigate('/register')}>Get started <Icon name="right" size={16} /></button>
              <button className="btn lg" onClick={() => navigate('/contact')}>Contact us</button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
