// TaskModal – add or edit a task, shown as an overlay dialog
import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

const CATEGORIES = ['work', 'personal', 'study', 'other'];

export default function TaskModal({ isOpen, onClose, onSave, initialData }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('personal');
    const [dueDate, setDueDate] = useState('');
    const [saving, setSaving] = useState(false);

    // Populate fields when editing an existing task
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
            } else {
                setDueDate('');
            }
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-md glass rounded-2xl p-6 shadow-2xl fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        <h2 className="font-semibold text-white">{initialData ? 'Edit Task' : 'New Task'}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Title *</label>
                        <input
                            id="task-title"
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            required placeholder="What needs to be done?"
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Description</label>
                        <textarea
                            id="task-description"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details…" rows={3}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
                        />
                    </div>

                    {/* Category + Due date row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Category</label>
                            <select
                                id="task-category"
                                value={category} onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm capitalize"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c} className="capitalize">{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Due Date</label>
                            <input
                                id="task-due"
                                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={saving || !title.trim()}
                            id="task-save"
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 text-sm"
                        >
                            {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
