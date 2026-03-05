// TasksPage – main task management view with real-time list, filters, search, and CRUD
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, CheckCircle2, Clock, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks, addTask, updateTask, deleteTask, toggleTask } from '../firebase/taskService';
import { awardXP } from '../firebase/userService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
    { value: 'all', label: 'Todas', icon: List },
    { value: 'pending', label: 'Pendientes', icon: Clock },
    { value: 'completed', label: 'Completadas', icon: CheckCircle2 },
];

const CATEGORY_FILTERS = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'work', label: '💼 Trabajo' },
    { value: 'personal', label: '👤 Personal' },
    { value: 'study', label: '📚 Estudio' },
    { value: 'other', label: '📌 Otro' },
];

export default function TasksPage() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();

    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    /* Open "add task" modal if linked from dashboard with ?new=1 */
    useEffect(() => {
        if (searchParams.get('new') === '1') setModalOpen(true);
    }, [searchParams]);

    /* Real-time tasks subscription */
    useEffect(() => {
        if (!currentUser) return;
        return subscribeToTasks(
            currentUser.uid,
            setTasks,
            () => toast.error('Error de sincronización en tiempo real')
        );
    }, [currentUser]);

    /* ── CRUD handlers ── */

    async function handleSave(data) {
        try {
            if (editingTask) {
                await updateTask(editingTask.id, data);
                toast.success('Tarea actualizada ✅');
            } else {
                await addTask(currentUser.uid, data);
                toast.success('¡Tarea agregada! +10 XP al completarla ⚡');
            }
        } catch { toast.error('Error al guardar tarea'); }
        setEditingTask(null);
    }

    const handleToggle = useCallback(async (task) => {
        try {
            const shouldAward = await toggleTask(task.id, task.completed, task.xpAwarded);
            if (shouldAward) {
                await updateTask(task.id, { xpAwarded: true });
                await awardXP(currentUser.uid);
                toast.success('¡+10 XP ganados! 🎉', { icon: '⚡' });
            }
            if (!task.completed) toast.success('¡Tarea completada!', { icon: '✅' });
        } catch { toast.error('Error al actualizar tarea'); }
    }, [currentUser]);

    const handleDelete = async (taskId) => {
        try {
            await deleteTask(taskId);
            toast.success('Tarea eliminada');
        } catch { toast.error('Error al eliminar tarea'); }
    };

    function handleEdit(task) {
        setEditingTask(task);
        setModalOpen(true);
    }

    function handleModalClose() {
        setModalOpen(false);
        setEditingTask(null);
    }

    /* ── Filtering ── */
    const filtered = tasks.filter(t => {
        if (filter === 'pending' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        if (catFilter !== 'all' && t.category !== catFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!t.title?.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3 fade-in">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Mis Tareas</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {pending} pendientes · {completed} completadas
                    </p>
                </div>
                <button
                    id="add-task-btn"
                    onClick={() => { setEditingTask(null); setModalOpen(true); }}
                    className="glow-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Nueva tarea
                </button>
            </div>

            {/* ── Search bar ── */}
            <div className="relative fade-in">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                    id="task-search"
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar tareas…"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.target.style.border = '1px solid var(--accent)'}
                    onBlur={e => e.target.style.border = '1px solid var(--border)'}
                />
            </div>

            {/* ── Status filter tabs ── */}
            <div className="flex gap-2 fade-in">
                {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        id={`filter-${value}`}
                        onClick={() => setFilter(value)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={
                            filter === value
                                ? { background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }
                                : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' }
                        }
                        onMouseEnter={e => filter !== value && (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => filter !== value && (e.currentTarget.style.background = 'transparent')}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Category filter ── */}
            <div className="flex items-center gap-2 flex-wrap fade-in">
                <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                {CATEGORY_FILTERS.map(({ value, label }) => (
                    <button
                        key={value}
                        id={`cat-${value}`}
                        onClick={() => setCatFilter(value)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                        style={
                            catFilter === value
                                ? { background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)' }
                                : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                        }
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Task list ── */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 fade-in">
                    <div className="text-5xl mb-4">{tasks.length === 0 ? '🚀' : '🔍'}</div>
                    <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {tasks.length === 0 ? '¡Agrega tu primera tarea!' : 'Sin resultados para este filtro'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        {tasks.length === 0
                            ? 'Pulsa "Nueva tarea" para comenzar'
                            : 'Intenta con otros filtros o texto de búsqueda'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <TaskModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                onSave={handleSave}
                initialData={editingTask}
            />
        </div>
    );
}
