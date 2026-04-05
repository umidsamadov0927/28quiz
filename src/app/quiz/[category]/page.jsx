"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Check, ChevronRight, X, Zap, ArrowLeft, Trophy, Clock,
    BookOpen, Code, Globe, Cpu, Database, Layout, Shield,
    Terminal, FileCode, Layers, Box, Search, Play,
    Target, Flame, Library, Pencil, Trash2, Save, Loader2,
    ShieldCheck, Eye, EyeOff,
} from 'lucide-react';
import ResultsSummary from '@/components/ResultsSummary';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const DIFFICULTIES  = ['Easy', 'Medium', 'Hard'];
const DIFF_LABELS   = { Easy: 'Oson', Medium: "O'rta", Hard: 'Qiyin' };

// ── helpers ──────────────────────────────────────────────────────────────────

function getCategoryStyle(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('python'))                           return { icon: Terminal,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   };
    if (n.includes('javascript') || n.includes('js'))  return { icon: Code,      color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    if (n.includes('react'))                            return { icon: Layers,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30'   };
    if (n.includes('css'))                              return { icon: Layout,    color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30'   };
    if (n.includes('html'))                             return { icon: Globe,     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    if (n.includes('sql') || n.includes('database'))   return { icon: Database,  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    if (n.includes('typescript') || n.includes('ts'))  return { icon: FileCode,  color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/30'    };
    if (n.includes('next'))                             return { icon: Zap,       color: 'text-white',      bg: 'bg-gray-500/10',   border: 'border-gray-500/30'   };
    if (n.includes('security') || n.includes('cyber')) return { icon: Shield,    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    };
    if (n.includes('algorithm'))                        return { icon: Cpu,       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30'  };
    if (n.includes('docker') || n.includes('devops'))  return { icon: Box,       color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30'   };
    return                                               { icon: BookOpen,   color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30'  };
}

const DIFF_CONFIG = {
    Easy:   { label: 'Oson',  cls: 'bg-green-500/10 text-green-400 border border-green-500/30',   dot: 'bg-green-400'   },
    Medium: { label: "O'rta", cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30', dot: 'bg-yellow-400' },
    Hard:   { label: 'Qiyin', cls: 'bg-red-500/10 text-red-400 border border-red-500/30',          dot: 'bg-red-400'    },
};

// ── Edit Modal (admin only) ───────────────────────────────────────────────────

function EditModal({ q, onSave, onClose }) {
    const [question,      setQuestion]      = useState(q.question);
    const [options,       setOptions]       = useState([...q.options]);
    const [correctAnswer, setCorrectAnswer] = useState(q.correctAnswer);
    const [difficulty,    setDifficulty]    = useState(q.difficulty);
    const [xpReward,      setXpReward]      = useState(q.xpReward);
    const [time,          setTime]          = useState(q.time);
    const [saving,        setSaving]        = useState(false);
    const [err,           setErr]           = useState('');

    const setOpt = (i, val) => {
        const o = [...options]; o[i] = val; setOptions(o);
    };

    const handleSave = async () => {
        if (!question.trim() || options.some(o => !o.trim())) {
            setErr("Barcha maydonlarni to'ldiring"); return;
        }
        setSaving(true); setErr('');
        try {
            const res = await fetch(`/api/questions/${q._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question.trim(), options, correctAnswer, difficulty, xpReward, time }),
            });
            const data = await res.json();
            if (!res.ok) { setErr(data.message || 'Xato'); return; }
            onSave(data.question);
        } catch { setErr('Server xatosi'); }
        finally { setSaving(false); }
    };

    const diffCls = { Easy: 'border-green-600 bg-green-900/40 text-green-400', Medium: 'border-yellow-600 bg-yellow-900/40 text-yellow-400', Hard: 'border-red-600 bg-red-900/40 text-red-400' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <Pencil size={15} className="text-green-400" />
                        <h2 className="text-base font-bold text-white">Savolni tahrirlash</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Question text */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Savol matni</label>
                        <textarea
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-green-600 resize-none transition-colors"
                        />
                    </div>

                    {/* Options */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Variantlar — to&apos;g&apos;risini tanlang</label>
                        <div className="space-y-2">
                            {options.map((opt, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <button
                                        type="button"
                                        onClick={() => setCorrectAnswer(i)}
                                        className={`w-8 h-8 shrink-0 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                            correctAnswer === i
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-500'
                                        }`}
                                    >
                                        {correctAnswer === i ? <Check size={13} /> : OPTION_LABELS[i]}
                                    </button>
                                    <input
                                        value={opt}
                                        onChange={e => setOpt(i, e.target.value)}
                                        className={`flex-1 bg-gray-800 border text-white text-sm rounded-xl px-3 py-2 focus:outline-none transition-colors ${
                                            correctAnswer === i ? 'border-green-600/60 focus:border-green-500' : 'border-gray-700 focus:border-gray-500'
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty + XP + Time */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Daraja</label>
                            <div className="flex flex-col gap-1">
                                {DIFFICULTIES.map(d => (
                                    <button key={d} type="button" onClick={() => setDifficulty(d)}
                                        className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${difficulty === d ? diffCls[d] : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600'}`}>
                                        {DIFF_LABELS[d]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">XP</label>
                            <input type="number" min={0} max={100} value={xpReward} onChange={e => setXpReward(+e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-green-600 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Vaqt (s)</label>
                            <input type="number" min={5} max={300} value={time} onChange={e => setTime(+e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 transition-colors" />
                        </div>
                    </div>

                    {err && <p className="text-xs text-red-400 flex items-center gap-1"><X size={11} />{err}</p>}
                </div>

                <div className="px-5 py-4 border-t border-gray-800 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                        Bekor qilish
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Saqlash
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Question card (library view) ─────────────────────────────────────────────

function QuestionCard({ q, index, isAdmin, onEdit, onDelete }) {
    const diff    = DIFF_CONFIG[q.difficulty] || DIFF_CONFIG.Easy;
    const preview = q.question.length > 90 ? q.question.slice(0, 90) + '…' : q.question;
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Bu savolni o\'chirishni tasdiqlaysizmi?')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/questions/${q._id}`, { method: 'DELETE' });
            if (res.ok) onDelete(q._id);
        } catch { /* ignore */ }
        finally { setDeleting(false); }
    };

    return (
        <div className={`border rounded-xl p-3.5 transition-all duration-200 ${
            isAdmin ? 'bg-gray-800/80 border-gray-600/60' : 'bg-gray-800/60 border-gray-700/60'
        }`}>
            <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-gray-600 mt-0.5 shrink-0 w-5">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-relaxed">
                        {isAdmin ? q.question : preview}
                    </p>

                    {/* Admin: show all options with correct answer highlighted */}
                    {isAdmin && q.options?.length > 0 && (
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.options.map((opt, i) => (
                                <div key={i} className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                                    i === q.correctAnswer
                                        ? 'bg-green-900/40 text-green-300 border border-green-700/60 font-semibold'
                                        : 'bg-gray-700/50 text-gray-400 border border-gray-700/30'
                                }`}>
                                    <span className={`shrink-0 font-bold ${i === q.correctAnswer ? 'text-green-400' : 'text-gray-500'}`}>
                                        {OPTION_LABELS[i]}.
                                    </span>
                                    {opt}
                                    {i === q.correctAnswer && <Check size={10} className="ml-auto shrink-0 text-green-400" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2.5 ml-7 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 ${diff.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />{diff.label}
                </span>
                {q.xpReward > 0 && (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                        <Zap size={10} /> +{q.xpReward} XP
                    </span>
                )}
                {q.time > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={10} /> {q.time}s
                    </span>
                )}

                {/* Admin buttons */}
                {isAdmin && (
                    <div className="ml-auto flex items-center gap-1.5">
                        <button
                            onClick={() => onEdit(q)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/30 border border-blue-800/50 text-blue-400 hover:bg-blue-900/60 text-xs font-semibold transition-colors"
                        >
                            <Pencil size={11} /> Tahrir
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-900/30 border border-red-800/50 text-red-400 hover:bg-red-900/60 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                            {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                            O&apos;chirish
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function QuizCategoryPage() {
    const routeParams = useParams();
    const category = decodeURIComponent(routeParams?.category || '');
    const router = useRouter();

    // mode: 'library' | 'quiz' | 'results'
    const [mode, setMode] = useState('library');

    // admin
    const [isAdmin,    setIsAdmin]    = useState(false);
    const [editingQ,   setEditingQ]   = useState(null); // question being edited

    // library state
    const [allQuestions, setAllQuestions] = useState([]);
    const [libLoading, setLibLoading]   = useState(true);
    const [search, setSearch]           = useState('');
    const [diffFilter, setDiffFilter]   = useState('All');

    // quiz state
    const [questions, setQuestions] = useState([]);
    const [index, setIndex]         = useState(0);
    const [selected, setSelected]   = useState(null);
    const [answered, setAnswered]   = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const countsRef = useRef({ correct: 0, incorrect: 0, unanswered: 0 });
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    // check admin
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.user?.username === 'username') setIsAdmin(true); })
            .catch(() => {});
    }, []);

    // fetch all questions for library view
    useEffect(() => {
        if (!category) return;
        setLibLoading(true);
        fetch(`/api/quizs/${encodeURIComponent(category)}?all=1`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setAllQuestions(d.questions || []); })
            .catch(console.error)
            .finally(() => setLibLoading(false));
    }, [category]);

    // filtered questions for library
    const filteredQuestions = useMemo(() => {
        let list = [...allQuestions];
        if (diffFilter !== 'All') list = list.filter(q => q.difficulty === diffFilter);
        if (search.trim()) list = list.filter(q => q.question.toLowerCase().includes(search.trim().toLowerCase()));
        return list;
    }, [allQuestions, diffFilter, search]);

    // admin handlers
    function handleSaveEdit(updated) {
        setAllQuestions(qs => qs.map(q => q._id === updated._id ? updated : q));
        setEditingQ(null);
    }
    function handleDelete(id) {
        setAllQuestions(qs => qs.filter(q => q._id !== id));
    }

    // start quiz
    async function startQuiz() {
        setQuizLoading(true);
        try {
            const res = await fetch(`/api/quizs/${encodeURIComponent(category)}`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data.questions || []);
            }
        } catch (e) { console.error(e); }
        countsRef.current = { correct: 0, incorrect: 0, unanswered: 0 };
        setIndex(0);
        setSelected(null);
        setAnswered(false);
        setShowResults(false);
        setMode('quiz');
        setQuizLoading(false);
    }

    // ── quiz logic ────────────────────────────────────────────
    const current    = questions[index];
    const total      = questions.length;
    const isLastQ    = index === total - 1;
    const progress   = total ? ((index + 1) / total) * 100 : 0;

    const handleNext = async () => {
        if (!current) return;
        if (selected === null) {
            countsRef.current.unanswered += 1;
            if (index + 1 < total) { setIndex(index + 1); }
            else { setMode('results'); }
            return;
        }
        setAnswered(true);
        const correct = selected === current.correctAnswer;
        const xpReward = correct ? (current.xpReward || 0) : 0;
        if (correct) countsRef.current.correct += 1;
        else countsRef.current.incorrect += 1;

        try {
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xpReward, correct }),
            });
        } catch (e) { console.error(e); }

        setTimeout(() => {
            setSelected(null);
            setAnswered(false);
            if (index + 1 < total) { setIndex(index + 1); }
            else { setMode('results'); }
        }, 500);
    };

    const handleRetry = async () => {
        await startQuiz();
    };

    // timer
    useEffect(() => {
        if (mode !== 'quiz' || !current || answered) return;
        const seconds = current.time || 30;
        setTimeLeft(seconds);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); handleNext(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [index, questions, mode]);

    useEffect(() => {
        if (answered) clearInterval(timerRef.current);
    }, [answered]);

    // ── stats ─────────────────────────────────────────────────
    const dc = useMemo(() => {
        const counts = { Easy: 0, Medium: 0, Hard: 0 };
        allQuestions.forEach(q => { if (q.difficulty in counts) counts[q.difficulty]++; });
        return counts;
    }, [allQuestions]);

    const totalXp = allQuestions.reduce((s, q) => s + (q.xpReward || 0), 0);
    const { icon: Icon, color, bg, border } = getCategoryStyle(category);

    // ── RESULTS ───────────────────────────────────────────────
    if (mode === 'results') {
        return (
            <ResultsSummary
                totalQuestions={total}
                correctAnswers={countsRef.current.correct}
                incorrectAnswers={countsRef.current.incorrect}
                unanswered={countsRef.current.unanswered}
                category={category}
                onRetry={handleRetry}
                onHome={() => { setMode('library'); router.push('/quiz'); }}
            />
        );
    }

    // ── QUIZ MODE ─────────────────────────────────────────────
    if (mode === 'quiz') {
        if (!total) return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 gap-3">
                <p className="text-gray-400">Bu kutubxonada savollar yo'q.</p>
                <button onClick={() => setMode('library')} className="text-green-400 text-sm hover:underline">Orqaga</button>
            </div>
        );

        const diff = DIFF_CONFIG[current.difficulty] || DIFF_CONFIG.Easy;

        return (
            <div className="min-h-screen bg-gray-950 flex flex-col">
                {/* Top bar */}
                <div className="bg-gray-900 border-b border-gray-800 px-3 sm:px-6 py-3">
                    <div className="mx-auto max-w-2xl">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMode('library')}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors shrink-0"
                                >
                                    <ArrowLeft size={15} />
                                </button>
                                <div className="min-w-0">
                                    <p className="text-white font-semibold text-sm leading-tight truncate max-w-[120px] sm:max-w-none">{category}</p>
                                    <p className="text-gray-500 text-xs">{total} ta savol</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {current.xpReward > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded-lg border border-green-900/40">
                                        <Zap size={10} /> +{current.xpReward} XP
                                    </span>
                                )}
                                {timeLeft !== null && (
                                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border transition-colors
                                        ${timeLeft <= Math.floor((current.time || 30) * 0.25)
                                            ? 'bg-red-900/40 border-red-700 text-red-400 animate-pulse'
                                            : timeLeft <= Math.floor((current.time || 30) * 0.5)
                                            ? 'bg-yellow-900/40 border-yellow-700 text-yellow-400'
                                            : 'bg-gray-800 border-gray-700 text-gray-300'
                                        }`}>
                                        <Clock size={10} /> {timeLeft}s
                                    </div>
                                )}
                                <span className="text-gray-400 text-sm font-medium shrink-0">
                                    <span className="text-white font-bold">{index + 1}</span>/{total}
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Question body */}
                <div className="px-3 sm:px-6 py-4 sm:py-8 flex-1">
                    <div className="mx-auto w-full max-w-2xl">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">Savol {index + 1}</span>
                                {current.difficulty && (
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${diff.cls}`}>{diff.label}</span>
                                )}
                            </div>
                            <h2 className="text-white text-base sm:text-xl font-semibold leading-relaxed">{current.question}</h2>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {current.options.map((opt, i) => {
                                const isSelected   = selected === i;
                                const isCorrectOpt = answered && i === current.correctAnswer;
                                const isWrong      = answered && isSelected && !isCorrectOpt;

                                let container = 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/80 cursor-pointer';
                                if (isCorrectOpt) container = 'border-green-500 bg-green-900/20 cursor-default';
                                else if (isWrong) container = 'border-red-500 bg-red-900/20 cursor-default';
                                else if (isSelected) container = 'border-green-500/60 bg-green-900/10 cursor-pointer';

                                let badge = 'bg-gray-800 text-gray-400';
                                if (isCorrectOpt) badge = 'bg-green-500 text-white';
                                else if (isWrong) badge = 'bg-red-500 text-white';
                                else if (isSelected) badge = 'bg-green-600 text-white';

                                let textCls = 'text-gray-200';
                                if (isCorrectOpt) textCls = 'text-green-300';
                                else if (isWrong) textCls = 'text-red-300';
                                else if (isSelected) textCls = 'text-white';

                                const icon = isCorrectOpt ? <Check className="w-4 h-4" />
                                    : isWrong ? <X className="w-4 h-4" />
                                    : isSelected ? <Check className="w-4 h-4" />
                                    : <span className="text-sm font-bold">{String.fromCharCode(65 + i)}</span>;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => !answered && setSelected(i)}
                                        disabled={answered}
                                        className={`group flex items-center gap-3 rounded-xl border-2 px-3 sm:px-5 py-3 sm:py-4 text-left transition-all duration-200 ${container}`}
                                    >
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${badge}`}>{icon}</span>
                                        <span className={`font-medium text-sm sm:text-base leading-relaxed transition-colors duration-200 ${textCls}`}>{opt}</span>
                                        {isCorrectOpt && <span className="ml-auto text-xs font-semibold text-green-400 shrink-0">To&apos;g&apos;ri!</span>}
                                        {isWrong && <span className="ml-auto text-xs font-semibold text-red-400 shrink-0">Noto&apos;g&apos;ri</span>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="hidden sm:flex items-center gap-1">
                                {Array.from({ length: Math.min(total, 10) }, (_, i) => (
                                    <div key={i} className={`rounded-full transition-all duration-300 ${
                                        i < index ? 'w-2 h-2 bg-green-500'
                                        : i === index ? 'w-3 h-3 bg-green-400 ring-2 ring-green-400/30'
                                        : 'w-2 h-2 bg-gray-700'
                                    }`} />
                                ))}
                                {total > 10 && <span className="text-gray-600 text-xs ml-1">+{total - 10}</span>}
                            </div>
                            <button
                                onClick={handleNext}
                                className={`ml-auto flex items-center gap-2 rounded-xl px-5 sm:px-7 py-3 sm:py-3.5 font-semibold text-white text-sm sm:text-base
                                    transition-all duration-200 hover:scale-[1.02]
                                    ${isLastQ
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-lg shadow-green-900/30'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                            >
                                {isLastQ ? <><Trophy className="w-4 h-4" /> Yakunlash</> : <><span>Keyingi</span><ChevronRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── LIBRARY MODE ──────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950">
            {editingQ && (
                <EditModal
                    q={editingQ}
                    onSave={handleSaveEdit}
                    onClose={() => setEditingQ(null)}
                />
            )}

            {/* Library header */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.push('/quiz')}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors shrink-0"
                    >
                        <ArrowLeft size={15} />
                    </button>
                    <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-xl font-extrabold text-white truncate">{category}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${bg} ${color} border ${border} hidden sm:inline-flex items-center gap-1`}>
                                <Library size={9} /> Library
                            </span>
                            {isAdmin && (
                                <span className="text-xs px-2 py-0.5 rounded-lg font-semibold bg-yellow-900/40 text-yellow-400 border border-yellow-700/50 inline-flex items-center gap-1">
                                    <ShieldCheck size={9} /> Admin
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{allQuestions.length} ta savol</p>
                    </div>

                    {/* Start quiz button */}
                    <button
                        onClick={startQuiz}
                        disabled={quizLoading || allQuestions.length === 0}
                        className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all hover:scale-[1.02] shrink-0"
                    >
                        {quizLoading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Play size={14} className="fill-white" />
                        }
                        Quiz Boshlash
                    </button>
                </div>

                {/* Stats strip */}
                {!libLoading && (
                    <div className="flex gap-4 flex-wrap">
                        {[
                            { icon: Target,  label: 'Savollar', value: allQuestions.length, color: 'text-blue-400'   },
                            { icon: Zap,     label: 'Jami XP',  value: `+${totalXp}`,       color: 'text-green-400' },
                            { icon: Flame,   label: 'Oson',     value: dc.Easy,              color: 'text-green-400' },
                            { icon: Flame,   label: "O'rta",    value: dc.Medium,            color: 'text-yellow-400'},
                            { icon: Flame,   label: 'Qiyin',    value: dc.Hard,              color: 'text-red-400'   },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-1.5">
                                <s.icon size={12} className={s.color} />
                                <span className="text-white text-xs font-semibold">{s.value}</span>
                                <span className="text-gray-500 text-xs">{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter bar */}
            <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800/60 px-4 sm:px-6 py-2.5">
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Savol qidirish…"
                            className="w-full bg-gray-900 border border-gray-800 text-white text-sm placeholder-gray-600 rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:border-green-600 transition-colors"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {['All', 'Easy', 'Medium', 'Hard'].map(v => (
                            <button
                                key={v}
                                onClick={() => setDiffFilter(v)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                                    diffFilter === v
                                        ? v === 'Easy' ? 'bg-green-900/60 border-green-700 text-green-400'
                                        : v === 'Medium' ? 'bg-yellow-900/60 border-yellow-700 text-yellow-400'
                                        : v === 'Hard' ? 'bg-red-900/60 border-red-700 text-red-400'
                                        : 'bg-green-900/60 border-green-700 text-green-400'
                                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                            >
                                {v === 'All' ? 'Barchasi' : v === 'Easy' ? 'Oson' : v === 'Medium' ? "O'rta" : 'Qiyin'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Question cards */}
            <div className="px-4 sm:px-6 py-5">
                {libLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Kutubxona yuklanmoqda…</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-sm">Savol topilmadi</p>
                        <button onClick={() => { setSearch(''); setDiffFilter('All'); }} className="text-green-400 text-sm mt-2 hover:underline">Tozalash</button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 text-xs mb-3">
                            {filteredQuestions.length === allQuestions.length
                                ? `${allQuestions.length} ta savol`
                                : `${filteredQuestions.length} / ${allQuestions.length} savol`}
                            {isAdmin && <span className="ml-2 text-yellow-700">· Admin rejimi — javoblar ko&apos;rinadi</span>}
                        </p>
                        <div className="space-y-2">
                            {filteredQuestions.map((q, i) => (
                                <QuestionCard
                                    key={q._id || i}
                                    q={q}
                                    index={i}
                                    isAdmin={isAdmin}
                                    onEdit={setEditingQ}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={startQuiz}
                                disabled={quizLoading || allQuestions.length === 0}
                                className="flex items-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-900/30"
                            >
                                {quizLoading
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Play size={16} className="fill-white" />
                                }
                                Quiz Boshlash ({Math.min(allQuestions.length, 31)} ta savol)
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
