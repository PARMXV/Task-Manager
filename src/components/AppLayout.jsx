// AppLayout – authenticated app shell with sidebar + main content + mobile nav
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppLayout() {
    return (
        <div
            className="min-h-screen flex"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0 min-h-screen">
                <Outlet />
            </main>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
                <BottomNav />
            </nav>
        </div>
    );
}
