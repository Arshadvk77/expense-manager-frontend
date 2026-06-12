import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Topbar } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { transactionsAPI } from '../api/transactions'; // 👉 adjust path
import { categoriesAPI } from '../api/categories';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import '../styles/main.scss';

const CURRENCIES = ['AED', 'OMR', 'SAR', 'QAR', 'USD'];

export default function EditTransaction() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('AED');
    const [categoryId, setCategoryId] = useState(null);
    const [source, setSource] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [confirmOpen, setConfirmOpen] = useState(false);



    // load the transaction
    useEffect(() => {
        transactionsAPI.get(id)
            .then((res) => {
                const t = res.transaction;
                setType(t.type);
                setAmount(String(t.amount));
                setCurrency(t.currency);
                setCategoryId(t.category_id ?? null);
                setSource(t.source ?? '');
                setDate((t.date || '').slice(0, 10));
                setNote(t.note ?? '');
            })
            .catch((err) => setError(err.message || 'Could not load this transaction.'))
            .finally(() => setLoading(false));
    }, [id]);

    // load categories for the current type
    useEffect(() => {
        categoriesAPI.list({ type })
            .then((res) => setCategories((res.categories || []).filter((c) => c.parent_id === null)))
            .catch(() => setCategories([]));
    }, [type]);

    const amountNum = parseFloat(amount) || 0;

    async function save() {
        setError('');
        setFieldErrors({});

        if (amountNum <= 0) {
            setFieldErrors({ amount: 'Enter an amount greater than 0.' });
            return;
        }

        setSaving(true);
        try {
            await transactionsAPI.update(id, {
                type,
                amount: amountNum,
                currency,
                category_id: categoryId,
                date,
                source: source || null,
                note: note || null,
            });
            navigate('/transactions');
        } catch (err) {
            if (err.errors) {
                setFieldErrors(Object.fromEntries(
                    Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
                ));
            }
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function confirmRemove() {
        setDeleting(true);
        setError('');
        try {
            await transactionsAPI.remove(id);
            navigate('/transactions');
        } catch (err) {
            setError(err.message || 'Failed to delete transaction.');
            setDeleting(false);
            setConfirmOpen(false);
        }
    }

    if (loading) {
        return (
            <>
                <Topbar title="Edit transaction" sub="Loading…" />
                <div className="card pad-lg muted">Loading…</div>
            </>
        );
    }

    return (
        <>
            <Topbar title={`Edit ${type}`} sub="Update the details or delete this entry.">
                <button className="btn ghost" onClick={() => navigate('/transactions')} disabled={saving || deleting}>Cancel</button>
                <button className="btn pri" onClick={save} disabled={saving || deleting}>
                    <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save changes'}
                </button>
            </Topbar>

            {error && (
                <div className="card" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', padding: '12px 16px' }}>
                    {error}
                </div>
            )}

            <div className="card card--padding-large" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 640 }}>
                {/* Type toggle */}
                <div className="seg" style={{ alignSelf: 'flex-start' }}>
                    {['expense', 'income'].map((tp) => (
                        <button key={tp} className={type === tp ? 'on' : ''} onClick={() => { setType(tp); setCategoryId(null); }}>
                            {tp.charAt(0).toUpperCase() + tp.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Amount */}
                <div>
                    <div className="text-muted text-small text-semibold">Amount</div>
                    <div className="amount-row">
                        <span className="amount-row__currency mono">{currency}</span>
                        <input
                            className="num"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            style={{ border: 0, outline: 'none', background: 'transparent', font: 'inherit', fontSize: 52, fontWeight: 800, flex: 1, minWidth: 0, color: 'var(--ink)' }}
                        />
                    </div>
                    {fieldErrors.amount && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.amount}</div>}

                    <div className="currency-chips" style={{ marginTop: 12 }}>
                        {CURRENCIES.map((c) => (
                            <span key={c} className={`chip ${c === currency ? 'wine' : ''} cursor-pointer`} onClick={() => setCurrency(c)}>{c}</span>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <div className="text-muted text-small text-semibold" style={{ marginBottom: 12 }}>Category</div>
                    <div className="category-grid">
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setCategoryId(c.id === categoryId ? null : c.id)}
                                className={`card category-grid__button ${c.id === categoryId ? 'category-grid__button--active' : ''}`}
                            >
                                <span className="m-ic" style={{ width: 32, height: 32, background: (c.color || '#888') + '22', color: c.color || 'var(--ink)' }}>
                                    {(c.name || '?').charAt(0)}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                            </button>
                        ))}
                    </div>
                    {fieldErrors.category_id && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 6 }}>{fieldErrors.category_id}</div>}
                </div>

                <hr className="hr" />

                <div className="grid grid-2cols">
                    <div className="form-field">
                        <label>Date</label>
                        <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        {fieldErrors.date && <div className="text-small" style={{ color: 'var(--clay)', marginTop: 4 }}>{fieldErrors.date}</div>}
                    </div>
                    <div className="form-field">
                        <label>Source</label>
                        <input className="form-input" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Salary — ADNOC" />
                    </div>
                    <div className="form-field form-field--full-width">
                        <label>Notes</label>
                        <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" />
                    </div>
                </div>

                <hr className="hr" />

                <button className="btn ghost" style={{ color: 'var(--clay)', alignSelf: 'flex-start' }} onClick={() => setConfirmOpen(true)} disabled={deleting || saving}>
                    <Icon name="trash" size={15} /> Delete transaction
                </button>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                loading={deleting}
                title="Delete transaction?"
                message="This entry will be removed from your records. You can’t undo this."
                confirmLabel="Delete"
                onConfirm={confirmRemove}
                onCancel={() => setConfirmOpen(false)}
            />

        </>
    );
}