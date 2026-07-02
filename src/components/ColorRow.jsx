import { Icon } from './Icon.jsx';

const CAT_COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#ca8a04', '#dc2626', '#db2777', '#475569'];

export function ColorRow({ value, onChange }) {
  return (
    <div className="row center" style={{ gap: 8, flexWrap: 'wrap' }}>
      {CAT_COLORS.map((col) => (
        <span
          key={col}
          onClick={() => onChange(col)}
          style={{
            width: 22, height: 22, borderRadius: '50%', background: col, cursor: 'pointer',
            outline: value === col ? '2px solid var(--ink)' : '2px solid transparent', outlineOffset: 2,
          }}
        />
      ))}

      {/* custom color wheel */}
      <label
        title="Custom colour"
        style={{
          width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', position: 'relative',
          border: '2px dashed var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: CAT_COLORS.includes(value) ? 'transparent' : value,
        }}
      >
        <Icon name="plus" size={12} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </label>

      <span className="mono text-small muted" style={{ marginLeft: 4 }}>{value}</span>
    </div>
  );
}