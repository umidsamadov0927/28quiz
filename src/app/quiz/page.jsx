"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    BookOpen, Code, Globe, Cpu, Database, Layout,
    Zap, Shield, Terminal, FileCode, Layers, Box,
    Search, X, ChevronRight, Library,
} from 'lucide-react';

function getCategoryStyle(name) {
    const n = name.toLowerCase();
    if (n.includes('python'))                           return { icon: Terminal,  color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    glow: 'hover:border-blue-500/40',   accent: 'from-blue-500/10'   };
    if (n.includes('javascript') || n.includes('js'))  return { icon: Code,      color: 'text-yellow-400', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  glow: 'hover:border-yellow-500/40', accent: 'from-yellow-500/10' };
    if (n.includes('react'))                            return { icon: Layers,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    glow: 'hover:border-cyan-500/40',   accent: 'from-cyan-500/10'   };
    if (n.includes('css'))                              return { icon: Layout,    color: 'text-pink-400',   bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    glow: 'hover:border-pink-500/40',   accent: 'from-pink-500/10'   };
    if (n.includes('html'))                             return { icon: Globe,     color: 'text-orange-400', bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  glow: 'hover:border-orange-500/40', accent: 'from-orange-500/10' };
    if (n.includes('sql') || n.includes('database'))   return { icon: Database,  color: 'text-purple-400', bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  glow: 'hover:border-purple-500/40', accent: 'from-purple-500/10' };
    if (n.includes('typescript') || n.includes('ts'))  return { icon: FileCode,  color: 'text-sky-400',    bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     glow: 'hover:border-sky-500/40',    accent: 'from-sky-500/10'    };
    if (n.includes('next'))                             return { icon: Zap,       color: 'text-white',      bg: 'bg-gray-500/10',    border: 'border-gray-500/20',    glow: 'hover:border-gray-500/40',   accent: 'from-gray-500/10'   };
    if (n.includes('security') || n.includes('cyber')) return { icon: Shield,    color: 'text-red-400',    bg: 'bg-red-500/10',     border: 'border-red-500/20',     glow: 'hover:border-red-500/40',    accent: 'from-red-500/10'    };
    if (n.includes('algorithm'))                        return { icon: Cpu,       color: 'text-green-400',  bg: 'bg-green-500/10',   border: 'border-green-500/20',   glow: 'hover:border-green-500/40',  accent: 'from-green-500/10'  };
    if (n.includes('docker') || n.includes('devops'))  return { icon: Box,       color: 'text-teal-400',   bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    glow: 'hover:border-teal-500/40',   accent: 'from-teal-500/10'   };
    return                                               { icon: BookOpen,   color: 'text-green-400',  bg: 'bg-green-500/10',   border: 'border-green-500/20',   glow: 'hover:border-green-500/40',  accent: 'from-green-500/10'  };
}

function LibraryCard({ lib }) {
    const { icon: Icon, color, bg, border, glow, accent } = getCategoryStyle(lib.category);
    const dc = lib.diffCounts || { Easy: 0, Medium: 0, Hard: 0 };

    return (
        <Link
            href={`/quiz/${encodeURIComponent(lib.category)}`}
            className={`group relative flex flex-col bg-gray-900 border ${border} ${glow} rounded-2xl overflow-hidden
                transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
        >
            {/* Top gradient accent */}
            <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accent} to-transparent opacity-60`} />

            <div className="relative p-5 flex flex-col h-full">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-xl ${bg} ${color} border ${border}`}>
                        <Library size={10} />
                        Library
                    </div>
                </div>

                {/* Name */}
                <h2 className={`text-lg font-extrabold text-white mb-1 group-hover:${color} transition-colors duration-200`}>
                    {lib.category}
                </h2>

                {/* Question count */}
                <p className="text-sm text-gray-500 mb-4">
                    <span className="text-white font-semibold">{lib.count}</span> ta savol
                </p>

                {/* Difficulty breakdown */}
                <div className="flex gap-1.5 mb-4 flex-wrap">
                    {dc.Easy   > 0 && <span className="text-xs px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">Oson {dc.Easy}</span>}
                    {dc.Medium > 0 && <span className="text-xs px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">O'rta {dc.Medium}</span>}
                    {dc.Hard   > 0 && <span className="text-xs px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">Qiyin {dc.Hard}</span>}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Savol to'ldirilishi</span>
                        <span>{Math.min(lib.count, 31)}/31</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                                dc.Hard > 0 ? 'from-red-600 to-red-400' :
                                dc.Medium > 0 ? 'from-yellow-600 to-yellow-400' :
                                'from-green-600 to-green-400'
                            }`}
                            style={{ width: `${Math.min(100, (Math.min(lib.count, 31) / 31) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1">
                        <Zap size={11} className="text-green-400" />
                        <span className="text-xs text-green-400 font-semibold">+{lib.totalXp || 0} XP</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${color} group-hover:translate-x-0.5 transition-all duration-200`}>
                        Kirish <ChevronRight size={13} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function QuizLibraryPage() {
    const [libs, setLibs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [diffFilter, setDiffFilter] = useState('All');

    useEffect(() => {
        fetch('/api/quizs')
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setLibs(d.categories || []); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = [...libs];
        if (diffFilter !== 'All') list = list.filter(l => l.difficulty === diffFilter);
        if (search.trim()) list = list.filter(l => l.category.toLowerCase().includes(search.trim().toLowerCase()));
        return list.sort((a, b) => a.category.localeCompare(b.category));
    }, [libs, diffFilter, search]);

    const totalQuestions = libs.reduce((s, l) => s + l.count, 0);
    const totalXp        = libs.reduce((s, l) => s + (l.totalXp || 0), 0);

    return (
        <div className="min-h-screen bg-gray-950">

            {/* Hero header */}
            <div className="px-4 sm:px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-900/30 border border-green-800/50 flex items-center justify-center">
                        <Library size={18} className="text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-white">Quiz Kutubxonasi</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Dasturlash tillari bo'yicha savollar to'plami</p>
                    </div>
                </div>

                {/* Summary strip */}
                {!loading && (
                    <div className="flex gap-4 mt-3 flex-wrap">
                        {[
                            { label: 'Library', value: libs.length },
                            { label: 'Jami savollar', value: totalQuestions },
                            { label: 'Jami XP', value: `+${totalXp}` },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className="text-white font-bold text-sm">{s.value}</span>
                                <span className="text-gray-500 text-xs">{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky filter bar */}
            <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800/60 px-4 sm:px-6 py-2.5">
                <div className="flex gap-2 items-center">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Library qidirish…"
                            className="w-full bg-gray-900 border border-gray-800 text-white text-sm placeholder-gray-600 rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:border-green-600 transition-colors"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Difficulty pills */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {[
                            { v: 'All', label: 'Barchasi' },
                            { v: 'Easy', label: 'Oson' },
                            { v: 'Medium', label: "O'rta" },
                            { v: 'Hard', label: 'Qiyin' },
                        ].map(({ v, label }) => (
                            <button
                                key={v}
                                onClick={() => setDiffFilter(v)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                                    diffFilter === v
                                        ? v === 'Easy' ? 'bg-green-900/60 border-green-700 text-green-400'
                                        : v === 'Medium' ? 'bg-yellow-900/60 border-yellow-700 text-yellow-400'
                                        : v === 'Hard' ? 'bg-red-900/60 border-red-700 text-red-400'
                                        : 'bg-green-900/60 border-green-700 text-green-400'
                                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Library grid */}
            <div className="px-4 sm:px-6 py-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Kutubxona yuklanmoqda…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
                            <Library className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-white font-semibold mb-1 text-sm">Hech narsa topilmadi</p>
                        <p className="text-gray-500 text-xs mb-4">
                            {search ? `"${search}" bo'yicha natija yo'q` : 'Bu filtr bo\'yicha library mavjud emas'}
                        </p>
                        <button onClick={() => { setSearch(''); setDiffFilter('All'); }}
                            className="text-green-400 text-sm font-medium hover:underline">
                            Filtrlarni tozalash
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 text-xs mb-3">
                            {filtered.length === libs.length ? `${libs.length} ta library` : `${filtered.length} / ${libs.length} library`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(lib => (
                                <LibraryCard key={lib.category} lib={lib} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
