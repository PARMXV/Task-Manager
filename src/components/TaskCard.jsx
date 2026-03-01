// TaskCard – individual task item with toggle, edit, delete, category chip, due date badge
import { useState } from 'react';
import { Trash2, Pencil, Check, Calendar, Tag } from 'lucide-react';

const CATEGORY_META = {
    work: { label: 'Trabajo', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    personal: { label: 'Personal', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
    study: { label: 'Estudio', bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)' },
    other: { label: 'Otro', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
};

function formatDate(val) {
    if (!val) return null;
    const d = val.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(val, completed) {
    if (completed || !val) return false;
    const d = val.toDate ? val.toDate() : new Date(val);
    return d < new Date();
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const overdue = isOverdue(task.dueDate, task.completed);
    const dateLabel = formatDate(task.dueDate);
    const cat = CATEGORY_META[task.category] || CATEGORY_META.other;

    async function handleToggle() {
        setToggling(true);
        await onToggle(task);
        setToggling(false);
    }

    async function handleDelete() {
        setDeleting(true);
        await onDelete(task.id);
    }

    return (
        <div
            className="glass rounded-2xl p-4 flex items-start gap-3 fade-in group transition-all"
            style={{
                opacity: task.completed ? 0.65 : 1,
                borderColor: task.completed ? 'rgba(52,211,153,0.2)' : undefined,
            }}
        >
            {/* ── Checkbox ── */}
            <button
                id={`toggle-${task.id}`}
                onClick={handleToggle}
                disabled={toggling}
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all"
                style={{
                    background: task.completed ? '#059669' : 'transparent',
                    borderColor: task.completed ? '#059669' : 'var(--border)',
                }}
                onMouseEnter={e => !task.completed && (e.currentTarget.style.borderColor = '#6366f1')}
                onMouseLeave={e => !task.completed && (e.currentTarget.style.borderColor = 'var(--border)')}
            >
                {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0">
                {/* Title */}
                <p
                    className="font-medium text-sm leading-snug"
                    style={{
                        color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                >
                    {task.title}
                </p>

                {/* Description */}
                {task.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {task.description}
                    </p>
                )}

                {/* Chips row */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    {/* Category chip */}
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                    >
                        <Tag className="w-2.5 h-2.5" />
                        {cat.label}
                    </span>

                    {/* Due date chip */}
                    {dateLabel && (
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={
                                overdue
                                    ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                                    : { background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                            }
                        >
                            <Calendar className="w-2.5 h-2.5" />
                            {overdue ? '🔴 Vencida · ' : ''}{dateLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                {!showConfirm ? (
                    <>
                        <button
                            id={`edit-${task.id}`}
                            onClick={() => onEdit(task)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#818cf8'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            id={`delete-${task.id}`}
                            onClick={() => setShowConfirm(true)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    /* Inline delete confirmation */
                    <div className="flex gap-1 items-center fade-in">
                        <button
                            onClick={handleDelete} disabled={deleting}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-white transition-all"
                            style={{ background: '#dc2626' }}
                        >
                            {deleting ? '…' : 'Eliminar'}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-2 py-1 rounded-lg text-xs transition-all"
                            style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
