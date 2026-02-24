// DashboardPage - overview with stats, XP/level card, and productivity chart
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Zap, TrendingUp, ListTodo } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks } from '../firebase/taskService';
import { subscribeToUserProfile, getLevelInfo } from '../firebase/userService';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

// Build last-7-days chart data from task list
function buildChartData(tasks) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en', { weekday: 'short' });
        const completed = tasks.filter((t) => {
            if (!t.completed || !t.createdAt) return false;
            const td = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
            return td.toDateString() === d.toDateString();
        }).length;
        days.push({ day: label, completed });
    }
    return days;
}

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className="glass rounded-2xl p-5 flex items-start gap-4 fade-in">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
    </div>
);

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState({ xp: 0, tasksCompleted: 0 });

    // Real-time subscription to tasks
    useEffect(() => {
        if (!currentUser) return;
        const unsub = subscribeToTasks(currentUser.uid, setTasks);
        return unsub;
    }, [currentUser]);

    // Real-time subscription to user profile
    useEffect(() => {
        if (!currentUser) return;
        const unsub = subscribeToUserProfile(currentUser.uid, setProfile);
        return unsub;
    }, [currentUser]);

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => {
        if (t.completed || !t.dueDate) return false;
        const due = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
        return due < new Date();
    }).length;

    const levelInfo = getLevelInfo(profile.xp ?? 0);
    const chartData = buildChartData(tasks);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="fade-in">
                <h2 className="text-2xl font-bold text-white">
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                    <span className="gradient-text">{currentUser?.displayName || 'there'}</span> 👋
                </h2>
                <p className="text-slate-400 text-sm mt-1">Here's your productivity overview</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ListTodo} label="Total Tasks" value={total} color="from-slate-500 to-slate-600" />
                <StatCard icon={Clock} label="Pending" value={pending} color="from-amber-500 to-orange-500" />
                <StatCard icon={CheckCircle2} label="Completed" value={completed} color="from-emerald-500 to-green-500" />
                <StatCard icon={TrendingUp} label="Overdue" value={overdue} color="from-red-500 to-rose-500" />
            </div>

            {/* XP / Level card */}
            <div className={`rounded-2xl p-6 bg-gradient-to-r ${levelInfo.color} relative overflow-hidden fade-in`}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-white" />
                            <span className="font-bold text-white text-lg">Level {levelInfo.level} – {levelInfo.badge}</span>
                        </div>
                        <p className="text-white/80 text-sm">{profile.xp ?? 0} / {levelInfo.nextXP} XP</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/70 text-xs mb-1">Tasks completed</p>
                        <p className="text-white font-bold text-2xl">{profile.tasksCompleted ?? 0}</p>
                    </div>
                </div>
                {/* XP progress bar */}
                <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div
                        className="bg-white rounded-full h-2 transition-all duration-700"
                        style={{ width: `${levelInfo.progress}%` }}
                    />
                </div>
                <p className="text-white/60 text-xs mt-2">{Math.round(levelInfo.progress)}% to next level</p>
            </div>

            {/* Productivity chart */}
            <div className="glass rounded-2xl p-6 fade-in">
                <h3 className="font-semibold text-white mb-4">Tasks Completed – Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: '#e0e7ff' }}
                            itemStyle={{ color: '#818cf8' }}
                        />
                        <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3">
                <Link
                    to="/tasks"
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-center text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                    View All Tasks
                </Link>
                <Link
                    to="/tasks?new=1"
                    className="flex-1 py-3 rounded-xl border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 font-medium text-center text-sm transition-all"
                >
                    + Add Task
                </Link>
            </div>
        </div>
    );
}
