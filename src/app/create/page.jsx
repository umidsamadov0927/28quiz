"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    Zap, Clock, Check, Plus, RotateCcw, Eye, AlertCircle,
    CheckCircle2, Sparkles, Terminal, Code, Layers, FileCode,
    Layout, Globe, Database, Shield, Cpu, Box, Library,
    ChevronRight, BookOpen,
} from 'lucide-react';

// ── Predefined programming language libraries ──────────────────
const LIBRARIES = [
    { name: 'Python',        icon: Terminal,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   selBorder: 'border-blue-400',   selBg: 'bg-blue-500/10'   },
    { name: 'JavaScript',    icon: Code,      color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', selBorder: 'border-yellow-400', selBg: 'bg-yellow-500/10' },
    { name: 'TypeScript',    icon: FileCode,  color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    selBorder: 'border-sky-400',    selBg: 'bg-sky-500/10'    },
    { name: 'React',         icon: Layers,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   selBorder: 'border-cyan-400',   selBg: 'bg-cyan-500/10'   },
    { name: 'Next.js',       icon: Zap,       color: 'text-white',      bg: 'bg-gray-500/10',   border: 'border-gray-500/20',   selBorder: 'border-gray-300',   selBg: 'bg-gray-500/10'   },
    { name: 'HTML',          icon: Globe,     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', selBorder: 'border-orange-400', selBg: 'bg-orange-500/10' },
    { name: 'CSS',           icon: Layout,    color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   selBorder: 'border-pink-400',   selBg: 'bg-pink-500/10'   },
    { name: 'SQL',           icon: Database,  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', selBorder: 'border-purple-400', selBg: 'bg-purple-500/10' },
    { name: 'Algorithms',    icon: Cpu,       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  selBorder: 'border-green-400',  selBg: 'bg-green-500/10'  },
    { name: 'Cybersecurity', icon: Shield,    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    selBorder: 'border-red-400',    selBg: 'bg-red-500/10'    },
    { name: 'Docker',        icon: Box,       color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   selBorder: 'border-teal-400',   selBg: 'bg-teal-500/10'   },
];

const DIFFICULTIES = [
    { value: 'Easy',   label: 'Oson',  cls: 'border-green-600 bg-green-900/40 text-green-400',   dot: 'bg-green-400'  },
    { value: 'Medium', label: "O'rta", cls: 'border-yellow-600 bg-yellow-900/40 text-yellow-400', dot: 'bg-yellow-400' },
    { value: 'Hard',   label: 'Qiyin', cls: 'border-red-600 bg-red-900/40 text-red-400',          dot: 'bg-red-400'    },
];

const XP_PRESETS   = [5, 10, 15, 25, 50];
const TIME_PRESETS = [15, 20, 30, 45, 60];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const EMPTY_FORM = {
    difficulty: 'Easy',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    xp: 10,
    time: 30,
};

// ── Library card in the picker ─────────────────────────────────
function LibraryCard({ lib, count, selected, onSelect }) {
    const { icon: Icon } = lib;
    const full    = count >= 31;
    const pct     = Math.min(100, ((count || 0) / 31) * 100);
    const barCls  = full ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <button
            type="button"
            onClick={() => !full && onSelect(lib.name)}
            disabled={full}
            className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 text-left transition-all duration-200
                ${full ? 'opacity-40 cursor-not-allowed border-gray-800 bg-gray-900' :
                  selected
                    ? `${lib.selBorder} ${lib.selBg} shadow-md`
                    : `${lib.border} bg-gray-900 hover:${lib.selBg} hover:${lib.selBorder}`
                }`}
        >
            {/* Selected check */}
            {selected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={9} strokeWidth={3} className="text-white" />
                </span>
            )}

            {/* Icon + name */}
            <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${lib.bg} border ${lib.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${lib.color}`} />
                </div>
                <span className={`text-xs font-bold truncate ${selected ? lib.color : 'text-gray-300'}`}>
                    {lib.name}
                </span>
            </div>

            {/* Progress */}
            <div className="w-full">
                <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                    <span className={selected ? lib.color : ''}>{count || 0}</span>
                    <span>31</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
                </div>
            </div>

            {full && (
                <span className="text-[10px] text-red-400 font-semibold">To&apos;lgan</span>
            )}
        </button>
    );
}

// ── Live Preview ───────────────────────────────────────────────
function Preview({ form, library }) {
    const diff = DIFFICULTIES.find(d => d.value === form.difficulty);
    const lib  = LIBRARIES.find(l => l.name === library);
    const hasContent = form.question.trim() || form.options.some(o => o.trim());

    return (
        <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-3">
                <Eye size={14} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jonli ko&apos;rinish</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* header bar */}
                <div className="bg-gray-800/60 border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        {lib && (
                            <div className={`w-6 h-6 rounded-lg ${lib.bg} border ${lib.border} flex items-center justify-center shrink-0`}>
                                {(() => { const Icon = lib.icon; return <Icon className={`w-3 h-3 ${lib.color}`} />; })()}
                            </div>
                        )}
                        <span className={`text-xs font-semibold truncate ${lib ? lib.color : 'text-gray-500'}`}>
                            {library || 'Library tanlanmagan'}
                        </span>
                        {diff && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border shrink-0 ${diff.cls}`}>
                                {diff.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                            <Zap size={11} /> +{form.xp} XP
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={11} /> {form.time}s
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    <div className="mb-5 min-h-[60px]">
                        <span className="inline-block mb-2 text-xs font-semibold text-green-400 bg-green-900/20 border border-green-900/40 px-2.5 py-1 rounded-lg">
                            Savol
                        </span>
                        <p className="text-white font-semibold leading-relaxed text-sm">
                            {form.question.trim() || (
                                <span className="text-gray-600 italic">Savol matni bu yerda ko&apos;rinadi…</span>
                            )}
                        </p>
                    </div>

                    <div className="space-y-2">
                        {form.options.map((opt, i) => {
                            const isCorrect = i === form.correct;
                            return (
                                <div key={i} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                                    isCorrect ? 'border-green-500 bg-green-900/20' : 'border-gray-800 bg-gray-800/50'
                                }`}>
                                    <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${
                                        isCorrect ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {isCorrect ? <Check size={14} /> : OPTION_LABELS[i]}
                                    </span>
                                    <span className={`text-sm ${opt.trim() ? (isCorrect ? 'text-green-300' : 'text-gray-300') : 'text-gray-600 italic'}`}>
                                        {opt.trim() || `${OPTION_LABELS[i]} variant…`}
                                    </span>
                                    {isCorrect && (
                                        <span className="ml-auto text-xs text-green-400 font-semibold shrink-0">To&apos;g&apos;ri</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!hasContent && (
                        <div className="mt-4 flex items-center gap-2 text-gray-700 text-xs">
                            <Sparkles size={12} />
                            Chap tomondagi formni to&apos;ldiring
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────
export default function CreateQuestionPage() {
    const router = useRouter();
    const [form, setForm]         = useState(EMPTY_FORM);
    const [library, setLibrary]   = useState('');       // selected library name
    const [catStats, setCatStats] = useState({});       // { name: count }
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast]       = useState(null);

    // Admin guard
    useEffect(() => {
        const raw = Cookies.get('session_token');
        if (!raw) { router.push('/login'); return; }
        try {
            const user = JSON.parse(raw);
            if (user.username !== 'ad') router.push('/');
        } catch { router.push('/'); }
    }, [router]);

    // Load question counts per library
    useEffect(() => {
        fetch('/api/quizs')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (!d) return;
                const map = {};
                (d.categories || []).forEach(c => { map[c.category] = c.count; });
                setCatStats(map);
            })
            .catch(() => {});
    }, []);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const setOption = (i, val) => {
        const opts = [...form.options];
        opts[i] = val;
        set('options', opts);
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!library) { showToast('error', 'Library tanlang'); return; }
        if (form.options.some(o => !o.trim())) { showToast('error', "Barcha variantlarni to'ldiring"); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category:      library,
                    difficulty:    form.difficulty,
                    question:      form.question.trim(),
                    options:       form.options,
                    correctAnswer: form.correct,
                    xpReward:      form.xp,
                    time:          form.time,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('success', 'Savol muvaffaqiyatli yaratildi!');
                // reset form but keep library, difficulty, xp, time
                setForm(f => ({ ...EMPTY_FORM, difficulty: f.difficulty, xp: f.xp, time: f.time }));
                setCatStats(prev => ({ ...prev, [library]: (prev[library] || 0) + 1 }));
            } else {
                showToast('error', data.message || 'Xato yuz berdi');
            }
        } catch {
            showToast('error', 'Internet xatosi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => { setLibrary(''); setForm(EMPTY_FORM); };

    const selectedLib  = LIBRARIES.find(l => l.name === library);
    const selectedCount = catStats[library] || 0;

    return (
        <div className="min-h-screen bg-gray-950 p-4 sm:p-6">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl
                    ${toast.type === 'success'
                        ? 'bg-green-900/90 border-green-700 text-green-300'
                        : 'bg-red-900/90 border-red-700 text-red-300'
                    }`}
                    style={{ backdropFilter: 'blur(12px)' }}
                >
                    {toast.type === 'success'
                        ? <CheckCircle2 size={16} className="shrink-0" />
                        : <AlertCircle size={16} className="shrink-0" />
                    }
                    <span className="text-sm font-semibold">{toast.msg}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-900/30 border border-green-800/50 flex items-center justify-center">
                        <Plus size={16} className="text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Savol Yaratish</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Library tanlang va savol qo&apos;shing</p>
                    </div>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all"
                >
                    <RotateCcw size={13} />
                    Tozalash
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {/* ── Form ────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-5">

                    {/* ── Library Picker ── */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Library size={15} className="text-gray-400" />
                            <p className="text-sm font-semibold text-white">Library tanlang</p>
                            {library && (
                                <span className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl ${selectedLib?.bg} ${selectedLib?.color} border ${selectedLib?.border}`}>
                                    {(() => { const I = selectedLib?.icon; return I ? <I size={10} /> : null; })()}
                                    {library}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {LIBRARIES.map(lib => (
                                <LibraryCard
                                    key={lib.name}
                                    lib={lib}
                                    count={catStats[lib.name] || 0}
                                    selected={library === lib.name}
                                    onSelect={setLibrary}
                                />
                            ))}
                        </div>

                        {/* selected library info bar */}
                        {library && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/60 rounded-xl">
                                <div className={`w-8 h-8 rounded-xl ${selectedLib?.bg} border ${selectedLib?.border} flex items-center justify-center shrink-0`}>
                                    {(() => { const I = selectedLib?.icon; return I ? <I className={`w-4 h-4 ${selectedLib?.color}`} /> : null; })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${selectedLib?.color}`}>{library}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${selectedCount >= 31 ? 'bg-red-500' : selectedCount >= 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(100, (selectedCount / 31) * 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-semibold shrink-0 ${selectedCount >= 31 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {selectedCount} / 31 savol
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-600 shrink-0" />
                            </div>
                        )}

                        {!library && (
                            <div className="mt-3 flex items-center gap-2 text-gray-600 text-xs">
                                <BookOpen size={12} />
                                Savol qo&apos;shish uchun library tanlang
                            </div>
                        )}
                    </div>

                    {/* ── Difficulty ── */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                            Qiyinlik darajasi
                        </label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => set('difficulty', d.value)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                                        form.difficulty === d.value
                                            ? d.cls
                                            : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${form.difficulty === d.value ? d.dot : 'bg-gray-600'}`} />
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Question ── */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Savol matni</label>
                            <span className="text-xs text-gray-600">{form.question.length} belgi</span>
                        </div>
                        <textarea
                            value={form.question}
                            onChange={e => set('question', e.target.value)}
                            placeholder="Savolni kiriting…"
                            rows={4}
                            required
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-600 transition-colors resize-none"
                        />
                    </div>

                    {/* ── Options ── */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Javob variantlari</label>
                            <span className="text-xs text-gray-600">To&apos;g&apos;ri javobni bosing</span>
                        </div>
                        <div className="space-y-2.5">
                            {form.options.map((opt, i) => {
                                const isCorrect = form.correct === i;
                                return (
                                    <div key={i} className="flex gap-3 items-center">
                                        <button
                                            type="button"
                                            onClick={() => set('correct', i)}
                                            className={`w-9 h-9 shrink-0 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${
                                                isCorrect
                                                    ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-900/40'
                                                    : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            {isCorrect ? <Check size={15} /> : OPTION_LABELS[i]}
                                        </button>
                                        <input
                                            value={opt}
                                            onChange={e => setOption(i, e.target.value)}
                                            placeholder={`${OPTION_LABELS[i]} variant…`}
                                            required
                                            className={`flex-1 bg-gray-800 border text-white text-sm placeholder-gray-600 rounded-xl px-4 py-2.5 focus:outline-none transition-colors ${
                                                isCorrect
                                                    ? 'border-green-600/60 focus:border-green-500'
                                                    : 'border-gray-700 focus:border-gray-500'
                                            }`}
                                        />
                                        {isCorrect && (
                                            <span className="text-xs text-green-400 font-semibold shrink-0">✓ To&apos;g&apos;ri</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── XP + Time ── */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <p className="text-sm font-semibold text-white mb-4">Qo&apos;shimcha sozlamalar</p>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">XP mukofot</label>
                                <div className="relative mb-2">
                                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                                    <input
                                        type="number" min={0} max={100}
                                        value={form.xp}
                                        onChange={e => set('xp', Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-green-600 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {XP_PRESETS.map(v => (
                                        <button key={v} type="button" onClick={() => set('xp', v)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                form.xp === v
                                                    ? 'bg-green-900/50 border-green-700 text-green-400'
                                                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                            }`}>
                                            +{v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Vaqt (soniya)</label>
                                <div className="relative mb-2">
                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                                    <input
                                        type="number" min={5} max={300}
                                        value={form.time}
                                        onChange={e => set('time', Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {TIME_PRESETS.map(v => (
                                        <button key={v} type="button" onClick={() => set('time', v)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                form.time === v
                                                    ? 'bg-blue-900/50 border-blue-700 text-blue-400'
                                                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                            }`}>
                                            {v}s
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        disabled={submitting || !library || selectedCount >= 31}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 active:scale-[0.98]"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saqlanmoqda…
                            </>
                        ) : !library ? (
                            <>
                                <Library size={16} />
                                Library tanlang
                            </>
                        ) : (
                            <>
                                <Plus size={16} />
                                {library} ga savol qo&apos;shish
                            </>
                        )}
                    </button>

                </form>

                {/* ── Live Preview ─────────────────────────────── */}
                <div className="xl:col-span-2">
                    <Preview form={form} library={library} />
                </div>
            </div>
        </div>
    );
}
