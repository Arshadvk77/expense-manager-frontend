// Minimal stroke icons
export const Icon = ({ name, size = 18, sw = 1.7 }) => {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'grid':     return <svg {...c}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
    case 'in':       return <svg {...c}><path d="M12 5v14M5 12l7 7 7-7"/></svg>;
    case 'out':      return <svg {...c}><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case 'list':     return <svg {...c}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
    case 'chart':    return <svg {...c}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></svg>;
    case 'convert':  return <svg {...c}><path d="M4 7h14l-3-3M20 17H6l3 3"/></svg>;
    case 'gear':     return <svg {...c}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'search':   return <svg {...c}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'filter':   return <svg {...c}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case 'sort':     return <svg {...c}><path d="M8 18V6M8 6L4 10M8 6l4 4M16 6v12M16 18l4-4M16 18l-4-4"/></svg>;
    case 'cal':      return <svg {...c}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'right':    return <svg {...c}><path d="M9 6l6 6-6 6"/></svg>;
    case 'down':     return <svg {...c}><path d="M6 9l6 6 6-6"/></svg>;
    case 'arrow-ur': return <svg {...c}><path d="M7 17L17 7M8 7h9v9"/></svg>;
    case 'check':    return <svg {...c}><path d="M5 12l5 5L20 7"/></svg>;
    case 'bell':     return <svg {...c}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>;
    case 'mail':     return <svg {...c}><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'wallet':   return <svg {...c}><rect x="2.5" y="6" width="19" height="13" rx="3"/><path d="M2.5 10h19M16 14h2"/></svg>;
    case 'send':     return <svg {...c}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case 'target':   return <svg {...c}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></svg>;
    case 'recur':    return <svg {...c}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4"/></svg>;
    case 'download': return <svg {...c}><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>;
    case 'sun':      return <svg {...c}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'moon':     return <svg {...c}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>;
    case 'logout':   return <svg {...c}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'home':     return <svg {...c}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case 'help':     return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 2.5"/><path d="M12 17h.01"/></svg>;
    case 'plus':     return <svg {...c}><path d="M12 5v14M5 12h14"/></svg>;
    case 'dots':     return <svg {...c}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>;
    case 'share':    return <svg {...c}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>;
    case 'user':     return <svg {...c}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case 'users':    return <svg {...c}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.5a4 4 0 0 1 0 7.5"/><path d="M22 21a7 7 0 0 0-5-6.7"/></svg>;
    default: return null;
  }
};
