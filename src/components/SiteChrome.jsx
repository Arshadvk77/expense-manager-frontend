import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon.jsx';
import { useApp } from '../context.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useState, useRef, useEffect } from 'react';

const NAV_LINKS = [
  ['Home', '/', 'home'],
  ['Pricing', '/pricing', 'pricing'],
  ['About', '/about', 'about'],
  ['Contact', '/contact', 'contact'],
];

// ── Toggle with moon/sun emoji ──────────────────────────────────────────────
export function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={on ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: 44,
        height: 24,
        background: on ? 'var(--wine)' : 'var(--line-2)',
        borderRadius: 999,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background .15s',
        flexShrink: 0,
      }}
    >
      {/* emoji label — opposite side of the knob */}
      <span style={{
        position: 'absolute',
        fontSize: 10,
        left: on ? 5 : 'auto',
        right: on ? 'auto' : 4,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {/* {on ? '🌙' : '☀️'} */}
      </span>

      {/* knob */}
      <div style={{
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 999,
        background: '#fff',
        top: 3,
        left: on ? 23 : 3,
        transition: 'left .15s',
        boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      }} />
    </div>
  );
}

// ── User avatar + dropdown ──────────────────────────────────────────────────
function UserMenu({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  const handleLogout = async () => {
    setOpen(false);
    try { await logout(); } catch (e) { console.error(e); }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="User menu"
        style={{
          width: 34,
          height: 34,
          borderRadius: '13px',
          background: 'var(--wine)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: 160,
          background: 'var(--card)',
          border: '1px solid var(--line-2)',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          overflow: 'hidden',
          zIndex: 999,
        }}>
          {/* user name header */}
          <div style={{
            padding: '10px 14px 8px',
            borderBottom: '1px solid var(--line-2)',
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{user?.name || 'Guest'}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{user?.email || ''}</div>
          </div>

          {/* menu items */}
          {[
            { label: 'Dashboard', action: () => { setOpen(false); navigate('/dashboard'); } },
            { label: 'Settings',  action: () => { setOpen(false); navigate('/settings'); } },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'block',
                width: '100%',
                padding: '9px 14px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 13,
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--line-1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {label}
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--line-2)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                padding: '9px 14px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: 13,
                color: 'var(--danger, #e05)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--line-1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SiteNav ─────────────────────────────────────────────────────────────────
export function SiteNav({ active, dashboard }) {
  const navigate = useNavigate();
  const { dark, setDark } = useApp(); // ← useApp works outside the Outlet
  const { user } = useAuth();

  return (
    <nav className="lp-nav">
      <div className="lp-wrap lp-nav-in">
        {!dashboard && (
          <div className="lp-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/landing')}>
            <span className="mk">K</span>
            <span>Khaleej<small>Gulf · India</small></span>
          </div>
        )}

        <div className="lp-links">
          {NAV_LINKS.map(([label, to, id]) => (
            <a key={id} className={active === id ? 'on' : ''} onClick={() => navigate(to)}>{label}</a>
          ))}
        </div>

        <div className="lp-nav-cta">
          <Toggle on={dark} onClick={() => setDark(d => !d)} />

          {user ? ( <>
            <UserMenu user={user} />
                          <button className="btn pri" onClick={() => navigate('/dashboard')}>Dashboard</button>
</>
          ) : (
            <>
              <button className="btn ghost lp-hide-sm" onClick={() => navigate('/login')}>Sign in</button>
              <button className="btn pri" onClick={() => navigate('/register')}>Get started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── SiteFooter ───────────────────────────────────────────────────────────────
export function SiteFooter() {
  const navigate = useNavigate();
  const COLS = [
    ['Product', [['Features', '/landing'], ['Pricing', '/pricing'], ['Mobile app', '/landing#app'], ['Sign in', '/login']]],
    ['Company', [['About', '/about'], ['Contact', '/contact'], ['Careers', '/about'], ['Blog', '/about']]],
    ['Legal', [['Privacy', '/privacy'], ['Terms', '/terms'], ['Security', '/privacy'], ['Licenses', '/terms']]],
  ];
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-grid">
          <div className="lp-foot-col">
            <div className="lp-brand"><span className="mk">K</span><span>Khaleej<small>Gulf · India</small></span></div>
            <p>The dual-currency ledger for Gulf workers. Earn in dirhams, save in rupees, see both clearly.</p>
          </div>
          {COLS.map(([title, links]) => (
            <div className="lp-foot-col" key={title}>
              <h4>{title}</h4>
              {links.map(([label, to], i) => <a key={i} onClick={() => navigate(to)}>{label}</a>)}
            </div>
          ))}
        </div>
        <div className="lp-foot-bar">
          <span>© 2026 Khaleej. Illustrative rates — wire to a licensed provider in production.</span>
          <div className="soc">
            <button className="icon-btn" aria-label="Mail"><Icon name="mail" size={16} /></button>
            <button className="icon-btn" aria-label="Notifications"><Icon name="bell" size={16} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ kicker, title, lead }) {
  return (
    <header className="lp-page-hero">
      <div className="lp-wrap" style={{ textAlign: 'center', maxWidth: 720 }}>
        {kicker && <div className="lp-kicker">{kicker}</div>}
        <h1 className="lp-page-h1">{title}</h1>
        {lead && <p className="lp-lead" style={{ margin: '16px auto 0' }}>{lead}</p>}
      </div>
    </header>
  );
}