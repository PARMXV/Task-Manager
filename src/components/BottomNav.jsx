// BottomNav - mobile navigation bar fixed at the bottom of the screen
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare } from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
];

export default function BottomNav() {
    return (
        <div className="flex items-stretch glass dark:glass border-t border-slate-800 dark:border-slate-800 border-slate-200 bg-slate-900 dark:bg-slate-900 bg-white">
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500'
                        }`
                    }
                >
                    <Icon className="w-5 h-5" />
                    {label}
                </NavLink>
            ))}
        </div>
    );
}
