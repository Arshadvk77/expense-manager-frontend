import { usePage, Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Toggle } from '../components/Toggle.jsx';



export default function Settings() {
  const { ccy, dark, setDark, setCcy } = usePage();
  const navigate = useNavigate();
  const {user} = useAuth();

  const Row = ({ title, sub, control, last }) => (
    <div className="row between center" style={{ padding: '14px 0', borderTop: '1px solid var(--line)' }}>
      <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>{sub && <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{sub}</div>}</div>
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

      <div className="grid cols-main" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <Section label="Profile" title="Your account">
          <div className="row center" style={{ gap: 14, padding: '8px 0 4px' }}>
            <div className="ava" style={{ width: 54, height: 54, borderRadius: 16, fontSize: 22 }}>R</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{user?.name}</div><div className="muted" style={{ fontSize: 12.5 }}>{user?.email} · Dubai</div></div>
            <button className="btn">Edit</button>
          </div>
          <Row title="Country" sub="Used for rate sources and local time" control={<span style={{ fontSize: 13 }}>United Arab Emirates</span>} />
          <Row title="Primary currency" sub="Shown alongside INR everywhere"
            control={<div className="seg">{['AED', 'OMR', 'SAR', 'QAR'].map(c => <button key={c} className={ccy === c ? 'on' : ''} onClick={() => setCcy(c)}>{c}</button>)}</div>} />
        </Section>

        <Section label="Appearance" title="How Khaleej looks">
          <Row title="Dark mode" sub="A calmer evening palette" control={<Toggle on={dark} onClick={() => setDark(d => !d)} />} />
          <Row title="Compact numbers" sub="Abbreviate large amounts (1.2k)" control={<Toggle on={true} />} />
          <Row title="Show INR everywhere" sub="Pair every amount with rupees" control={<Toggle on={true} />} />
        </Section>

        <Section label="Notifications" title="What we'll tell you">
          <Row title="Salary received" sub="When your monthly inflow lands" control={<Toggle on={true} />} />
          <Row title="Rate alerts" sub="When INR crosses your target" control={<Toggle on={true} />} />
          <Row title="Goal milestones" sub="25% · 50% · 75% · 100%" control={<Toggle on={true} />} />
          <Row title="Weekly digest" sub="A quiet email every Sunday" control={<Toggle on={false} />} />
        </Section>

        <Section label="Data & privacy" title="Your ledger, your file">
          <Row title="Export as Excel" sub="All transactions, both currencies" control={<button className="btn"><Icon name="download" size={14} /> .xlsx</button>} />
          <Row title="Export as PDF" sub="Monthly summary statement" control={<button className="btn"><Icon name="download" size={14} /> .pdf</button>} />
          <Row title="Backup to iCloud" control={<Toggle on={true} />} />
          <Row title="Sign out" sub="On this device only" control={<button className="btn" onClick={() => navigate('/')} style={{ color: 'var(--clay)' }}><Icon name="logout" size={14} /> Sign out</button>} />
        </Section>
      </div>
    </>
  );
}
