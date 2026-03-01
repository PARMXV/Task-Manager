// Sidebar – desktop navigation (w-64) with logo, nav links, user card, theme toggle, logout
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, LogOut, Sun, Moon, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Mis Tareas' },
];

export default function Sidebar() {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
            toast.success('Sesión cerrada');
        } catch {
            toast.error('Error al cerrar sesión');
        }
    }

    const initial = (currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase();

    return (
        <div
            className="w-64 h-screen flex flex-col flex-shrink-0 sticky top-0"
            style={{
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
            }}
        >
            {/* ── Brand ── */}
            <div className="px-5 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                    <div className="ring-pulse w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                            TaskFlow
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cloud Task Manager</p>
                    </div>
                </div>
            </div>

            {/* ── Nav links ── */}
            <nav className="flex-1 px-3 py-5 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'active-nav' : 'inactive-nav'
                            }`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.15))',
                                    color: '#a5b4fc',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                }
                                : {
                                    color: 'var(--text-secondary)',
                                    border: '1px solid transparent',
                                }
                        }
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* ── User card + controls ── */}
            <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 glass">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {currentUser?.displayName || 'Usuario'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            {currentUser?.email}
                        </p>
                    </div>
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    {theme === 'dark'
                        ? <Sun className="w-4 h-4 text-amber-400" />
                        : <Moon className="w-4 h-4 text-indigo-400" />}
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
