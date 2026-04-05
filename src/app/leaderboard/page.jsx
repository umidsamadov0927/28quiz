"use client";

import { useEffect, useState } from 'react';
import { Zap, Trophy, ChevronLeft, ChevronRight, TrendingUp, Users, Target, Star, Lock } from 'lucide-react';
import Link from 'next/link';

const PER_PAGE = 10;

function computeLevel(xp) {
    let level = 1, acc = 0;
    while (acc + level * 500 <= xp) { acc += level * 500; level++; }
    return level;
}
function getAccuracy(u) {
    return u.questionsSolved > 0 ? Math.round(((u.correctAnswers || 0) / u.questionsSolved) * 100) : 0;
}

function CountUp({ target, duration = 1200 }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!target) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return <span>{val.toLocaleString()}</span>;
}

const PODIUM_CFG = [
    {
        rank: 2, size: 'w-12 h-12 sm:w-16 sm:h-16 text-lg sm:text-xl',
        baseH: 'h-20 sm:h-24', ring: 'ring-2 ring-slate-400/40',
        gradientFrom: 'from-slate-600/20', gradientTo: 'to-slate-500/5',
        borderColor: 'border-slate-500/30', textColor: 'text-slate-300', badge: '🥈',
        translateStart: 'translateY(60px)',
    },
    {
        rank: 1, size: 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl',
        baseH: 'h-28 sm:h-36', ring: 'ring-2 ring-yellow-400/50',
        gradientFrom: 'from-yellow-500/25', gradientTo: 'to-yellow-400/5',
        borderColor: 'border-yellow-400/40', textColor: 'text-yellow-300',
        badge: '🥇', translateStart: 'translateY(40px)',
    },
    {
        rank: 3, size: 'w-11 h-11 sm:w-14 sm:h-14 text-base sm:text-lg',
        baseH: 'h-14 sm:h-16', ring: 'ring-2 ring-orange-400/40',
        gradientFrom: 'from-orange-600/20', gradientTo: 'to-orange-500/5',
        borderColor: 'border-orange-400/30', textColor: 'text-orange-300', badge: '🥉',
        translateStart: 'translateY(80px)',
    },
];

function PodiumCard({ u, cfg, isYou, visible }) {
    const level = computeLevel(u?.xp || 0);
    return (
        <div
            className="flex flex-col items-center flex-1"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : cfg.translateStart,
                transition: `opacity 0.6s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)`,
                transitionDelay: cfg.rank === 1 ? '0ms' : cfg.rank === 2 ? '120ms' : '240ms',
            }}
        >
            {cfg.rank === 1 && (
                <div style={{ animation: 'crownFloat 2.5s ease-in-out infinite' }} className="text-2xl sm:text-3xl mb-1 select-none">👑</div>
            )}
            <div className="text-xl sm:text-2xl mb-1.5 select-none">{cfg.badge}</div>

            <div
                className={`relative ${cfg.size} rounded-2xl bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo} border ${cfg.borderColor} ${cfg.ring} flex items-center justify-center font-extrabold ${cfg.textColor} mb-2`}
                style={cfg.rank === 1 ? { boxShadow: '0 0 32px rgba(250,204,21,0.2)' } : {}}
            >
                {(u?.username || 'U').charAt(0).toUpperCase()}
                {cfg.rank === 1 && (
                    <>
                        <span style={{ animation: 'sparkle1 2s ease-in-out infinite' }} className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                        <span style={{ animation: 'sparkle2 2s ease-in-out infinite 0.7s' }} className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                    </>
                )}
            </div>

            <p className={`font-bold text-xs sm:text-sm text-center leading-tight mb-0.5 truncate w-full text-center px-1 ${isYou ? 'text-green-400' : 'text-white'}`}>
                {u?.username || '—'}
            </p>
            {isYou && <span className="text-xs text-green-500 mb-0.5">● Siz</span>}
            <p className="text-xs text-gray-500 mb-1.5">Lv {level}</p>

            <div className={`flex items-center gap-0.5 text-xs sm:text-sm font-bold mb-2 ${cfg.textColor}`}>
                <Zap size={11} />
                <CountUp target={u?.xp || 0} duration={1000 + cfg.rank * 200} />
            </div>

            <div className={`w-full ${cfg.baseH} bg-gradient-to-b ${cfg.gradientFrom} ${cfg.gradientTo} border border-b-0 ${cfg.borderColor} rounded-t-2xl flex flex-col items-center justify-center gap-0.5`}>
                <span className={`text-xl sm:text-2xl font-black ${cfg.textColor}`}>#{cfg.rank}</span>
                <span className="text-xs text-gray-600">{u?.questionsSolved || 0} savol</span>
            </div>
        </div>
    );
}

function Podium({ users, me }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <style>{`
                @keyframes crownFloat {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-6px) rotate(5deg); }
                }
                @keyframes sparkle1 {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(0.4); }
                }
                @keyframes sparkle2 {
                    0%, 100% { opacity: 0.4; transform: scale(0.6); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
            <div className="relative">
                <div className="absolute inset-0 flex justify-center items-end pointer-events-none overflow-hidden rounded-2xl">
                    <div className="w-48 h-32 bg-yellow-400/6 rounded-full blur-3xl" />
                </div>
                <div className="relative flex items-end justify-center gap-2 sm:gap-4 px-2 sm:px-6 pt-4">
                    {PODIUM_CFG.map((cfg) => {
                        const u = users[cfg.rank - 1];
                        if (!u) return null;
                        return (
                            <PodiumCard
                                key={cfg.rank}
                                u={u}
                                cfg={cfg}
                                isYou={!!(me && me.username === u.username)}
                                visible={visible}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}

const ROW_TOP = [
    { bg: 'bg-yellow-900/15 border-yellow-800/40', avatar: 'bg-yellow-400/10 border border-yellow-500/30 text-yellow-300', xp: 'text-yellow-400' },
    { bg: 'bg-slate-800/30 border-slate-700/40',   avatar: 'bg-slate-400/10 border border-slate-500/30 text-slate-300',   xp: 'text-slate-300'  },
    { bg: 'bg-orange-900/15 border-orange-800/40', avatar: 'bg-orange-400/10 border border-orange-500/30 text-orange-300', xp: 'text-orange-400' },
];
const MEDALS_TBL = ['', '🥇', '🥈', '🥉'];

function UserRow({ u, rank, isYou }) {
    const level = computeLevel(u.xp || 0);
    const acc = getAccuracy(u);
    const isTop3 = rank <= 3;
    const s = isTop3 ? ROW_TOP[rank - 1] : null;

    return (
        <div className={`flex items-center gap-2 sm:gap-4 px-2 sm:px-5 py-2.5 rounded-xl border transition-all duration-150
            ${isYou ? 'bg-green-900/20 border-green-800/50'
            : isTop3 ? `${s.bg} border`
            : 'border-transparent hover:bg-gray-800/50 hover:border-gray-700/40'}`}
        >
            <div className="w-6 sm:w-8 shrink-0 text-center">
                {isTop3
                    ? <span className="text-base leading-none">{MEDALS_TBL[rank]}</span>
                    : <span className={`text-xs sm:text-sm font-bold ${isYou ? 'text-green-400' : 'text-gray-500'}`}>{rank}</span>
                }
            </div>

            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-extrabold
                ${isTop3 ? s.avatar : isYou ? 'bg-green-900/40 border border-green-700 text-green-400' : 'bg-gray-800 text-white'}`}
            >
                {(u.username || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs sm:text-sm font-semibold truncate ${isYou ? 'text-green-400' : 'text-white'}`}>
                        {u.username}
                    </span>
                    {isYou && (
                        <span className="shrink-0 text-xs bg-green-900/50 border border-green-800 text-green-400 px-1.5 py-0.5 rounded-lg">
                            Siz
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-600">Lv {level}</span>
            </div>

            <div className="hidden sm:flex flex-col items-end shrink-0 w-14">
                <div className="flex items-center gap-1">
                    <Target size={10} className="text-gray-600" />
                    <span className="text-sm font-semibold text-white">{u.questionsSolved || 0}</span>
                </div>
                <span className="text-xs text-gray-600">savol</span>
            </div>

            <div className="hidden lg:flex flex-col items-end shrink-0 w-14">
                <div className="flex items-center gap-1">
                    <Star size={10} className="text-gray-600" />
                    <span className="text-sm font-semibold text-white">{acc}%</span>
                </div>
                <span className="text-xs text-gray-600">aniqlik</span>
            </div>

            <div className="flex items-center gap-1 shrink-0 justify-end min-w-[60px]">
                <Zap size={11} className={isTop3 ? s?.xp : 'text-green-400'} />
                <span className={`text-xs sm:text-sm font-bold ${isTop3 ? s?.xp : 'text-green-400'}`}>
                    {(u.xp || 0).toLocaleString()}
                </span>
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onChange }) {
    const range = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
        range.push(1);
        if (page > 3) range.push('…');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) range.push(i);
        if (page < totalPages - 2) range.push('…');
        range.push(totalPages);
    }
    const base = 'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all border';
    return (
        <div className="flex items-center gap-1">
            <button onClick={() => onChange(page - 1)} disabled={page === 1}
                className={`${base} bg-gray-800 border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`}>
                <ChevronLeft size={13} />
            </button>
            {range.map((p, i) =>
                p === '…'
                    ? <span key={`d${i}`} className="w-6 text-center text-gray-600 text-xs">…</span>
                    : <button key={p} onClick={() => onChange(p)}
                        className={`${base} ${p === page
                            ? 'bg-green-600 border-green-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}>
                        {p}
                    </button>
            )}
            <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
                className={`${base} bg-gray-800 border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`}>
                <ChevronRight size={13} />
            </button>
        </div>
    );
}

export default function LeaderboardPage() {
    const [board, setBoard]     = useState([]);
    const [top3, setTop3]       = useState([]);
    const [me, setMe]             = useState(null);
    const [meLoading, setMeLoading] = useState(true);
    const [myRank, setMyRank]   = useState(null);
    const [total, setTotal]     = useState(0);
    const [page, setPage]       = useState(1);
    const [loading, setLoading] = useState(true);

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const startRank  = (page - 1) * PER_PAGE + 1;

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.ok ? r.json() : null)
            .then(d => d && setMe(d.user || null))
            .catch(() => {})
            .finally(() => setMeLoading(false));
    }, []);

    useEffect(() => {
        fetch('/api/leaderboard?page=1&limit=3')
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setTop3(d.leaderboard || []); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/leaderboard?page=${page}&limit=${PER_PAGE}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (!d) return;
                setBoard(d.leaderboard || []);
                setTotal(d.total || 0);
                if (d.myRank) setMyRank(d.myRank);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page]);

    const handlePage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Level gate ──
    if (meLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const myLevel = computeLevel(me?.xp || 0);
    const REQUIRED_LEVEL = 2;

    if (!me || myLevel < REQUIRED_LEVEL) {
        // XP needed to reach level 5: sum(i*500, i=1..4) = 5000
        const xpForLevel5 = Array.from({ length: REQUIRED_LEVEL - 1 }, (_, i) => (i + 1) * 500).reduce((a, b) => a + b, 0);
        const currentXp   = me?.xp || 0;
        const progress    = Math.min(100, (currentXp / xpForLevel5) * 100);
        const xpNeeded    = Math.max(0, xpForLevel5 - currentXp);

        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="max-w-sm w-full text-center space-y-5">
                    <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                        <Lock size={24} className="text-gray-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Reyting jadvali yopiq</h2>
                        <p className="text-gray-500 text-sm mt-1">Ko&apos;rish uchun <span className="text-green-400 font-semibold">Level {REQUIRED_LEVEL}</span> ga yetish kerak</p>
                    </div>

                    {me ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Joriy level</span>
                                <span className="text-white font-bold">Lv {myLevel}</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                    <span className="text-white font-medium">{currentXp.toLocaleString()} XP</span>
                                    <span>{xpForLevel5.toLocaleString()} XP</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Level {REQUIRED_LEVEL} uchun yana{' '}
                                    <span className="text-green-400 font-semibold">{xpNeeded.toLocaleString()} XP</span> kerak
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                                <Zap size={12} className="text-green-400" />
                                <span className="text-xs text-gray-400">Quiz ishlash orqali XP to&apos;plang</span>
                            </div>
                            <Link href="/quiz"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors">
                                Quizga o&apos;tish
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
                            <p className="text-sm text-gray-400">Ko&apos;rish uchun tizimga kiring</p>
                            <Link href="/login"
                                className="flex items-center justify-center w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors">
                                Kirish
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-4">

                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Reyting jadvali</h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">Eng ko'p XP to'plagan foydalanuvchilar</p>
                </div>

                {/* Stats chips */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5">
                        <Users size={13} className="text-blue-400" />
                        <span className="text-white font-bold text-sm">{total}</span>
                        <span className="text-gray-500 text-xs">ishtirokchi</span>
                    </div>
                    {myRank && (
                        <div className="flex items-center gap-1.5 bg-green-900/20 border border-green-800/50 rounded-xl px-3 py-1.5">
                            <TrendingUp size={13} className="text-green-400" />
                            <span className="text-green-400 font-bold text-sm">#{myRank}</span>
                            <span className="text-gray-400 text-xs">sizning o'rningiz</span>
                        </div>
                    )}
                    {me && (
                        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5">
                            <Zap size={13} className="text-green-400" />
                            <span className="text-white font-bold text-sm">{(me.xp || 0).toLocaleString()} XP</span>
                        </div>
                    )}
                </div>

                {/* Podium */}
                {top3.length >= 2 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl pt-4 sm:pt-6 px-2 sm:px-6 overflow-hidden">
                        <div className="flex items-center gap-2 mb-3 px-2 sm:px-0">
                            <Trophy size={14} className="text-yellow-400" />
                            <p className="text-white font-semibold text-sm">Top 3 — Eng yaxshilar</p>
                        </div>
                        <Podium users={top3} me={me} />
                    </div>
                )}

                {/* Table */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 py-2.5 border-b border-gray-800 px-3 sm:px-5">
                        <div className="w-6 sm:w-8 shrink-0" />
                        <p className="flex-1 text-xs font-semibold text-gray-600 uppercase tracking-wider pl-10">Foydalanuvchi</p>
                        <p className="hidden sm:block w-14 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider shrink-0">Savol</p>
                        <p className="hidden lg:block w-14 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider shrink-0">Aniqlik</p>
                        <p className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider shrink-0 min-w-[60px]">XP</p>
                    </div>

                    <div className="p-2 space-y-0.5">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 text-sm">Yuklanmoqda…</p>
                            </div>
                        ) : board.length === 0 ? (
                            <p className="text-center text-gray-500 py-10 text-sm">Ma'lumot topilmadi</p>
                        ) : board.map((u, i) => (
                            <UserRow
                                key={u._id || i}
                                u={u}
                                rank={startRank + i}
                                isYou={!!(me && me.username === u.username)}
                            />
                        ))}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-t border-gray-800">
                            <p className="text-xs text-gray-600">
                                <span className="text-gray-400 font-medium">{startRank}–{Math.min(startRank + PER_PAGE - 1, total)}</span>
                                {' / '}{total}
                            </p>
                            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
