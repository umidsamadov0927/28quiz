'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    Settings,
    LogOut,
    Zap,
    Flame, HomeIcon, TrophyIcon, PlusIcon, BookOpenIcon, UserIcon,
} from 'lucide-react';

const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: HomeIcon, route: '/dashboard' },
    { key: 'quiz', label: 'Solve Quiz', icon: BookOpenIcon, route: '/quiz' },
    { key: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon, route: '/leaderboard' },
    { key: 'create', label: "Create Question", icon: PlusIcon, route: '/create' },
    { key: 'profile', label: "Profile", icon: UserIcon, route: '/user' },
];

const footerItems = [
    { key: 'sozlamalar', label: 'Sozlamalar', icon: Settings, route: '/settings', isDanger: false },
    { key: 'chiqish', label: 'Chiqish', icon: LogOut, route: '/logout', isDanger: true },
];

export default function Sidebar({ isExpanded }) {
    const pathname = usePathname();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, text: '', top: 0, left: 0 });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        try {
            const raw = Cookies.get('session_token');
            if (raw) {
                const parsed = JSON.parse(raw);
                setCurrentUser(parsed);
            }
        } catch (err) {
            // ignore parse errors
        }
    }, []);

    const showTooltip = (e, text) => {
        if (isExpanded) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({ visible: true, text, top: rect.top + rect.height / 2 - 16, left: rect.right + 10 });
    };
    const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            Cookies.remove('session_token');
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    const visibleMenu = menuItems.filter((item) => {
        if (item.key === 'create') {
            return currentUser?.username === 'ad';
        }
        return true;
    });

    const NavItem = ({ item }) => {
        const isActive = pathname === item.route;
        const Icon = item.icon;

        if (item.key === 'chiqish') {
            return (
                <button
                    onClick={() => setShowLogoutModal(true)}
                    onMouseEnter={(e) => showTooltip(e, item.label)}
                    onMouseLeave={hideTooltip}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                >
                    <Icon size={18} className="shrink-0" />
                    {isExpanded && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                </button>
            );
        }

        return (
            <Link
                href={item.route}
                onMouseEnter={(e) => showTooltip(e, item.label)}
                onMouseLeave={hideTooltip}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 no-underline
                    ${isActive ? 'bg-green-900 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                    ${item.isDanger ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800' : ''}
                `}
            >
                <Icon size={18} className="shrink-0" />
                {isExpanded && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
            </Link>
        );
    };

    return (
        <>
            {/* ── Desktop sidebar ─────────────────────────────── */}
            <aside
                className={`hidden md:flex fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 flex-col z-50 transition-all duration-300 ease-in-out ${
                    isExpanded ? 'w-56' : 'w-[72px]'
                }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 overflow-hidden whitespace-nowrap">
                    <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center shrink-0">
                        <Zap size={20} className="text-green-400" />
                    </div>
                    {isExpanded && (
                        <div>
                            <p className="font-bold text-base text-white m-0 leading-tight">DMS Portal</p>
                            <p className="text-xs text-gray-500 m-0">Dealer Management</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {visibleMenu.map((item) => <NavItem key={item.key} item={item} />)}
                </nav>

                {/* Footer */}
                <div className="px-3 pb-4 border-t border-gray-800 pt-3 space-y-1">
                    {footerItems.map((item) => <NavItem key={item.key} item={item} />)}
                    {isExpanded && (
                        <div className="mt-3 bg-green-950 border border-green-900 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Flame size={16} className="text-orange-400" />
                                <span className="text-sm font-semibold text-white">7 Day Streak!</span>
                            </div>
                            <p className="text-xs text-gray-500 m-0">Keep solving to maintain your streak</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Desktop spacer */}
            <div className={`hidden md:block shrink-0 transition-all duration-300 ${isExpanded ? 'w-56' : 'w-[72px]'}`} />

            {/* ── Mobile bottom nav ───────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-900 border-t border-gray-800">
                <div className="flex items-stretch h-16">
                    {visibleMenu.map((item) => {
                        const isActive = pathname === item.route;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.key}
                                href={item.route}
                                className={`flex-1 flex items-center justify-center transition-colors ${
                                    isActive ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <Icon size={24} />
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex-1 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </nav>

            {/* Tooltip (desktop only) */}
            {tooltip.visible && (
                <div
                    className="fixed z-[100] bg-gray-800 text-white text-xs px-2 py-1 rounded-md pointer-events-none whitespace-nowrap border border-gray-700"
                    style={{ top: tooltip.top, left: tooltip.left }}
                >
                    {tooltip.text}
                </div>
            )}

            {/* Logout confirmation modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !loggingOut && setShowLogoutModal(false)}
                    />
                    {/* Modal */}
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-900/30 border border-red-800/50 rounded-2xl mx-auto mb-4">
                            <LogOut size={22} className="text-red-400" />
                        </div>
                        <h2 className="text-white font-bold text-lg text-center mb-1">Chiqishni tasdiqlang</h2>
                        <p className="text-gray-400 text-sm text-center mb-6">
                            Hisobingizdan chiqmoqchimisiz?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                disabled={loggingOut}
                                className="flex-1 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white font-semibold text-sm transition-colors disabled:opacity-40"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loggingOut ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogOut size={15} />
                                        Chiqish
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
