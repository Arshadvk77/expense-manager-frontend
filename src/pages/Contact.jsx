import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon.jsx';
import { SiteNav, SiteFooter, PageHero } from '../components/SiteChrome.jsx';

const METHODS = [
  { ic: 'wine',  icon: 'mail',   h: 'Email us',     d: 'hello@khaleej.app', s: 'We reply within one business day.' },
  { ic: 'green', icon: 'bell',   h: 'Support',      d: 'help@khaleej.app',  s: 'Sun–Thu · 9am–6pm Gulf Standard Time.' },
  { ic: 'gold',  icon: 'wallet', h: 'Partnerships', d: 'partners@khaleej.app', s: 'Remittance providers & employers.' },
];
const OFFICES = [
  ['Dubai', 'Business Bay · DIFC corridor'],
  ['Kochi', 'Infopark · Kakkanad'],
];
const TOPICS = ['General', 'Billing', 'Transfers', 'Partnership'];

export default function Contact() {
  const navigate = useNavigate();
  return (
    <div className="lp">
      <SiteNav active="contact" />
      <PageHero
        kicker="Contact"
        title="Talk to a human on either shore."
        lead="Questions about a transfer, your plan, or bringing Khaleej to your workforce — we're a short message away."
      />

      <section className="lp-section" style={{ paddingTop: 8 }}>
        <div className="lp-wrap lp-contact-grid">
          {/* Form */}
          <div className="lp-contact-form card pad-lg">
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Send us a message</h2>
            <p className="muted" style={{ fontSize: 13.5, margin: '6px 0 22px' }}>Fill this in and we'll route it to the right person.</p>
            <form onSubmit={e => e.preventDefault()}>
              <div className="lp-form-row">
                <div className="field"><label>First name</label><input className="input" defaultValue="" placeholder="Rashid" /></div>
                <div className="field"><label>Last name</label><input className="input" defaultValue="" placeholder="Ahmed" /></div>
              </div>
              <div className="field" style={{ marginTop: 16 }}><label>Email</label><input className="input" type="email" placeholder="you@email.com" /></div>
              <div className="field" style={{ marginTop: 16 }}>
                <label>Topic</label>
                <div className="lp-chip-row">
                  {TOPICS.map((t, i) => <span key={t} className={'chip' + (i === 0 ? ' wine' : '')} style={{ cursor: 'pointer' }}>{t}</span>)}
                </div>
              </div>
              <div className="field" style={{ marginTop: 16 }}>
                <label>Message</label>
                <textarea className="input" rows={5} style={{ resize: 'vertical', minHeight: 120 }} placeholder="How can we help?" />
              </div>
              <button className="btn pri lg" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                <Icon name="send" size={16} /> Send message
              </button>
              <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                By sending you agree to our <a onClick={() => navigate('/privacy')} style={{ color: 'var(--wine)', cursor: 'pointer' }}>Privacy Policy</a>.
              </p>
            </form>
          </div>

          {/* Aside */}
          <div className="lp-contact-aside">
            {METHODS.map((m, i) => (
              <div className="lp-method" key={i}>
                <span className={'fic ic ' + m.ic}><Icon name={m.icon} size={20} /></span>
                <div>
                  <div className="h">{m.h}</div>
                  <div className="d">{m.d}</div>
                  <div className="s">{m.s}</div>
                </div>
              </div>
            ))}
            <div className="lp-offices">
              <div className="lp-kicker" style={{ marginBottom: 14 }}>Offices</div>
              {OFFICES.map(([city, addr], i) => (
                <div className="lp-office" key={i}>
                  <b>{city}</b>
                  <span>{addr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
