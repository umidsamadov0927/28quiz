"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    Zap, Clock, Check, ChevronDown, Plus, RotateCcw,
    Eye, BookOpen, AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react';

const DIFFICULTIES = [
    { value: 'Easy',   label: 'Oson',  cls: 'border-green-600 bg-green-900/40 text-green-400',  dot: 'bg-green-400'  },
    { value: 'Medium', label: "O'rta", cls: 'border-yellow-600 bg-yellow-900/40 text-yellow-400', dot: 'bg-yellow-400' },
    { value: 'Hard',   label: 'Qiyin', cls: 'border-red-600 bg-red-900/40 text-red-400',          dot: 'bg-red-400'    },
];

const XP_PRESETS = [5, 10, 15, 25, 50];
const TIME_PRESETS = [15, 20, 30, 45, 60];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const EMPTY_FORM = {
    category: '',
    difficulty: 'Easy',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    xp: 10,
    time: 30,
};

// ── Live Preview ──────────────────────────────────────────────
function Preview({ form }) {
    const diff = DIFFICULTIES.find(d => d.value === form.difficulty);
    const hasContent = form.question.trim() || form.options.some(o => o.trim());

    return (
        <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-3">
                <Eye size={14} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jonli ko'rinish</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Quiz header bar */}
                <div className="bg-gray-800/60 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">
                            {form.category || 'Kategoriya'}
                        </span>
                        {diff && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${diff.cls}`}>
                                {diff.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {form.xp > 0 && (
                            <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                                <Zap size={11} /> +{form.xp} XP
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={11} /> {form.time}s
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    {/* Question */}
                    <div className="mb-5 min-h-[60px]">
                        <span className="inline-block mb-2 text-xs font-semibold text-green-400 bg-green-900/20 border border-green-900/40 px-2.5 py-1 rounded-lg">
                            Savol
                        </span>
                        <p className="text-white font-semibold leading-relaxed text-sm">
                            {form.question.trim() || <span className="text-gray-600 italic">Savol matni bu yerda ko'rinadi…</span>}
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        {form.options.map((opt, i) => {
                            const isCorrect = i === form.correct;
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                                        isCorrect
                                            ? 'border-green-500 bg-green-900/20'
                                            : 'border-gray-800 bg-gray-800/50'
                                    }`}
                                >
                                    <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${
                                        isCorrect ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {isCorrect ? <Check size={14} /> : OPTION_LABELS[i]}
                                    </span>
                                    <span className={`text-sm ${opt.trim() ? (isCorrect ? 'text-green-300' : 'text-gray-300') : 'text-gray-600 italic'}`}>
                                        {opt.trim() || `${OPTION_LABELS[i]} variant…`}
                                    </span>
                                    {isCorrect && (
                                        <span className="ml-auto text-xs text-green-400 font-semibold shrink-0">To'g'ri</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!hasContent && (
                        <div className="mt-4 flex items-center gap-2 text-gray-700 text-xs">
                            <Sparkles size={12} />
                            Chap tomondagi formni to'ldiring
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CreateQuestionPage() {
    const router = useRouter();
    const [form, setForm] = useState(EMPTY_FORM);
    const [categories, setCategories] = useState([]);
    const [catOpen, setCatOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
    const [count, setCount] = useState(null); // existing question count for category

    // Admin guard
    useEffect(() => {
        const raw = Cookies.get('session_token');
        if (!raw) { router.push('/login'); return; }
        try {
            const user = JSON.parse(raw);
            if (user.username !== 'ad') router.push('/');
        } catch { router.push('/'); }
    }, [router]);

    // Load existing categories
    useEffect(() => {
        fetch('/api/quizs')
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setCategories(d.categories || []); })
            .catch(() => {});
    }, []);

    // Fetch count when category changes
    useEffect(() => {
        if (!form.category.trim()) { setCount(null); return; }
        const found = categories.find(c => c.category.toLowerCase() === form.category.trim().toLowerCase());
        setCount(found ? found.count : 0);
    }, [form.category, categories]);

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
        if (form.options.some(o => !o.trim())) {
            showToast('error', 'Barcha variantlarni to\'ldiring');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: form.category.trim(),
                    difficulty: form.difficulty,
                    question: form.question.trim(),
                    options: form.options,
                    correctAnswer: form.correct,
                    xpReward: form.xp,
                    time: form.time,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('success', 'Savol muvaffaqiyatli yaratildi!');
                setForm(f => ({ ...EMPTY_FORM, category: f.category, difficulty: f.difficulty, xp: f.xp, time: f.time }));
                // refresh category count
                const c = categories.find(c => c.category.toLowerCase() === form.category.trim().toLowerCase());
                if (c) setCategories(cats => cats.map(cat => cat.category === c.category ? { ...cat, count: cat.count + 1 } : cat));
            } else {
                showToast('error', data.message || 'Xato yuz berdi');
            }
        } catch {
            showToast('error', 'Internet xatosi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => setForm(EMPTY_FORM);

    const filteredCats = categories.filter(c =>
        form.category.trim() && c.category.toLowerCase().includes(form.category.trim().toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-950 p-6">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl
                    transition-all duration-300
                    ${toast.type === 'success'
                        ? 'bg-green-900/90 border-green-700 text-green-300'
                        : 'bg-red-900/90 border-red-700 text-red-300'
                    }`}
                    style={{ backdropFilter: 'blur(12px)' }}
                >
                    {toast.type === 'success'
                        ? <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                        : <AlertCircle size={18} className="text-red-400 shrink-0" />
                    }
                    <span className="text-sm font-semibold">{toast.msg}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Savol Yaratish</h1>
                    <p className="text-gray-400 text-sm mt-1">Yangi quiz savoli qo'shing</p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                >
                    <RotateCcw size={14} />
                    Tozalash
                </button>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {/* ── Form (3/5) ──────────────────────────────── */}
                <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-5">

                    {/* Category + Difficulty */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                        <p className="text-white font-semibold text-sm">Asosiy ma'lumotlar</p>

                        {/* Category */}
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                                Kategoriya
                            </label>
                            <div className="relative">
                                <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={form.category}
                                    onChange={e => { set('category', e.target.value); setCatOpen(true); }}
                                    onBlur={() => setTimeout(() => setCatOpen(false), 150)}
                                    onFocus={() => setCatOpen(true)}
                                    placeholder="Masalan: Python, JavaScript…"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-green-600 transition-colors"
                                />
                            </div>

                            {/* Suggestions dropdown */}
                            {catOpen && filteredCats.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-20 shadow-2xl">
                                    {filteredCats.slice(0, 6).map(c => (
                                        <button
                                            key={c.category}
                                            type="button"
                                            onMouseDown={() => { set('category', c.category); setCatOpen(false); }}
                                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="text-sm text-white">{c.category}</span>
                                            <span className="text-xs text-gray-500">{c.count} / 31 savol</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Category info */}
                            {count !== null && form.category.trim() && (
                                <div className={`mt-2 flex items-center gap-1.5 text-xs ${count >= 31 ? 'text-red-400' : count >= 20 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${count >= 31 ? 'bg-red-500' : count >= 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(100, (count / 31) * 100)}%` }}
                                        />
                                    </div>
                                    <span>{count} / 31 savol</span>
                                    {count >= 31 && <span className="font-semibold">— To'lgan!</span>}
                                </div>
                            )}
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
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
                    </div>

                    {/* Question */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Savol matni
                            </label>
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

                    {/* Options */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Javob variantlari
                            </label>
                            <span className="text-xs text-gray-600">To'g'ri javobni bosing</span>
                        </div>

                        <div className="space-y-2.5">
                            {form.options.map((opt, i) => {
                                const isCorrect = form.correct === i;
                                return (
                                    <div key={i} className="flex gap-3 items-center">
                                        {/* Correct toggle */}
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

                                        {/* Input */}
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
                                            <span className="text-xs text-green-400 font-semibold shrink-0">✓ To'g'ri</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* XP + Time */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <p className="text-white font-semibold text-sm mb-4">Qo'shimcha sozlamalar</p>

                        <div className="grid grid-cols-2 gap-5">
                            {/* XP */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                                    XP mukofot
                                </label>
                                <div className="relative mb-2">
                                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={form.xp}
                                        onChange={e => set('xp', Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-green-600 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {XP_PRESETS.map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => set('xp', v)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                form.xp === v
                                                    ? 'bg-green-900/50 border-green-700 text-green-400'
                                                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                            }`}
                                        >
                                            +{v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Vaqt (soniya)
                                </label>
                                <div className="relative mb-2">
                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                                    <input
                                        type="number"
                                        min={5}
                                        max={300}
                                        value={form.time}
                                        onChange={e => set('time', Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-600 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {TIME_PRESETS.map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => set('time', v)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                form.time === v
                                                    ? 'bg-blue-900/50 border-blue-700 text-blue-400'
                                                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                            }`}
                                        >
                                            {v}s
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || count >= 31}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 active:scale-[0.98]"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saqlanmoqda…
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Savol Yaratish
                            </>
                        )}
                    </button>
                </form>

                {/* ── Live Preview (2/5) ──────────────────────── */}
                <div className="xl:col-span-2">
                    <Preview form={form} />
                </div>
            </div>
        </div>
    );
}
