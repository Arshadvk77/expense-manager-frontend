import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon.jsx';
import { SiteNav, SiteFooter, PageHero } from '../components/SiteChrome.jsx';

const TIERS = [
  {
    id: 'free', name: 'Starter', tag: '',
    blurb: 'For getting your money in one place.',
    monthly: 0, yearly: 0,
    cta: 'Start free', pri: false,
    feats: ['2 currency wallets', 'Manual rate entry', 'Up to 50 transactions / month', 'Monthly summary', 'Email support'],
  },
  {
    id: 'plus', name: 'Plus', tag: 'Most popular',
    blurb: 'For sending home on the right day.',
    monthly: 19, yearly: 15,
    cta: 'Start 30-day trial', pri: true,
    feats: ['Everything in Starter', 'Unlimited wallets & transactions', 'Live INR rates + rate alerts', 'Savings goals & milestones', 'Excel & PDF export', 'Priority support'],
  },
  {
    id: 'family', name: 'Family', tag: '',
    blurb: 'For households on both shores.',
    monthly: 39, yearly: 31,
    cta: 'Choose Family', pri: false,
    feats: ['Everything in Plus', 'Up to 5 recipients at home', 'Shared family view', 'Scheduled recurring transfers', 'Dedicated account manager'],
  },
];

const FAQ = [
  ['Is there really a free plan?', 'Yes — Starter is free forever for up to 50 transactions a month and two wallets. No card required to begin.'],
  ['Which currencies are supported?', 'You can earn in AED, OMR, SAR or QAR and track everything paired against INR. More corridors are on the way.'],
  ['Are these real transfer rates?', 'Rates shown in the app are illustrative mid-market references. In production Khaleej wires to a licensed remittance provider for live, executable rates.'],
  ['Can I cancel anytime?', 'Always. Plans are month-to-month (or yearly for a discount) and you can downgrade to Starter whenever you like — your history stays with you.'],
];

export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(true);
  const [open, setOpen] = useState(0);

  return (
    <div className="lp">
      <SiteNav active="pricing" />
      <PageHero
        kicker="Pricing"
        title="Simple plans for every kind of sender."
        lead="Start free, upgrade when your money gets busy. No hidden fees — the only thing you send abroad is your salary home."
      />

      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap">
          <div className="lp-price-toggle">
            <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>Monthly</button>
            <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>Yearly <span className="save">Save 20%</span></button>
          </div>

          <div className="lp-tiers">
            {TIERS.map(t => (
              <div className={'lp-tier' + (t.pri ? ' pop' : '')} key={t.id}>
                {t.tag && <span className="lp-tier-tag">{t.tag}</span>}
                <div className="lp-tier-name">{t.name}</div>
                <div className="lp-tier-blurb">{t.blurb}</div>
                <div className="lp-tier-price">
                  <span className="cur">AED</span>
                  <span className="amt num">{yearly ? t.yearly : t.monthly}</span>
                  <span className="per">/ mo</span>
                </div>
                <div className="lp-tier-note">{t.monthly === 0 ? 'Free forever' : yearly ? 'Billed yearly' : 'Billed monthly'}</div>
                <button className={'btn lg ' + (t.pri ? 'pri' : '')} style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/register')}>{t.cta}</button>
                <ul className="lp-tier-feats">
                  {t.feats.map((f, i) => (
                    <li key={i}><span className="tk"><Icon name="check" size={14} /></span>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div className="lp-steps-wrap">
        <section className="lp-section">
          <div className="lp-wrap" style={{ maxWidth: 760 }}>
            <div className="lp-head" style={{ marginBottom: 36 }}>
              <div className="lp-kicker">FAQ</div>
              <h2 className="lp-h2">Questions, answered.</h2>
            </div>
            <div className="lp-faq">
              {FAQ.map(([q, a], i) => (
                <div className={'lp-faq-item' + (open === i ? ' open' : '')} key={i}>
                  <button className="q" onClick={() => setOpen(open === i ? -1 : i)}>
                    <span>{q}</span>
                    <span className="chev"><Icon name="down" size={18} /></span>
                  </button>
                  {open === i && <p className="a">{a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-cta">
            <h2>Still weighing it up?</h2>
            <p>Start on Starter for free. You can always move up to Plus the first time you wish you'd caught a better rate.</p>
            <div className="lp-cta-row" style={{ justifyContent: 'center' }}>
              <button className="btn pri lg" onClick={() => navigate('/register')}>Get started free <Icon name="right" size={16} /></button>
              <button className="btn lg" onClick={() => navigate('/contact')}>Talk to us</button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
