// DashboardPage – stats overview, productivity chart, XP/level card, quick actions
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks } from '../firebase/taskService';
import { subscribeToUserProfile, getLevelInfo } from '../firebase/userService';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

/* Build last-7-days chart data from task list */
function buildChartData(tasks) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('es', { weekday: 'short' });
        const completed = tasks.filter(t => {
            if (!t.completed || !t.createdAt) return false;
            const td = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
            return td.toDateString() === d.toDateString();
        }).length;
        return { day: label, completed };
    });
}

/* Individual stat card */
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
    return (
        <div
            className="glass rounded-2xl p-5 flex items-center gap-4 fade-in cursor-default"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: color }}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
        </div>
    );
}

/* Greeting based on time of day */
function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
}

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [profile, setProfile] = useState({ xp: 0, tasksCompleted: 0 });

    /* Real-time subscriptions */
    useEffect(() => {
        if (!currentUser) return;
        return subscribeToTasks(currentUser.uid, setTasks);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        return subscribeToUserProfile(currentUser.uid, setProfile);
    }, [currentUser]);

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const d = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
        return d < new Date();
    }).length;

    const levelInfo = getLevelInfo(profile.xp ?? 0);
    const chart = buildChartData(tasks);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">

            {/* ── Header ── */}
            <div className="fade-in">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {greeting()},{' '}
                    <span className="gradient-text">{currentUser?.displayName || 'usuario'}</span> 👋
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Aquí está tu resumen de productividad
                </p>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ListTodo} label="Total" value={total} color="linear-gradient(135deg,#475569,#334155)" delay={0.00} />
                <StatCard icon={Clock} label="Pendientes" value={pending} color="linear-gradient(135deg,#d97706,#b45309)" delay={0.04} />
                <StatCard icon={CheckCircle2} label="Completadas" value={completed} color="linear-gradient(135deg,#059669,#047857)" delay={0.08} />
                <StatCard icon={AlertTriangle} label="Vencidas" value={overdue} color="linear-gradient(135deg,#dc2626,#b91c1c)" delay={0.12} />
            </div>

            {/* ── XP / Level card ── */}
            <div
                className="rounded-2xl p-6 relative overflow-hidden fade-in"
                style={{ background: `linear-gradient(135deg, ${levelInfo.color.split(' ').pop().replace('to-', '').replace(/[a-z]+-\d+/, '')}`, animationDelay: '0.16s' }}
            >
                {/* fallback gradient that always works */}
                <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a21caf 100%)', zIndex: 0 }}
                />
                <div className="absolute inset-0 opacity-20 rounded-2xl" style={{ background: 'radial-gradient(circle at top right, white, transparent)' }} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                <span className="font-bold text-white text-lg">
                                    Nivel {levelInfo.level} – {levelInfo.badge}
                                </span>
                            </div>
                            <p className="text-white/70 text-sm">
                                {profile.xp ?? 0} / {levelInfo.nextXP} XP
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/60 text-xs mb-1">Tareas completadas</p>
                            <p className="text-white font-bold text-3xl">{profile.tasksCompleted ?? 0}</p>
                        </div>
                    </div>

                    {/* XP progress bar */}
                    <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${levelInfo.progress}%`, background: 'rgba(255,255,255,0.8)' }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        <p className="text-white/50 text-xs">{Math.round(levelInfo.progress)}% al siguiente nivel</p>
                        <p className="text-white/50 text-xs">+10 XP por tarea ⚡</p>
                    </div>
                </div>
            </div>

            {/* ── Productivity chart ── */}
            <div className="glass rounded-2xl p-6 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Tareas completadas – últimos 7 días
                    </h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                                fontSize: 12,
                                color: 'var(--text-primary)',
                            }}
                        />
                        <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#6366f1', r: 3 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* ── Quick actions ── */}
            <div className="grid grid-cols-2 gap-3 fade-in" style={{ animationDelay: '0.24s' }}>
                <Link
                    to="/tasks"
                    className="py-3 rounded-xl text-center text-sm font-semibold text-white glow-btn transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    Ver todas las tareas
                </Link>
                <Link
                    to="/tasks?new=1"
                    className="py-3 rounded-xl text-center text-sm font-semibold transition-all"
                    style={{
                        border: '1px solid var(--accent)',
                        color: 'var(--accent-2)',
                        background: 'rgba(99,102,241,0.08)',
                    }}
                >
                    + Nueva tarea
                </Link>
            </div>
        </div>
    );
}
