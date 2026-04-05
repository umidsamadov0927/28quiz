'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Users,
    Zap,
    TrendingUp,
    UserPlus,
    BookOpen,
    Flame,
    Search,
    X,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Activity,
    Target,
    Clock,
    Award,
    Trash2,
    Eye,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLastActive(lastActive) {
    if (!lastActive) return 'Hech qachon';
    const diff = Math.floor((Date.now() - new Date(lastActive)) / 86400000);
    if (diff === 0) return 'Bugun';
    if (diff === 1) return 'Kecha';
    return `${diff} kun oldin`;
}

function computeLevel(xp) {
    let level = 1, accumulated = 0;
    while (accumulated + level * 500 <= xp) { accumulated += level * 500; level++; }
    const xpInLevel = xp - accumulated;
    const xpNeeded = level * 500;
    return { level, percent: Math.round((xpInLevel / xpNeeded) * 100) };
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isActiveThisWeek(lastActive) {
    if (!lastActive) return false;
    return Date.now() - new Date(lastActive) < 7 * 24 * 60 * 60 * 1000;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

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
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className={`${base} bg-gray-800 border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`}
            >
                <ChevronLeft size={13} />
            </button>
            {range.map((p, i) =>
                p === '…'
                    ? <span key={`d${i}`} className="w-6 text-center text-gray-600 text-xs">…</span>
                    : (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={`${base} ${p === page
                                ? 'bg-green-600 border-green-500 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                            {p}
                        </button>
                    )
            )}
            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className={`${base} bg-gray-800 border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`}
            >
                <ChevronRight size={13} />
            </button>
        </div>
    );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, loading }) {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-900/20 border-blue-800/50',
        green: 'text-green-400 bg-green-900/20 border-green-800/50',
        emerald: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/50',
        purple: 'text-purple-400 bg-purple-900/20 border-purple-800/50',
        yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/50',
        orange: 'text-orange-400 bg-orange-900/20 border-orange-800/50',
    };
    const cls = colorMap[color] || colorMap.green;
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cls}`}>
                <Icon size={18} />
            </div>
            {loading ? (
                <div className="h-7 w-16 bg-gray-800 rounded-lg animate-pulse" />
            ) : (
                <p className="text-2xl font-extrabold text-white leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            )}
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
        </div>
    );
}

// ─── Category Bar Chart ──────────────────────────────────────────────────────

function CategoryChart({ categories, loading }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-24 h-3 bg-gray-800 rounded animate-pulse" />
                        <div className="flex-1 h-3 bg-gray-800 rounded animate-pulse" />
                        <div className="w-8 h-3 bg-gray-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }
    if (!categories || categories.length === 0) {
        return <p className="text-gray-500 text-sm text-center py-6">Ma'lumot yo'q</p>;
    }
    const maxCount = Math.max(...categories.map(c => c.count), 1);
    return (
        <div className="space-y-2.5">
            {categories.map(({ category, count }) => {
                const pct = Math.round((count / maxCount) * 100);
                return (
                    <div key={category} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28 truncate shrink-0">{category}</span>
                        <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right shrink-0">{count}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Top 5 Users ─────────────────────────────────────────────────────────────

function TopUsers({ users, loading }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-xl animate-pulse" />
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
                            <div className="h-2 w-16 bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-12 bg-gray-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }
    if (!users || users.length === 0) {
        return <p className="text-gray-500 text-sm text-center py-6">Ma'lumot yo'q</p>;
    }
    return (
        <div className="space-y-2">
            {users.map((u, i) => {
                const { level } = computeLevel(u.xp || 0);
                return (
                    <div key={u._id || i} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-800/50 transition-colors">
                        <span className="text-xs font-bold text-gray-600 w-4 shrink-0">#{i + 1}</span>
                        <div className="w-8 h-8 rounded-xl bg-green-900/30 border border-green-800/50 flex items-center justify-center text-xs font-extrabold text-green-400 shrink-0">
                            {(u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{u.username}</p>
                            <p className="text-xs text-gray-500">Daraja {level}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Zap size={11} className="text-green-400" />
                            <span className="text-xs font-bold text-green-400">{(u.xp || 0).toLocaleString()}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── User Detail Modal ───────────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onDelete }) {
    const { level, percent } = computeLevel(user.xp || 0);
    const accuracy = user.questionsSolved > 0
        ? Math.round(((user.correctAnswers || 0) / user.questionsSolved) * 100) : 0;
    const active = isActiveThisWeek(user.lastActive);
    const [delConfirm, setDelConfirm] = useState('');
    const [delLoading, setDelLoading] = useState(false);

    async function handleDelete() {
        if (delConfirm !== user.username) return;
        setDelLoading(true);
        try {
            const res = await fetch('/api/admin/users/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id }),
            });
            if (res.ok) { onDelete(user._id); onClose(); }
        } finally { setDelLoading(false); }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-extrabold text-white">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base leading-tight">{user.username}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                    {active ? 'Faol' : 'Nofaol'}
                                </span>
                                <span className="text-xs text-gray-500">Lv {level}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { label: 'Jami XP', value: (user.xp || 0).toLocaleString(), icon: Zap, color: 'text-green-400' },
                            { label: 'Savollar', value: user.questionsSolved || 0, icon: Target, color: 'text-blue-400' },
                            { label: "To'g'ri", value: `${accuracy}%`, icon: CheckCircle, color: 'text-emerald-400' },
                            { label: 'Streak', value: `${user.dayStreak || 0} kun`, icon: Flame, color: 'text-orange-400' },
                        ].map(s => (
                            <div key={s.label} className="bg-gray-800 rounded-xl p-3">
                                <s.icon size={13} className={`${s.color} mb-1.5`} />
                                <p className="text-white font-bold text-sm leading-tight">{s.value}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* XP bar */}
                    <div className="bg-gray-800 rounded-xl p-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span>Level {level} → {level + 1}</span>
                            <span className="text-green-400">{percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                    </div>

                    {/* Info rows */}
                    <div className="bg-gray-800 rounded-xl divide-y divide-gray-700/50">
                        {[
                            { icon: Mail, label: 'Email', value: user.email || '—' },
                            { icon: Calendar, label: "Qo'shilgan", value: formatDate(user.joinedAt) },
                            { icon: Activity, label: "So'nggi faollik", value: getLastActive(user.lastActive) },
                            { icon: XCircle, label: "Noto'g'ri", value: Math.max(0, (user.questionsSolved || 0) - (user.correctAnswers || 0)) },
                        ].map(r => (
                            <div key={r.label} className="flex items-center gap-3 px-3 py-2.5">
                                <r.icon size={13} className="text-gray-500 shrink-0" />
                                <span className="text-xs text-gray-400 w-28 shrink-0">{r.label}</span>
                                <span className="text-xs text-white font-medium">{r.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Delete section */}
                    <div className="border border-red-900/40 rounded-xl p-4 bg-red-950/10">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={13} className="text-red-400" />
                            <p className="text-sm font-semibold text-red-400">Foydalanuvchini o&apos;chirish</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            Tasdiqlash uchun <span className="text-red-400 font-mono font-semibold">{user.username}</span> ni kiriting:
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={delConfirm}
                                onChange={e => setDelConfirm(e.target.value)}
                                placeholder={user.username}
                                autoComplete="off"
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-600 transition-colors"
                            />
                            <button
                                disabled={delConfirm !== user.username || delLoading}
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
                            >
                                {delLoading ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                O&apos;chirish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── User Table Row ───────────────────────────────────────────────────────────

function UserTableRow({ user, rank, isCurrentAdmin, onView }) {
    const { level, percent } = computeLevel(user.xp || 0);
    const accuracy = user.questionsSolved > 0
        ? Math.round(((user.correctAnswers || 0) / user.questionsSolved) * 100)
        : 0;
    const active = isActiveThisWeek(user.lastActive);
    const lastActiveStr = getLastActive(user.lastActive);

    return (
        <tr
            onClick={onView}
            className={`border-b border-gray-800/50 transition-colors cursor-pointer ${isCurrentAdmin ? 'bg-green-900/10' : 'hover:bg-gray-800/50'}`}
        >
            {/* Rank */}
            <td className="py-3 px-4 text-xs font-bold text-gray-500 w-10">{rank}</td>

            {/* User */}
            <td className="py-3 px-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
                        {(user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                        {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                    </div>
                </div>
            </td>

            {/* Level */}
            <td className="py-3 px-2 hidden sm:table-cell">
                <span className="text-xs font-bold bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-lg">
                    Lv {level}
                </span>
            </td>

            {/* XP */}
            <td className="py-3 px-2">
                <div className="flex flex-col gap-1 min-w-[80px]">
                    <div className="flex items-center gap-1">
                        <Zap size={10} className="text-green-400 shrink-0" />
                        <span className="text-xs font-bold text-green-400">{(user.xp || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                </div>
            </td>

            {/* Questions + accuracy */}
            <td className="py-3 px-2 hidden md:table-cell">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{user.questionsSolved || 0}</span>
                    <span className="text-xs text-gray-500">{accuracy}% aniq</span>
                </div>
            </td>

            {/* Streak */}
            <td className="py-3 px-2 hidden lg:table-cell">
                <div className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-xs font-semibold text-white">{user.dayStreak || 0}</span>
                </div>
            </td>

            {/* Last active */}
            <td className="py-3 px-2 hidden lg:table-cell">
                <span className={`text-xs ${active ? 'text-green-400' : 'text-gray-500'}`}>
                    {lastActiveStr}
                </span>
            </td>

            {/* Joined */}
            <td className="py-3 px-2 hidden xl:table-cell">
                <span className="text-xs text-gray-500">{formatDate(user.joinedAt)}</span>
            </td>

            {/* Status + eye */}
            <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                    {active ? (
                        <span className="text-xs font-semibold bg-green-900/30 text-green-400 border border-green-800 px-2 py-0.5 rounded-lg">
                            Faol
                        </span>
                    ) : (
                        <span className="text-xs font-semibold bg-gray-800 text-gray-500 border border-gray-700 px-2 py-0.5 rounded-lg">
                            Nofaol
                        </span>
                    )}
                    <Eye size={13} className="text-gray-600 hover:text-gray-300 transition-colors hidden sm:block" />
                </div>
            </td>
        </tr>
    );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

function SkeletonRows({ count = 10 }) {
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-gray-800/50">
            {[10, 180, 60, 90, 80, 60, 90, 90, 60].map((w, j) => (
                <td key={j} className="py-3 px-2">
                    <div className={`h-4 bg-gray-800 rounded animate-pulse`} style={{ width: w }} />
                </td>
            ))}
        </tr>
    ));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const router = useRouter();

    // auth & stats
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [meUsername, setMeUsername] = useState(null);

    // users
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    // filters
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('xp_desc');
    const [status, setStatus] = useState('all');

    const LIMIT = 15;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Load stats + auth check
    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const [meRes, statsRes] = await Promise.all([
                fetch('/api/auth/me'),
                fetch('/api/admin/stats'),
            ]);
            if (!meRes.ok) { router.push('/login'); return; }
            const meData = await meRes.json();
            if (!meData.user || meData.user.username !== 'ad') {
                router.push('/dashboard');
                return;
            }
            setMeUsername(meData.user.username);
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setStatsLoading(false);
        }
    }, [router]);

    useEffect(() => { loadStats(); }, [loadStats]);

    // Load users
    useEffect(() => {
        setUsersLoading(true);
        fetch(`/api/admin/users?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}&sort=${sort}&status=${status}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setUsers(data.users || []);
                    setTotal(data.total || 0);
                }
            })
            .catch(console.error)
            .finally(() => setUsersLoading(false));
    }, [page, search, sort, status]);

    const handleRefresh = () => {
        loadStats();
        setPage(p => p); // re-trigger users useEffect implicitly via loadStats re-run
    };

    const handleStatusChange = (s) => {
        setStatus(s);
        setPage(1);
    };
    const handleSortChange = (s) => {
        setSort(s);
        setPage(1);
    };
    const handlePage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const clearSearch = () => {
        setSearchInput('');
        setSearch('');
        setPage(1);
    };

    const startRank = (page - 1) * LIMIT + 1;

    // Top 5 users from stats (use users if sorted by xp_desc on page 1)
    // We'll derive top5 from the current user list when sort=xp_desc & page=1,
    // otherwise fetch separately — for simplicity use a dedicated state
    const [top5, setTop5] = useState([]);
    useEffect(() => {
        fetch('/api/admin/users?page=1&limit=5&sort=xp_desc&status=all')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setTop5(data.users || []); })
            .catch(() => {});
    }, [lastUpdated]);

    return (
        <>
        <div className="min-h-screen bg-gray-950 p-4 sm:p-6 space-y-6">

            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-green-900/30 border border-green-800/50 rounded-2xl flex items-center justify-center">
                        <Shield size={20} className="text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">Admin Panel</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Tizim boshqaruvi</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-gray-500 hidden sm:block">
                            <Clock size={11} className="inline mr-1" />
                            {lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={statsLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 hover:text-white hover:border-gray-700 transition-all text-xs font-semibold disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
                        Yangilash
                    </button>
                </div>
            </div>

            {/* ── Overview Stats ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={Users} label="Jami foydalanuvchilar" value={stats?.totalUsers} color="blue" loading={statsLoading} />
                <StatCard icon={Zap} label="Bugun faol" value={stats?.activeToday} color="green" loading={statsLoading} />
                <StatCard icon={TrendingUp} label="Hafta faol" value={stats?.activeThisWeek} color="emerald" loading={statsLoading} />
                <StatCard icon={UserPlus} label="Yangi (hafta)" value={stats?.newThisWeek} color="purple" loading={statsLoading} />
                <StatCard icon={BookOpen} label="Jami savollar" value={stats?.totalQuestions} color="yellow" loading={statsLoading} />
                <StatCard icon={Award} label="Jami XP" value={stats?.totalXp} color="orange" loading={statsLoading} />
            </div>

            {/* ── Charts + Top Users ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Category chart — spans 2 cols */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-green-400" />
                            <h2 className="text-sm font-semibold text-white">Savollar bo'yicha</h2>
                        </div>
                        <span className="text-xs text-gray-500">Top 8 kategoriya</span>
                    </div>

                    <CategoryChart categories={stats?.categoryCounts} loading={statsLoading} />

                    {/* Difficulty badges */}
                    {!statsLoading && stats?.difficultyDist && (
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-800 flex-wrap">
                            <span className="text-xs text-gray-500 mr-1">Qiyinlik:</span>
                            <span className="text-xs font-semibold bg-green-900/30 border border-green-800/50 text-green-400 px-2.5 py-1 rounded-lg">
                                Oson: {stats.difficultyDist.Easy || 0}
                            </span>
                            <span className="text-xs font-semibold bg-yellow-900/30 border border-yellow-800/50 text-yellow-400 px-2.5 py-1 rounded-lg">
                                O'rta: {stats.difficultyDist.Medium || 0}
                            </span>
                            <span className="text-xs font-semibold bg-red-900/30 border border-red-800/50 text-red-400 px-2.5 py-1 rounded-lg">
                                Qiyin: {stats.difficultyDist.Hard || 0}
                            </span>
                        </div>
                    )}
                </div>

                {/* Top 5 users */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-yellow-400" />
                        <h2 className="text-sm font-semibold text-white">Top 5 Foydalanuvchi</h2>
                    </div>
                    <TopUsers users={top5} loading={statsLoading} />
                </div>
            </div>

            {/* ── User Management ─────────────────────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                {/* Section Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                        <Users size={16} className="text-blue-400" />
                        <h2 className="text-sm font-semibold text-white">Foydalanuvchilar</h2>
                        <span className="text-xs bg-blue-900/30 border border-blue-800/50 text-blue-400 px-2 py-0.5 rounded-lg font-bold">
                            {total}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <SlidersHorizontal size={13} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Filtr</span>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="px-5 py-3 border-b border-gray-800 flex flex-wrap gap-3 items-center">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Foydalanuvchi qidirish..."
                            className="w-full pl-8 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition-colors"
                        />
                        {searchInput && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-1">
                        {[
                            { value: 'all', label: 'Barchasi' },
                            { value: 'active', label: 'Faol' },
                            { value: 'inactive', label: 'Nofaol' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleStatusChange(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                    status === opt.value
                                        ? 'bg-green-600 border-green-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={e => handleSortChange(e.target.value)}
                        className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-green-600 transition-colors cursor-pointer"
                    >
                        <option value="xp_desc">XP (Ko'p→Kam)</option>
                        <option value="xp_asc">XP (Kam→Ko'p)</option>
                        <option value="joined_desc">Sana (Yangi)</option>
                        <option value="joined_asc">Sana (Eski)</option>
                        <option value="questions_desc">Savollar</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">#</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Foydalanuvchi</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Daraja</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">XP</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Savollar</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Seriya</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">So'nggi faollik</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Qo'shilgan</th>
                                <th className="py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Holat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <SkeletonRows count={10} />
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={32} className="text-gray-700" />
                                            <p className="text-gray-500 text-sm">Foydalanuvchi topilmadi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, i) => (
                                    <UserTableRow
                                        key={user._id || i}
                                        user={user}
                                        rank={startRank + i}
                                        isCurrentAdmin={user.username === meUsername}
                                        onView={() => setSelectedUser(user)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!usersLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-800 flex-wrap gap-2">
                        <p className="text-xs text-gray-600">
                            <span className="text-gray-400 font-medium">
                                {startRank}–{Math.min(startRank + LIMIT - 1, total)}
                            </span>
                            {' / '}{total} foydalanuvchi
                        </p>
                        <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
                    </div>
                )}
            </div>

        </div>

            {/* User detail modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onDelete={(id) => {
                        setUsers(prev => prev.filter(u => u._id !== id));
                        setTotal(prev => prev - 1);
                    }}
                />
            )}
        </>
    );
}
