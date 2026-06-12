import { useState } from 'react';
import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Toggle } from '../components/Toggle.jsx';
import { userAPI } from '../api/user';

const CURRENCIES = ['OMR', 'AED', 'SAR', 'QAR', 'USD', 'INR'];

export default function Settings() {
  const { ccy, dark, setDark, setCcy } = usePage();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [alert, setAlert] = useState(null);

  // ----- profile edit -----
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErr, setProfileErr] = useState({});

  async function saveProfile() {
    setSavingProfile(true); setAlert(null); setProfileErr({});
    try {
      const res = await userAPI.updateProfile({ name, email });
      updateUser(res.user);
      setEditing(false);
      setAlert({ type: 'success', message: 'Profile updated.' });
    } catch (err) {
      if (err.errors) setProfileErr(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      setAlert({ type: 'error', message: err.message || 'Could not update profile.' });
    } finally {
      setSavingProfile(false);
    }
  }

  // ----- password -----
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function savePassword() {
    setSavingPw(true); setAlert(null);
    try {
      await userAPI.changePassword({
        current_password: pw.current,
        new_password: pw.next,
        new_password_confirmation: pw.confirm,
      });
      setPw({ current: '', next: '', confirm: '' });
      setShowPw(false);
      setAlert({ type: 'success', message: 'Password changed.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not change password.' });
    } finally {
      setSavingPw(false);
    }
  }

  // ----- preferences (optimistic + persisted) -----
  const [prefs, setPrefs] = useState({
    dark_mode:             user?.preferences?.dark_mode ?? !!dark,
    notifications_enabled: user?.preferences?.notifications_enabled ?? true,
    compact_numbers:       user?.preferences?.compact_numbers ?? false,
  });

  async function toggle(key) {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    if (key === 'dark_mode') setDark?.(() => next);
    try {
      await userAPI.updatePreferences({ [key]: next });
    } catch (err) {
      setPrefs((p) => ({ ...p, [key]: !next })); // revert
      if (key === 'dark_mode') setDark?.(() => !next);
      setAlert({ type: 'error', message: err.message || 'Could not save preference.' });
    }
  }

  // ----- currency -----
  const [mainCcy, setMainCcy] = useState(user?.preferences?.main_currency || ccy || 'OMR');

  async function changeCurrency(c) {
    const prev = mainCcy;
    setMainCcy(c); setCcy?.(c);
    try {
      await userAPI.updateCurrencies({ main_currency: c, tracked_currencies: user?.preferences?.tracked_currencies || [] });
    } catch (err) {
      setMainCcy(prev); setCcy?.(prev);
      setAlert({ type: 'error', message: err.message || 'Could not update currency.' });
    }
  }

  // ----- delete account -----
  const [showDelete, setShowDelete] = useState(false);
  const [delPw, setDelPw] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true); setAlert(null);
    try {
      await userAPI.deleteAccount(delPw);
      logout();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not delete account.' });
      setDeleting(false);
    }
  }

  const Row = ({ title, sub, control }) => (
    <div className="row between center" style={{ padding: '14px 0', borderTop: '1px solid var(--line)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        {sub && <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{sub}</div>}
      </div>
      <div>{control}</div>
    </div>
  );

  const Section = ({ label, title, children }) => (
    <div className="card pad-lg">
      <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>{label}</div>
      <div className="t" style={{ fontSize: 17, margin: '4px 0 6px' }}>{title}</div>
      {children}
    </div>
  );

  return (
    <>
      <Topbar title="Settings" sub="Account, preferences, and your data." />

      {alert && (
        <div className="card" style={{ padding: '12px 16px', borderColor: alert.type === 'error' ? 'var(--clay)' : 'var(--green)', color: alert.type === 'error' ? 'var(--clay)' : 'var(--green)' }}>
          {alert.message}
        </div>
      )}

      <div className="grid cols-main" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Profile */}
        <Section label="Profile" title="Your account">
          <div className="row center" style={{ gap: 14, padding: '8px 0 4px' }}>
            <div className="ava" style={{ width: 54, height: 54, borderRadius: 16, fontSize: 22 }}>
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{user?.name}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{user?.email}</div>
            </div>
            {!editing && <button className="btn" onClick={() => { setName(user?.name || ''); setEmail(user?.email || ''); setEditing(true); }}>Edit</button>}
          </div>

          {editing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
              <div className="field">
                <label>Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                {profileErr.name && <div className="text-small" style={{ color: 'var(--clay)' }}>{profileErr.name}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {profileErr.email && <div className="text-small" style={{ color: 'var(--clay)' }}>{profileErr.email}</div>}
              </div>
              <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn ghost" onClick={() => setEditing(false)} disabled={savingProfile}>Cancel</button>
                <button className="btn pri" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          )}

          <Row
            title="Password"
            sub="Change your sign-in password"
            control={<button className="btn" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Close' : 'Change'}</button>}
          />
          {showPw && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              <input className="input" type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              <input className="input" type="password" placeholder="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <input className="input" type="password" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button className="btn pri" onClick={savePassword} disabled={savingPw}>{savingPw ? 'Saving…' : 'Update password'}</button>
              </div>
            </div>
          )}

          <Row
            title="Primary currency"
            sub="Shown across dashboards and reports"
            control={<div className="seg">{CURRENCIES.map((c) => <button key={c} className={mainCcy === c ? 'on' : ''} onClick={() => changeCurrency(c)}>{c}</button>)}</div>}
          />
        </Section>

        {/* Appearance + notifications */}
        <Section label="Preferences" title="How Khaleej behaves">
          <Row title="Dark mode" sub="A calmer evening palette" control={<Toggle on={prefs.dark_mode} onClick={() => toggle('dark_mode')} />} />
          <Row title="Compact numbers" sub="Abbreviate large amounts (1.2k)" control={<Toggle on={prefs.compact_numbers} onClick={() => toggle('compact_numbers')} />} />
          <Row title="Notifications" sub="Salary, goals, and weekly digest" control={<Toggle on={prefs.notifications_enabled} onClick={() => toggle('notifications_enabled')} />} />
        </Section>

        {/* Danger zone */}
        <Section label="Account" title="Session & data">
          <Row
            title="Sign out"
            sub="On this device only"
            control={<button className="btn" onClick={logout} style={{ color: 'var(--clay)' }}><Icon name="logout" size={14} /> Sign out</button>}
          />
          <Row
            title="Delete account"
            sub="Permanently remove your account and data"
            control={<button className="btn" style={{ color: 'var(--clay)' }} onClick={() => setShowDelete(true)}>Delete</button>}
          />
        </Section>
      </div>

      {/* Delete modal */}
      {showDelete && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleting) setShowDelete(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(20,12,10,.45)', backdropFilter: 'blur(4px)' }}
        >
          <div style={{ width: '100%', maxWidth: 400, padding: 24, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg, 22px)', boxShadow: 'var(--sh-3)' }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Delete your account?</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
              This permanently removes your account, transactions, and savings. Enter your password to confirm.
            </div>
            <input className="input" type="password" placeholder="Password" value={delPw} onChange={(e) => setDelPw(e.target.value)} style={{ marginTop: 14 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button className="btn ghost" onClick={() => setShowDelete(false)} disabled={deleting}>Cancel</button>
              <button className="btn" style={{ background: 'var(--clay)', borderColor: 'var(--clay)', color: '#fff' }} onClick={confirmDelete} disabled={deleting || !delPw}>
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}