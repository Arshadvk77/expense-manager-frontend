import { useEffect } from 'react';
import { Icon } from './Icon.jsx';

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onCancel?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,12,10,.45)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        animation: 'cd-fade .15s ease',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%', maxWidth: 400, padding: 24,
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-lg, 22px)',
          boxShadow: 'var(--sh-3)',
          animation: 'cd-pop .16s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 14, marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: danger ? 'var(--clay-tint)' : 'var(--wine-tint)',
          color: danger ? 'var(--clay)' : 'var(--wine)',
        }}>
          <Icon name="trash" size={20} />
        </div>

        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</div>
        {message && (
          <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{message}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <button
            className="btn"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: danger ? 'var(--clay)' : 'var(--wine)',
              borderColor: danger ? 'var(--clay)' : 'var(--wine)',
              color: '#fff',
            }}
          >
            {loading ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cd-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cd-pop { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}