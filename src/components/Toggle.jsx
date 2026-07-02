export function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: 38,
        height: 22,
        background: on ? 'var(--wine)' : 'var(--line-2)',
        borderRadius: 999,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background .15s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 999,
        background: '#fff',
        top: 3,
        left: on ? 19 : 3,
        transition: 'left .15s',
        boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      }} />
    </div>
  );
}