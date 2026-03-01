// TaskModal – add/edit task dialog with title, description, category, and due date
import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

const CATEGORIES = [
    { value: 'work', label: 'Trabajo' },
    { value: 'personal', label: 'Personal' },
    { value: 'study', label: 'Estudio' },
    { value: 'other', label: 'Otro' },
];

export default function TaskModal({ isOpen, onClose, onSave, initialData }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('personal');
    const [dueDate, setDueDate] = useState('');
    const [saving, setSaving] = useState(false);

    /* Populate fields when editing an existing task */
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setCategory(initialData.category || 'personal');
            if (initialData.dueDate) {
                const d = initialData.dueDate.toDate
                    ? initialData.dueDate.toDate()
                    : new Date(initialData.dueDate);
                setDueDate(d.toISOString().split('T')[0]);
            } else { setDueDate(''); }
        } else {
            setTitle(''); setDescription(''); setCategory('personal'); setDueDate('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        await onSave({
            title: title.trim(),
            description: description.trim(),
            category,
            dueDate: dueDate ? new Date(dueDate + 'T00:00:00') : null,
        });
        setSaving(false);
        onClose();
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        padding: '10px 14px',
        width: '100%',
        fontSize: '14px',
        outline: 'none',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl fade-in">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Título *
                        </label>
                        <input
                            id="task-title"
                            type="text" value={title} onChange={e => setTitle(e.target.value)}
                            required placeholder="¿Qué necesitas hacer?"
                            style={inputStyle}
                            onFocus={e => e.target.style.border = '1px solid var(--accent)'}
                            onBlur={e => e.target.style.border = '1px solid var(--border)'}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Descripción
                        </label>
                        <textarea
                            id="task-description"
                            value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Agrega más detalles…" rows={3}
                            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                            onFocus={e => e.target.style.border = '1px solid var(--accent)'}
                            onBlur={e => e.target.style.border = '1px solid var(--border)'}
                        />
                    </div>

                    {/* Category + Due date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                Categoría
                            </label>
                            <select
                                id="task-category"
                                value={category} onChange={e => setCategory(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                onFocus={e => e.target.style.border = '1px solid var(--accent)'}
                                onBlur={e => e.target.style.border = '1px solid var(--border)'}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value} style={{ background: '#15152a' }}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                Fecha límite
                            </label>
                            <input
                                id="task-due"
                                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                style={{ ...inputStyle, colorScheme: 'dark' }}
                                onFocus={e => e.target.style.border = '1px solid var(--accent)'}
                                onBlur={e => e.target.style.border = '1px solid var(--border)'}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={saving || !title.trim()} id="task-save"
                            className="glow-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', opacity: (!title.trim() ? 0.5 : 1) }}
                        >
                            {saving ? <span className="spinner" /> : null}
                            {saving ? 'Guardando…' : initialData ? 'Guardar cambios' : 'Agregar tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
