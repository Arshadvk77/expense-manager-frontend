// Inline SVG charts — modern soft style with gradient fills + hover tooltips
import { useState, useId } from 'react';

// Tiny sparkline for stat cards
export const Sparkline = ({ data, width = 76, height = 30, color = 'var(--wine)', fill = true }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const x = i => (i / (data.length - 1)) * width;
  const y = v => height - 3 - ((v - min) / span) * (height - 6);
  const d = data.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const id = useId().replace(/:/g, '');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <>
        <defs><linearGradient id={'sp' + id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={`url(#sp${id})`} />
      </>}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Big area chart with hover tooltip pill
export const AreaChart = ({ data, labels, width = 600, height = 230, color = 'var(--wine)', prefix = 'AED ' }) => {
  const [hi, setHi] = useState(null);
  const max = Math.max(...data) * 1.18;
  const pad = { l: 40, r: 12, t: 16, b: 28 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const x = i => pad.l + (i / (data.length - 1)) * w;
  const y = v => pad.t + h - (v / max) * h;
  const line = data.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(data.length - 1)} ${pad.t + h} L ${x(0)} ${pad.t + h} Z`;
  const id = useId().replace(/:/g, '');
  const ticks = [0, max / 2, max];
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet"
         onMouseLeave={() => setHi(null)}>
      <defs><linearGradient id={'ar' + id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.20" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--mono)">
            {t >= 1000 ? (t / 1000).toFixed(0) + 'k' : Math.round(t)}
          </text>
        </g>
      ))}
      <path d={area} fill={`url(#ar${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <g key={i} onMouseEnter={() => setHi(i)}>
          <rect x={x(i) - w / data.length / 2} y={pad.t} width={w / data.length} height={h} fill="transparent" />
          {hi === i && <>
            <line x1={x(i)} x2={x(i)} y1={pad.t} y2={pad.t + h} stroke={color} strokeDasharray="3 3" opacity="0.5" />
            <circle cx={x(i)} cy={y(v)} r="5" fill="var(--card)" stroke={color} strokeWidth="2.5" />
          </>}
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--muted)" fontWeight="600">{l}</text>
      ))}
      {hi !== null && (() => {
        const tw = 96, tx = Math.min(Math.max(x(hi) - tw / 2, pad.l), width - pad.r - tw), ty = Math.max(y(data[hi]) - 44, 2);
        return (
          <g>
            <rect x={tx} y={ty} width={tw} height={34} rx="9" fill="var(--ink)" />
            <text x={tx + tw / 2} y={ty + 14} textAnchor="middle" fontSize="9" fill="var(--muted-2)" fontFamily="var(--mono)">{labels[hi]}</text>
            <text x={tx + tw / 2} y={ty + 27} textAnchor="middle" fontSize="11.5" fill="#fff" fontWeight="700" fontFamily="var(--mono)">{prefix}{data[hi].toLocaleString()}</text>
          </g>
        );
      })()}
    </svg>
  );
};

// Grouped bars (income vs expense)
export const Bars = ({ pairs, labels, width = 600, height = 220, cA = 'var(--wine)', cB = 'var(--gold)' }) => {
  const [hi, setHi] = useState(null);
  const max = Math.max(...pairs.flatMap(p => p)) * 1.18;
  const pad = { l: 40, r: 12, t: 14, b: 28 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const gw = w / pairs.length, bw = 13;
  const y = v => pad.t + h - (v / max) * h;
  const ticks = [0, max / 2, max];
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet" onMouseLeave={() => setHi(null)}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--mono)">{t >= 1000 ? (t / 1000).toFixed(0) + 'k' : Math.round(t)}</text>
        </g>
      ))}
      {pairs.map((p, i) => {
        const gx = pad.l + i * gw + gw / 2;
        const on = hi === i;
        return (
          <g key={i} onMouseEnter={() => setHi(i)}>
            <rect x={pad.l + i * gw} y={pad.t} width={gw} height={h} fill="transparent" />
            <rect x={gx - bw - 3} y={y(p[0])} width={bw} height={pad.t + h - y(p[0])} rx="5" fill={cA} opacity={on ? 1 : 0.9} />
            <rect x={gx + 3} y={y(p[1])} width={bw} height={pad.t + h - y(p[1])} rx="5" fill={cB} opacity={on ? 0.85 : 0.55} />
            <text x={gx} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--muted)" fontWeight="600">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

// Donut with center label + legend handled by caller
export const Donut = ({ data, size = 180, stroke = 24, center1, center2 }) => {
  const total = data.reduce((s, d) => s + d.v, 0);
  const r = size / 2 - stroke / 2 - 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      {data.map((d, i) => {
        const frac = d.v / total, dash = c * frac, off = c * (1 - acc);
        acc += frac;
        return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
      })}
      {center1 && <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--ink)" style={{ letterSpacing: '-0.03em' }}>{center1}</text>}
      {center2 && <text x={size / 2} y={size / 2 + 20} textAnchor="middle" fontSize="10.5" fill="var(--muted)" letterSpacing="0.06em">{center2}</text>}
    </svg>
  );
};

// Progress ring (savings goal)
export const Ring = ({ progress = 0.62, size = 150, stroke = 14, color = 'var(--wine)', center }) => {
  const r = size / 2 - stroke / 2 - 1, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {center}
      </div>
    </div>
  );
};
