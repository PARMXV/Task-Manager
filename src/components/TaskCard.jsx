// TaskCard – renders a single task with toggle, edit, delete, category chip and due date
import { useState } from 'react';
import { Trash2, Pencil, Check, Calendar, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
    work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    personal: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    study: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    other: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function formatDate(val) {
    if (!val) return null;
    const d = val.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(val, completed) {
    if (completed || !val) return false;
    const d = val.toDate ? val.toDate() : new Date(val);
    return d < new Date();
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        await onDelete(task.id);
    }

    const overdue = isOverdue(task.dueDate, task.completed);
    const dateLabel = formatDate(task.dueDate);
    const catColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other;

    return (
        <div className={`glass rounded-xl p-4 flex items-start gap-3 fade-in group transition-all ${task.completed ? 'opacity-60' : ''}`}>
            {/* Checkbox */}
            <button
                id={`toggle-${task.id}`}
                onClick={() => onToggle(task)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-600 hover:border-indigo-400'
                    }`}
            >
                {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm text-white relative inline-block ${task.completed ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Category chip */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${catColor}`}>
                        <Tag className="w-2.5 h-2.5" />
                        {task.category}
                    </span>

                    {/* Due date */}
                    {dateLabel && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${overdue
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-slate-700/50 text-slate-400 border-slate-600/30'
                            }`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {overdue ? 'Overdue · ' : ''}{dateLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Action buttons (show on hover) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                    id={`edit-${task.id}`}
                    onClick={() => onEdit(task)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    id={`delete-${task.id}`}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
