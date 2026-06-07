import { useNavigate, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { Icon } from './Icon.jsx';
import { useApp } from '../context.jsx';

const ROUTE = { home: '/dashboard', income: '/income', expense: '/expense', tx: '/transactions', reports: '/reports', convert: '/convert', settings: '/settings' };

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { ccy, setCcy } = useApp();

  const groups = [
    { label: 'Overview', items: [
      { id: 'home', label: 'Dashboard', icon: 'grid' },
      { id: 'reports', label: 'Reports', icon: 'chart' },
      { id: 'tx', label: 'Transactions', icon: 'list', tag: '48' },
    ]},
    { label: 'Money', items: [
      { id: 'income', label: 'Add income', icon: 'in' },
      { id: 'expense', label: 'Add expense', icon: 'out' },
      { id: 'convert', label: 'Convert to INR', icon: 'convert' },
    ]},
    { label: 'Account', items: [
      { id: 'settings', label: 'Settings', icon: 'gear' },
    ]},
  ];
  const on = id => pathname === ROUTE[id];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mk">K</div>
        <div className="nm">Khaleej<small>Gulf · India</small></div>
      </div>

      <div className="s-search">
        <Icon name="search" size={15} />
        <input placeholder="Search" />
      </div>

      <div style={{ flex: '0 0 auto', overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.label}>
            <div className="s-label">{g.label}</div>
            {g.items.map(it => (
              <div key={it.id} className={'nav ' + (on(it.id) ? 'on' : '')} onClick={() => navigate(ROUTE[it.id])}>
                <Icon name={it.icon} />
                <span>{it.label}</span>
                {it.tag && <span className="tag">{it.tag}</span>}
              </div>
            ))}
          </div>
        ))}

        <div className="s-label">Primary currency</div>
        <div style={{ display: 'flex', gap: 6, padding: '2px 10px 6px', flexWrap: 'wrap' }}>
          {['AED', 'OMR', 'SAR', 'QAR'].map(c => (
            <button key={c} onClick={() => setCcy(c)} style={{
              flex: '1 0 40%', padding: '7px 0', borderRadius: 10, cursor: 'pointer',
              border: '1px solid ' + (ccy === c ? 'var(--wine)' : 'var(--line)'),
              background: ccy === c ? 'var(--wine-tint)' : 'transparent',
              color: ccy === c ? 'var(--wine)' : 'var(--muted)',
              fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700,
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div className="s-card">
        <div className="t">Savings goal</div>
        <div className="d">62% to your ₹5.8L target this quarter.</div>
        <button className="b" onClick={() => navigate('/reports')}>View progress</button>
      </div>

      <div className="s-user">
        <div className="av">R</div>
        <div style={{ flex: 1 }}>
          <div className="nm">Rashid Ahmed</div>
          <div className="sub">Dubai · {ccy}</div>
        </div>
        <span style={{ color: 'var(--muted)', cursor: 'pointer' }} onClick={() => navigate('/')}><Icon name="logout" size={16} /></span>
      </div>
    </aside>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const on = id => pathname === ROUTE[id];
  return (
    <nav className="bottom-nav">
      <button className={'bn-item ' + (on('home') ? 'on' : '')} onClick={() => navigate(ROUTE.home)}>
        <Icon name="grid" /><span>Home</span>
      </button>
      <button className={'bn-item ' + (on('reports') ? 'on' : '')} onClick={() => navigate(ROUTE.reports)}>
        <Icon name="chart" /><span>Reports</span>
      </button>
      <button className="bn-item" onClick={() => navigate(ROUTE.expense)} aria-label="Add expense">
        <span className="bn-add"><Icon name="plus" /></span>
      </button>
      <button className={'bn-item ' + (on('tx') ? 'on' : '')} onClick={() => navigate(ROUTE.tx)}>
        <Icon name="list" /><span>Activity</span>
      </button>
      <button className={'bn-item ' + (on('settings') ? 'on' : '')} onClick={() => navigate(ROUTE.settings)}>
        <Icon name="gear" /><span>Settings</span>
      </button>
    </nav>
  );
}

export default function Layout() {
  const { ccy, dark, setDark, setCcy } = useApp();
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Outlet context={{ ccy, dark, setDark, setCcy }} />
      </div>
      <BottomNav />
    </div>
  );
}

export const usePage = () => useOutletContext();

// Shared topbar used by pages
export function Topbar({ title, sub, children }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <div>
        <div className="hi">{title}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="tb-right">
        {children}
        <button className="icon-btn tb-hide-sm" onClick={() => navigate('/convert')}><Icon name="mail" size={17} /></button>
        <button className="icon-btn tb-hide-sm"><span className="dot" /><Icon name="bell" size={17} /></button>
        <div className="ava tb-hide-sm">R</div>
      </div>
    </header>
  );
}
