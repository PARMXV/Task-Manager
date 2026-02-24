// AppLayout - the main shell rendered when user is authenticated
// Contains the sidebar (or bottom nav on mobile) and an <Outlet> for page content
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-950 dark:bg-slate-950 bg-white flex text-slate-100 dark:text-slate-100 text-slate-800">
            {/* Desktop sidebar – hidden on mobile */}
            <aside className="hidden md:flex">
                <Sidebar />
            </aside>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                <Outlet />
            </main>

            {/* Mobile bottom navigation – shown only on small screens */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <BottomNav />
            </nav>
        </div>
    );
}
