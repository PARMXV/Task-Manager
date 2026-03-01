// BottomNav – mobile fixed navigation bar at the bottom of the screen
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
];

export default function BottomNav() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login');
        toast.success('Sesión cerrada');
    }

    return (
        <div
            className="flex items-stretch"
            style={{
                background: 'var(--bg-surface)',
                borderTop: '1px solid var(--border)',
                backdropFilter: 'blur(16px)',
            }}
        >
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors"
                    style={({ isActive }) => ({
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    })}
                >
                    <Icon className="w-5 h-5" />
                    {label}
                </NavLink>
            ))}

            {/* Logout button in bottom nav */}
            <button
                onClick={handleLogout}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
            >
                <LogOut className="w-5 h-5" />
                Salir
            </button>
        </div>
    );
}
