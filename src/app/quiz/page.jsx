"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    BookOpen, Code, Globe, Cpu, Database, Layout,
    Zap, Shield, Terminal, FileCode, Layers, Box,
    ChevronRight, Target, Search, X, SlidersHorizontal,
} from 'lucide-react';

function getCategoryIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('python'))                          return { icon: Terminal,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   glow: 'group-hover:shadow-blue-500/20'   };
    if (n.includes('javascript') || n.includes('js')) return { icon: Code,      color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'group-hover:shadow-yellow-500/20' };
    if (n.includes('react'))                           return { icon: Layers,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   glow: 'group-hover:shadow-cyan-500/20'   };
    if (n.includes('css'))                             return { icon: Layout,    color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30',   glow: 'group-hover:shadow-pink-500/20'   };
    if (n.includes('html'))                            return { icon: Globe,     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'group-hover:shadow-orange-500/20' };
    if (n.includes('sql') || n.includes('database'))  return { icon: Database,  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'group-hover:shadow-purple-500/20' };
    if (n.includes('typescript') || n.includes('ts')) return { icon: FileCode,  color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/30',    glow: 'group-hover:shadow-sky-500/20'    };
    if (n.includes('next'))                            return { icon: Zap,       color: 'text-white',      bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   glow: 'group-hover:shadow-gray-500/20'   };
    if (n.includes('security') || n.includes('cyber'))return { icon: Shield,    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    glow: 'group-hover:shadow-red-500/20'    };
    if (n.includes('algorithm'))                       return { icon: Cpu,       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  glow: 'group-hover:shadow-green-500/20'  };
    if (n.includes('docker') || n.includes('devops')) return { icon: Box,       color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   glow: 'group-hover:shadow-teal-500/20'   };
    return                                               { icon: BookOpen,   color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  glow: 'group-hover:shadow-green-500/20'  };
}

const DIFF = {
    Hard:   { label: 'Qiyin',  cls: 'bg-red-500/10 text-red-400 border border-red-500/30',    dot: 'bg-red-400'    },
    Medium: { label: "O'rta",  cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30', dot: 'bg-yellow-400' },
    Easy:   { label: 'Oson',   cls: 'bg-green-500/10 text-green-400 border border-green-500/30',  dot: 'bg-green-400'  },
};

const SORT_OPTIONS = [
    { value: 'default',    label: 'Default'         },
    { value: 'name_asc',   label: 'A → Z'           },
    { value: 'name_desc',  label: 'Z → A'           },
    { value: 'count_desc', label: "Ko'p savollar"   },
    { value: 'count_asc',  label: 'Kam savollar'    },
];

function QuizCard({ c, query }) {
    const { icon: Icon, color, bg, border, glow } = getCategoryIcon(c.category);
    const diff = DIFF[c.difficulty] || DIFF.Easy;
    const count = c.count > 31 ? '31+' : c.count;

    function Highlight({ text }) {
        if (!query) return <span>{text}</span>;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return <span>{text}</span>;
        return (
            <span>
                {text.slice(0, idx)}
                <mark className="bg-green-500/25 text-green-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
                {text.slice(idx + query.length)}
            </span>
        );
    }

    return (
        <Link
            href={`/quiz/${encodeURIComponent(c.category)}`}
            className={`group relative flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 overflow-hidden
                hover:border-gray-600 hover:-translate-y-1 hover:shadow-2xl ${glow}
                transition-all duration-300`}
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl ${diff.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                    {diff.label}
                </span>
            </div>

            <h2 className={`font-bold text-base sm:text-lg mb-1 text-white group-hover:${color} transition-colors duration-200`}>
                <Highlight text={c.category} />
            </h2>

            <div className="mt-2 mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Target size={10} /> {count} ta savol
                    </span>
                    <span className="text-xs text-gray-600">{Math.min(c.count, 31)} / 31</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                            c.difficulty === 'Hard' ? 'from-red-600 to-red-400' :
                            c.difficulty === 'Medium' ? 'from-yellow-600 to-yellow-400' :
                            'from-green-600 to-green-400'
                        }`}
                        style={{ width: `${Math.min(100, (Math.min(c.count, 31) / 31) * 100)}%` }}
                    />
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-800">
                <span className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors hidden sm:block">
                    Boshlash uchun bosing
                </span>
                <div className="flex items-center gap-1 text-gray-600 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all duration-200 ml-auto">
                    <span className="text-xs font-medium">Boshlash</span>
                    <ChevronRight size={13} />
                </div>
            </div>
        </Link>
    );
}

export default function QuizListPage() {
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [diffFilter, setDiffFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');
    const [showSort, setShowSort] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/quizs');
                if (res.ok) {
                    const { categories } = await res.json();
                    setCats(categories || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = useMemo(() => {
        let list = [...cats];
        if (diffFilter !== 'All') list = list.filter(c => c.difficulty === diffFilter);
        if (search.trim()) list = list.filter(c => c.category.toLowerCase().includes(search.trim().toLowerCase()));
        switch (sort) {
            case 'name_asc':   list.sort((a, b) => a.category.localeCompare(b.category)); break;
            case 'name_desc':  list.sort((a, b) => b.category.localeCompare(a.category)); break;
            case 'count_desc': list.sort((a, b) => b.count - a.count); break;
            case 'count_asc':  list.sort((a, b) => a.count - b.count); break;
        }
        return list;
    }, [cats, diffFilter, search, sort]);

    const hardCount   = cats.filter(c => c.difficulty === 'Hard').length;
    const mediumCount = cats.filter(c => c.difficulty === 'Medium').length;
    const easyCount   = cats.filter(c => c.difficulty === 'Easy').length;

    const DIFF_FILTERS = [
        { value: 'All',    label: 'Barchasi', count: cats.length },
        { value: 'Easy',   label: 'Oson',     count: easyCount   },
        { value: 'Medium', label: "O'rta",    count: mediumCount },
        { value: 'Hard',   label: 'Qiyin',    count: hardCount   },
    ];

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Page header */}
            <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Quiz Tanlash</h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Kategoriyani tanlang, testlarni yeching va XP to'plang
                </p>
            </div>

            {/* Filters & Search */}
            <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800/60 px-3 sm:px-6 py-2.5">
                <div className="flex flex-col gap-2">
                    {/* Row 1: search + sort */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Kategoriya qidirish…"
                                className="w-full bg-gray-900 border border-gray-800 text-white text-sm placeholder-gray-600 rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:border-green-600 transition-colors"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <div className="relative shrink-0">
                            <button
                                onClick={() => setShowSort(s => !s)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                    showSort
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                            >
                                <SlidersHorizontal size={12} />
                                <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
                            </button>
                            {showSort && (
                                <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]">
                                    {SORT_OPTIONS.map(o => (
                                        <button
                                            key={o.value}
                                            onClick={() => { setSort(o.value); setShowSort(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                                                sort === o.value
                                                    ? 'bg-green-900/40 text-green-400'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                        >
                                            {sort === o.value && <span className="mr-1.5">✓</span>}
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: difficulty pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {DIFF_FILTERS.map(({ value, label, count }) => {
                            const active = diffFilter === value;
                            const activeStyle =
                                value === 'Easy'   ? 'bg-green-900/60 border-green-700 text-green-400' :
                                value === 'Medium' ? 'bg-yellow-900/60 border-yellow-700 text-yellow-400' :
                                value === 'Hard'   ? 'bg-red-900/60 border-red-700 text-red-400' :
                                'bg-green-900/60 border-green-700 text-green-400';

                            return (
                                <button
                                    key={value}
                                    onClick={() => setDiffFilter(value)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                                        active ? activeStyle : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                    }`}
                                >
                                    {label}
                                    <span className={`text-xs px-1 py-0.5 rounded-md font-bold ${active ? 'bg-white/10' : 'bg-gray-800'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="px-3 sm:px-6 py-4 sm:py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Kategoriyalar yuklanmoqda…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-white font-semibold mb-1 text-sm">Hech narsa topilmadi</p>
                        <p className="text-gray-500 text-xs mb-4">
                            {search ? `"${search}" bo'yicha natija yo'q` : 'Bu darajada quiz mavjud emas'}
                        </p>
                        <button
                            onClick={() => { setSearch(''); setDiffFilter('All'); }}
                            className="text-green-400 text-sm font-medium hover:underline"
                        >
                            Filtrlarni tozalash
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 text-xs mb-3">
                            {filtered.length === cats.length
                                ? `${cats.length} ta kategoriya`
                                : `${filtered.length} / ${cats.length} kategoriya`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {filtered.map(c => (
                                <QuizCard key={c.category} c={c} query={search} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
