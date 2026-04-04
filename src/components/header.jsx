'use client';

import { Bell, Search, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

function getLevelProgress(xp) {
    let level = 1;
    let accumulated = 0;
    while (accumulated + level * 500 <= xp) {
        accumulated += level * 500;
        level++;
    }
    const xpInLevel = xp - accumulated;
    const xpNeeded = level * 500;
    return { level, xpInLevel, xpNeeded, percent: Math.round((xpInLevel / xpNeeded) * 100) };
}

export default function Header({ onToggle }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const { user } = await res.json();
                    setUser(user);
                }
            } catch (err) {
                console.error('Header fetch error', err);
            }
        }
        fetchUser();
    }, []);

    const username = user?.username || '—';
    const xp = user?.xp || 0;
    const dailyXp = user?.dailyXp || 0;
    const { level, percent } = getLevelProgress(xp);

    return (
        <header className="h-16 md:h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
            {/* Left */}
            <div className="flex items-center gap-3 sm:gap-6">
                <svg
                    onClick={onToggle}
                    className="cursor-pointer shrink-0 hidden md:block"
                    width="20" height="16" viewBox="0 0 12 10"
                    fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 9.5C0 9.22386 0.223858 9 0.5 9H11.5C11.7761 9 12 9.22386 12 9.5C12 9.77614 11.7761 10 11.5 10H0.5C0.223858 10 0 9.77614 0 9.5Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.5C0 6.22386 0.223858 6 0.5 6H11.5C11.7761 6 12 6.22386 12 6.5C12 6.77614 11.7761 7 11.5 7H0.5C0.223858 7 0 6.77614 0 6.5Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 3.5C0 3.22386 0.223858 3 0.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H0.5C0.223858 4 0 3.77614 0 3.5Z" fill="white"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 0.5C0 0.223858 0.223858 0 0.5 0H11.5C11.7761 0 12 0.223858 12 0.5C12 0.776142 11.7761 1 11.5 1H0.5C0.223858 1 0 0.776142 0 0.5Z" fill="white"/>
                </svg>

                {/* Logo text on mobile */}
                <span className="md:hidden text-white font-bold text-base">
                    <span className="text-green-400">D</span>MS
                </span>

                {/* Search — desktop only */}
                <div className="hidden md:flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-56 lg:w-64">
                    <Search size={15} className="text-gray-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        className="bg-transparent border-none outline-none text-gray-400 text-sm w-full placeholder-gray-600"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-6">
                {/* Daily XP */}
                <div className="flex items-center gap-1 sm:gap-1.5 bg-green-950 border border-green-900 text-green-400 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                    <Zap size={12} />
                    +{dailyXp} XP
                </div>

                {/* Bell — hidden on smallest screens */}
                <div className="relative cursor-not-allowed hidden sm:block">
                    <Bell size={18} className="text-gray-400" />
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full border-2 border-gray-900" />
                </div>

                {/* User */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:block text-right">
                        <p className="text-white text-sm font-semibold m-0 leading-tight">{username}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-green-400 text-xs">Lv {level}</span>
                            <div className="w-12 lg:w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                        </div>
                    </div>
                    <Link href="/user" className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer shrink-0">
                        {username.charAt(0).toUpperCase()}
                    </Link>
                </div>
            </div>
        </header>
    );
}
