// TasksPage - main task management view with real-time list, filter, search, and CRUD
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks, addTask, updateTask, deleteTask, toggleTask } from '../firebase/taskService';
import { subscribeToUserProfile, awardXP } from '../firebase/userService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const FILTERS = ['all', 'pending', 'completed'];
const CATEGORIES = ['all', 'work', 'personal', 'study', 'other'];

export default function TasksPage() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();

    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Open "add task" modal if linked from dashboard with ?new=1
    useEffect(() => {
        if (searchParams.get('new') === '1') setModalOpen(true);
    }, [searchParams]);

    // Real-time tasks subscription
    useEffect(() => {
        if (!currentUser) return;
        const unsub = subscribeToTasks(currentUser.uid, setTasks);
        return unsub;
    }, [currentUser]);

    // --- CRUD handlers ---

    async function handleSave(data) {
        try {
            if (editingTask) {
                // Update existing task
                await updateTask(editingTask.id, data);
                toast.success('Task updated ✅');
            } else {
                // Add new task
                await addTask(currentUser.uid, data);
                toast.success('Task added! +10 XP on completion 🎯');
            }
        } catch {
            toast.error('Something went wrong');
        }
        setEditingTask(null);
    }

    const handleToggle = useCallback(async (task) => {
        try {
            // Toggle completed and check if XP should be awarded
            const shouldAward = await toggleTask(task.id, task.completed, task.xpAwarded);
            if (shouldAward) {
                // Mark xpAwarded on task and update user XP
                await updateTask(task.id, { xpAwarded: true });
                await awardXP(currentUser.uid);
                toast.success('+10 XP earned! 🎉', { icon: '⚡' });
            }
            if (!task.completed) {
                toast.success('Task completed!', { icon: '✅' });
            }
        } catch {
            toast.error('Failed to update task');
        }
    }, [currentUser]);

    async function handleDelete(taskId) {
        try {
            await deleteTask(taskId);
            toast.success('Task deleted');
        } catch {
            toast.error('Failed to delete task');
        }
    }

    function handleEdit(task) {
        setEditingTask(task);
        setModalOpen(true);
    }

    function handleModalClose() {
        setModalOpen(false);
        setEditingTask(null);
    }

    // --- Filtering ---
    const filtered = tasks.filter((t) => {
        if (filter === 'pending' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        if (catFilter !== 'all' && t.category !== catFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!t.title?.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const pendingCount = tasks.filter((t) => !t.completed).length;
    const completedCount = tasks.filter((t) => t.completed).length;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-white">My Tasks</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {pendingCount} pending · {completedCount} completed
                    </p>
                </div>
                <button
                    id="add-task-btn"
                    onClick={() => { setEditingTask(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>

            {/* Search bar */}
            <div className="relative fade-in">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    id="task-search"
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks…"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 fade-in">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        id={`filter-${f}`}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f
                                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Category filter chips */}
            <div className="flex gap-2 flex-wrap fade-in">
                <Filter className="w-4 h-4 text-slate-500 self-center" />
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        id={`cat-${c}`}
                        onClick={() => setCatFilter(c)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all ${catFilter === c
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Task list */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-600 fade-in">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="font-medium text-slate-400">
                        {tasks.length === 0 ? 'No tasks yet – add one!' : 'No tasks match your filter'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((task) => (
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
