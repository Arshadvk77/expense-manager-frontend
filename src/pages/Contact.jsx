import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon.jsx';
import { SiteNav, SiteFooter, PageHero } from '../components/SiteChrome.jsx';
import { contactAPI } from '../api/contact';

const METHODS = [
  { ic: 'wine',  icon: 'mail',   h: 'Email us',     d: 'hello@khaleej.app', s: 'We reply within one business day.' },
  { ic: 'green', icon: 'bell',   h: 'Support',      d: 'help@khaleej.app',  s: 'Sun–Thu · 9am–6pm Gulf Standard Time.' },
  { ic: 'gold',  icon: 'wallet', h: 'Partnerships', d: 'partners@khaleej.app', s: 'Remittance providers & employers.' },
];
const OFFICES = [['Dubai', 'Business Bay · DIFC corridor'], ['Kochi', 'Infopark · Kakkanad']];
const TOPICS = ['General', 'Billing', 'Transfers', 'Partnership'];

export default function Contact() {
  const navigate = useNavigate();

  const [form, setForm]   = useState({ first_name: '', last_name: '', email: '', topic: 'General', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(''); setFieldErrors({});

    if (!form.first_name.trim() || !form.email.trim() || !form.message.trim()) {
      setFieldErrors({
        first_name: !form.first_name.trim() ? 'Required' : undefined,
        email: !form.email.trim() ? 'Required' : undefined,
        message: !form.message.trim() ? 'Required' : undefined,
      });
      return;
    }

    setSending(true);
    try {
      await contactAPI.send(form);
      setDone(true);
    } catch (err) {
      if (err.errors) setFieldErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      setError(err.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  }

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
          <div className="lp-contact-form card pad-lg">
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Send us a message</h2>
            <p className="muted" style={{ fontSize: 13.5, margin: '6px 0 22px' }}>Fill this in and we'll route it to the right person.</p>

            {done ? (
              <div className="card" style={{ borderColor: 'var(--green)', color: 'var(--green)', padding: 18, textAlign: 'center' }}>
                <Icon name="check" size={22} />
                <div style={{ fontWeight: 700, marginTop: 6 }}>Message sent</div>
                <div className="muted text-small" style={{ marginTop: 4 }}>We'll reply within one business day.</div>
              </div>
            ) : (
              <form onSubmit={submit}>
                {error && <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '10px 14px', marginBottom: 14 }}>{error}</div>}

                <div className="lp-form-row">
                  <div className="field">
                    <label>First name</label>
                    <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="Rashid" />
                    {fieldErrors.first_name && <div className="text-small" style={{ color: 'var(--clay)' }}>{fieldErrors.first_name}</div>}
                  </div>
                  <div className="field">
                    <label>Last name</label>
                    <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Ahmed" />
                  </div>
                </div>

                <div className="field" style={{ marginTop: 16 }}>
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
                  {fieldErrors.email && <div className="text-small" style={{ color: 'var(--clay)' }}>{fieldErrors.email}</div>}
                </div>

                <div className="field" style={{ marginTop: 16 }}>
                  <label>Topic</label>
                  <div className="lp-chip-row">
                    {TOPICS.map((t) => (
                      <span
                        key={t}
                        className={'chip' + (form.topic === t ? ' wine' : '')}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setForm((f) => ({ ...f, topic: t }))}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ marginTop: 16 }}>
                  <label>Message</label>
                  <textarea className="input" rows={5} style={{ resize: 'vertical', minHeight: 120 }} value={form.message} onChange={set('message')} placeholder="How can we help?" />
                  {fieldErrors.message && <div className="text-small" style={{ color: 'var(--clay)' }}>{fieldErrors.message}</div>}
                </div>

                {/* Honeypot — hidden from users, catches bots */}
                <input
                  type="text"
                  value={form.website}
                  onChange={set('website')}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                  aria-hidden="true"
                />

                <button className="btn pri lg" type="submit" disabled={sending} style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                  <Icon name="send" size={16} /> {sending ? 'Sending…' : 'Send message'}
                </button>
                <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                  By sending you agree to our <a onClick={() => navigate('/privacy')} style={{ color: 'var(--wine)', cursor: 'pointer' }}>Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>

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