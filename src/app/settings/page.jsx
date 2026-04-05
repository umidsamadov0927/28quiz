'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    User, Mail, Lock, Palette, Shield, AlertTriangle,
    Check, Eye, EyeOff, Loader2, ChevronRight, LogOut,
    Zap, Save, Camera, Trash2, Upload,
} from 'lucide-react';

function computeLevel(xp) {
    let level = 1, acc = 0;
    while (acc + level * 500 <= xp) { acc += level * 500; level++; }
    return level;
}

const AVATAR_COLORS = [
    { key: 'green',  bg: 'bg-green-900',  ring: 'ring-green-400',  dot: 'bg-green-400',  text: 'text-green-400',  border: 'border-green-700',  label: 'Yashil'    },
    { key: 'blue',   bg: 'bg-blue-900',   ring: 'ring-blue-400',   dot: 'bg-blue-400',   text: 'text-blue-400',   border: 'border-blue-700',   label: "Ko'k"       },
    { key: 'purple', bg: 'bg-purple-900', ring: 'ring-purple-400', dot: 'bg-purple-400', text: 'text-purple-400', border: 'border-purple-700', label: 'Binafsha'   },
    { key: 'orange', bg: 'bg-orange-900', ring: 'ring-orange-400', dot: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-700', label: "To'q sariq" },
    { key: 'red',    bg: 'bg-red-900',    ring: 'ring-red-400',    dot: 'bg-red-400',    text: 'text-red-400',    border: 'border-red-700',    label: 'Qizil'      },
    { key: 'pink',   bg: 'bg-pink-900',   ring: 'ring-pink-400',   dot: 'bg-pink-400',   text: 'text-pink-400',   border: 'border-pink-700',   label: 'Pushti'     },
    { key: 'yellow', bg: 'bg-yellow-900', ring: 'ring-yellow-400', dot: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-700', label: 'Sariq'      },
    { key: 'cyan',   bg: 'bg-cyan-900',   ring: 'ring-cyan-400',   dot: 'bg-cyan-400',   text: 'text-cyan-400',   border: 'border-cyan-700',   label: 'Moviy'      },
];

function getColor(key) {
    return AVATAR_COLORS.find(c => c.key === key) || AVATAR_COLORS[0];
}

const TABS = [
    { key: 'profile',    label: 'Profil',      icon: User          },
    { key: 'appearance', label: "Ko'rinish",   icon: Palette       },
    { key: 'security',   label: 'Xavfsizlik',  icon: Shield        },
    { key: 'danger',     label: 'Xavfli zona', icon: AlertTriangle },
];

function Field({ label, hint, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-5 border-b border-gray-800 last:border-0">
            <div className="sm:w-44 shrink-0">
                <p className="text-sm font-medium text-white">{label}</p>
                {hint && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{hint}</p>}
            </div>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}

function PwInput({ value, onChange, placeholder, autoComplete }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/30 transition-all"
            />
            <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}

function Toast({ msg, type }) {
    if (!msg) return null;
    const isOk = type === 'success';
    return (
        <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-2xl text-sm font-medium whitespace-nowrap
            ${isOk ? 'bg-green-950 border-green-800 text-green-300' : 'bg-red-950 border-red-800 text-red-300'}`}>
            {isOk ? <Check size={14} /> : <AlertTriangle size={14} />}
            {msg}
        </div>
    );
}

/* ── Level lock banner ── */
function LevelLockBanner({ userLevel, required = 5 }) {
    const xpNeeded = Array.from({ length: required - 1 }, (_, i) => (i + 1) * 500).reduce((a, b) => a + b, 0);
    return (
        <div className="flex items-start gap-3 px-4 py-3 mb-4 bg-yellow-950/30 border border-yellow-800/50 rounded-xl">
            <Lock size={15} className="text-yellow-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
                <p className="text-sm font-semibold text-yellow-300">Level {required} talab qilinadi</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    Siz hozir <span className="text-white font-medium">Lv {userLevel}</span> dasiz.
                    {' '}Bu funksiyalar <span className="text-yellow-400 font-medium">Level {required}</span> dan keyin ishlaydi.
                    {' '}(<span className="text-green-400 font-medium">{xpNeeded.toLocaleString()} XP</span> kerak)
                </p>
            </div>
        </div>
    );
}

/* ── Avatar display (image or colored letter) ── */
function AvatarDisplay({ avatarUrl, previewUrl, username, colorCls, size = 'md' }) {
    const s = size === 'sm' ? 'w-10 h-10 text-lg' : size === 'lg' ? 'w-20 h-20 text-3xl' : 'w-14 h-14 text-2xl';
    const src = previewUrl || avatarUrl;
    return (
        <div className={`${s} rounded-2xl overflow-hidden ${colorCls.bg} border-2 ${colorCls.border} flex items-center justify-center font-extrabold ${colorCls.text} shrink-0`}>
            {src
                ? <img src={src} alt={username || 'avatar'} className="w-full h-full object-cover" />
                : (username || 'U').charAt(0).toUpperCase()
            }
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [user, setUser]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // profile
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // appearance
    const [avatarColor, setAvatarColor]   = useState('green');
    const [previewUrl, setPreviewUrl]     = useState(null);   // local blob preview
    const [pendingFile, setPendingFile]   = useState(null);   // File object
    const [uploadLoading, setUploadLoading] = useState(false);
    const [appearanceLoading, setAppearanceLoading] = useState(false);

    // security
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw]         = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [secLoading, setSecLoading] = useState(false);

    // danger
    const [confirmDelete, setConfirmDelete] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // toast
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    function showToast(msg, type = 'success') {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    }

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(({ user: u }) => {
                setUser(u);
                setUsername(u.username || '');
                setEmail(u.email || '');
                setAvatarColor(u.avatarColor || 'green');
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    async function callProfile(body) {
        const res = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Xato yuz berdi');
        return data;
    }

    /* ── Save profile ── */
    async function saveProfile() {
        if (!username.trim()) return showToast("Username bo'sh bo'lishi mumkin emas", 'error');
        setProfileLoading(true);
        try {
            const data = await callProfile({ username: username.trim(), email, avatarColor });
            setUser(data.user);
            try {
                const raw = Cookies.get('session_token');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    parsed.username = data.user.username;
                    Cookies.set('session_token', JSON.stringify(parsed), { expires: 7, path: '/' });
                }
            } catch { /**/ }
            showToast('Profil saqlandi');
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setProfileLoading(false);
        }
    }

    /* ── Handle file pick ── */
    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return showToast("Faqat rasm fayllari qabul qilinadi", 'error');
        if (file.size > 2 * 1024 * 1024) return showToast("Fayl hajmi 2MB dan oshmasligi kerak", 'error');
        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    /* ── Upload avatar ── */
    async function uploadAvatar() {
        if (!pendingFile) return;
        setUploadLoading(true);
        try {
            const form = new FormData();
            form.append('avatar', pendingFile);
            const res = await fetch('/api/user/avatar', { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUser(u => ({ ...u, avatarUrl: data.avatarUrl }));
            setPendingFile(null);
            setPreviewUrl(null);
            window.dispatchEvent(new Event('user-updated'));
            showToast('Rasm yuklandi');
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setUploadLoading(false);
        }
    }

    /* ── Remove avatar ── */
    async function removeAvatar() {
        setUploadLoading(true);
        try {
            const res = await fetch('/api/user/avatar', { method: 'DELETE' });
            if (!res.ok) throw new Error('Xato');
            setUser(u => ({ ...u, avatarUrl: null }));
            setPendingFile(null);
            setPreviewUrl(null);
            window.dispatchEvent(new Event('user-updated'));
            showToast("Rasm o'chirildi");
        } catch {
            showToast("O'chirishda xato", 'error');
        } finally {
            setUploadLoading(false);
        }
    }

    /* ── Save appearance (color only) ── */
    async function saveAppearance() {
        setAppearanceLoading(true);
        try {
            const data = await callProfile({ username: user.username, avatarColor });
            setUser(data.user);
            showToast("Ko'rinish saqlandi");
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setAppearanceLoading(false);
        }
    }

    /* ── Change password ── */
    async function changePassword() {
        if (!currentPw || !newPw || !confirmPw) return showToast("Barcha maydonlarni to'ldiring", 'error');
        if (newPw !== confirmPw) return showToast('Yangi parollar mos kelmadi', 'error');
        if (newPw.length < 6) return showToast('Yangi parol kamida 6 ta belgi', 'error');
        setSecLoading(true);
        try {
            await callProfile({ username: user.username, currentPassword: currentPw, newPassword: newPw });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            showToast("Parol muvaffaqiyatli o'zgartirildi");
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            setSecLoading(false);
        }
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        Cookies.remove('session_token');
        router.push('/login');
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const colorCls   = getColor(avatarColor);
    const hasAvatar  = !!(previewUrl || user?.avatarUrl);
    const userLevel  = computeLevel(user?.xp || 0);
    const locked     = userLevel < 5;

    return (
        <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
            <Toast msg={toast.msg} type={toast.type} />

            {/* hidden dummy inputs — prevents browser autofill on visible fields */}
            <input type="text"     autoComplete="username" style={{ display: 'none' }} readOnly />
            <input type="password" autoComplete="current-password" style={{ display: 'none' }} readOnly />

            <div className="space-y-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Sozlamalar</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Profilingiz va hisobingizni boshqaring</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-5">

                    {/* ── Left sidebar ── */}
                    <aside className="lg:w-52 shrink-0 flex flex-col gap-3">
                        {/* Avatar card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col items-center gap-3">
                            <div className="relative">
                                <AvatarDisplay
                                    avatarUrl={user?.avatarUrl}
                                    previewUrl={previewUrl}
                                    username={user?.username}
                                    colorCls={colorCls}
                                    size="lg"
                                />
                                <button
                                    onClick={() => setActiveTab('appearance')}
                                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-full flex items-center justify-center transition-colors"
                                    title="Rasmni o'zgartirish"
                                >
                                    <Camera size={13} className="text-gray-300" />
                                </button>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-white truncate max-w-[130px]">{user?.username}</p>
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                    <Zap size={10} className="text-green-400" />
                                    <span className="text-xs text-green-400 font-medium">{(user?.xp || 0).toLocaleString()} XP</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Lv {userLevel}
                                    {locked && <span className="text-yellow-500 ml-1">· 5 kerak</span>}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <nav className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                            {TABS.map((tab, i) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                const isDanger = tab.key === 'danger';
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                                            ${i < TABS.length - 1 ? 'border-b border-gray-800' : ''}
                                            ${isActive
                                                ? isDanger ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
                                                : isDanger ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <Icon size={15} />
                                        <span className="flex-1 text-left">{tab.label}</span>
                                        {isActive && <ChevronRight size={13} className="opacity-50" />}
                                    </button>
                                );
                            })}
                        </nav>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-sm font-medium text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={15} />
                            Chiqish
                        </button>
                    </aside>

                    {/* ── Main panel ── */}
                    <div className="flex-1 min-w-0">

                        {/* ─ PROFILE ─ */}
                        {activeTab === 'profile' && (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                                <div className="px-5 py-4 border-b border-gray-800">
                                    <h2 className="text-base font-bold text-white">Profil ma&apos;lumotlari</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Ism va aloqa ma&apos;lumotlarini yangilang</p>
                                </div>
                                {locked && <div className="px-5 pt-5"><LevelLockBanner userLevel={userLevel} /></div>}
                                <div className="px-5">
                                    <Field label="Username" hint="3-20 belgi, faqat harf/raqam/_">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                placeholder="username"
                                                maxLength={20}
                                                autoComplete="username"
                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 pr-14 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/30 transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">{username.length}/20</span>
                                        </div>
                                    </Field>
                                    <Field label="Email" hint="Ixtiyoriy. Boshqalarga ko'rinmaydi">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            autoComplete="email"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/30 transition-all"
                                        />
                                    </Field>
                                    <Field label="A&apos;zo bo'lgan sana" hint="O'zgartirib bo'lmaydi">
                                        <p className="text-sm text-gray-400 py-2.5">
                                            {user?.joinedAt
                                                ? new Date(user.joinedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
                                                : '—'}
                                        </p>
                                    </Field>
                                </div>
                                <div className="px-5 py-4 border-t border-gray-800 flex justify-end">
                                    <button onClick={saveProfile} disabled={locked || profileLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                                        {profileLoading ? <Loader2 size={14} className="animate-spin" /> : locked ? <Lock size={14} /> : <Save size={14} />}
                                        {locked ? 'Level 5 kerak' : 'Saqlash'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─ APPEARANCE ─ */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-4">
                                {locked && <LevelLockBanner userLevel={userLevel} />}
                                {/* Image upload card */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                                    <div className="px-5 py-4 border-b border-gray-800">
                                        <h2 className="text-base font-bold text-white">Profil rasmi</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, WEBP — max 2MB</p>
                                    </div>
                                    <div className="px-5 py-5">
                                        <div className="flex items-center gap-5">
                                            {/* Preview */}
                                            <div className={`w-20 h-20 rounded-2xl overflow-hidden ${colorCls.bg} border-2 ${colorCls.border} flex items-center justify-center text-3xl font-extrabold ${colorCls.text} shrink-0`}>
                                                {(previewUrl || user?.avatarUrl)
                                                    ? <img src={previewUrl || user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                    : (user?.username || 'U').charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {/* File input */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    onClick={() => !locked && fileInputRef.current?.click()}
                                                    disabled={locked}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Upload size={14} />
                                                    Rasm tanlash
                                                </button>
                                                {pendingFile && (
                                                    <button
                                                        onClick={uploadAvatar}
                                                        disabled={locked || uploadLoading}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-colors"
                                                    >
                                                        {uploadLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                        Yuklash
                                                    </button>
                                                )}
                                                {!pendingFile && user?.avatarUrl && (
                                                    <button
                                                        onClick={removeAvatar}
                                                        disabled={locked || uploadLoading}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded-xl text-sm font-medium text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {uploadLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        Rasmni o&apos;chirish
                                                    </button>
                                                )}
                                                {pendingFile && (
                                                    <button
                                                        onClick={() => { setPendingFile(null); setPreviewUrl(null); }}
                                                        className="text-xs text-gray-500 hover:text-gray-300 text-left transition-colors"
                                                    >
                                                        Bekor qilish
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {pendingFile && (
                                            <p className="text-xs text-gray-500 mt-3">
                                                Tanlangan: <span className="text-gray-300">{pendingFile.name}</span> ({(pendingFile.size / 1024).toFixed(0)} KB)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Color picker card */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                                    <div className="px-5 py-4 border-b border-gray-800">
                                        <h2 className="text-base font-bold text-white">Avatar rangi</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Rasm yuklanmagan holatda ko&apos;rsatiladi</p>
                                    </div>
                                    <div className="px-5 py-5 space-y-4">
                                        {/* Live preview */}
                                        <div className="flex items-center gap-4 p-4 bg-gray-800/60 rounded-xl border border-gray-700">
                                            <div className={`w-12 h-12 rounded-xl ${colorCls.bg} border-2 ${colorCls.border} flex items-center justify-center text-xl font-extrabold ${colorCls.text} shrink-0`}>
                                                {hasAvatar
                                                    ? <img src={previewUrl || user?.avatarUrl} alt="preview" className="w-full h-full object-cover rounded-xl" />
                                                    : (user?.username || 'U').charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{user?.username}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <div className={`w-2 h-2 rounded-full ${colorCls.dot}`} />
                                                    <span className={`text-xs font-medium ${colorCls.text}`}>{colorCls.label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Color grid */}
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                            {AVATAR_COLORS.map(c => (
                                                <button
                                                    key={c.key}
                                                    onClick={() => setAvatarColor(c.key)}
                                                    className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all
                                                        ${avatarColor === c.key
                                                            ? `${c.bg} ${c.border} ring-2 ${c.ring} ring-offset-2 ring-offset-gray-900`
                                                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                                        }`}
                                                >
                                                    <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center text-xs font-bold ${c.text}`}>
                                                        {(user?.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-[9px] text-gray-400 leading-none">{c.label}</span>
                                                    {avatarColor === c.key && (
                                                        <div className={`absolute top-1 right-1 w-3.5 h-3.5 rounded-full ${c.dot} flex items-center justify-center`}>
                                                            <Check size={8} className="text-white" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-5 py-4 border-t border-gray-800 flex justify-end">
                                        <button onClick={saveAppearance} disabled={locked || appearanceLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                                            {appearanceLoading ? <Loader2 size={14} className="animate-spin" /> : locked ? <Lock size={14} /> : <Save size={14} />}
                                            {locked ? 'Level 5 kerak' : 'Saqlash'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─ SECURITY ─ */}
                        {activeTab === 'security' && (
                            <div className="space-y-4">
                                {locked && <LevelLockBanner userLevel={userLevel} />}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                                    <div className="px-5 py-4 border-b border-gray-800">
                                        <h2 className="text-base font-bold text-white">Parolni o&apos;zgartirish</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Xavfsizlik uchun kuchli parol ishlatish tavsiya etiladi</p>
                                    </div>
                                    <div className="px-5">
                                        <Field label="Joriy parol" hint="Hozirgi parolingiz">
                                            <PwInput value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Joriy parol" autoComplete="current-password" />
                                        </Field>
                                        <Field label="Yangi parol" hint="Kamida 6 ta belgi">
                                            <PwInput value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Yangi parol" autoComplete="new-password" />
                                            {newPw.length > 0 && <PasswordStrength value={newPw} />}
                                        </Field>
                                        <Field label="Tasdiqlash" hint="Yangi parolni qayta kiriting">
                                            <PwInput value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Parolni tasdiqlang" autoComplete="new-password" />
                                            {confirmPw.length > 0 && newPw !== confirmPw && (
                                                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertTriangle size={11} /> Parollar mos kelmadi</p>
                                            )}
                                            {confirmPw.length > 0 && newPw === confirmPw && newPw.length >= 6 && (
                                                <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1"><Check size={11} /> Parollar mos keldi</p>
                                            )}
                                        </Field>
                                    </div>
                                    <div className="px-5 py-4 border-t border-gray-800 flex justify-end">
                                        <button onClick={changePassword} disabled={locked || secLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                                            {secLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                                            {locked ? 'Level 5 kerak' : 'Parolni yangilash'}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
                                    <h3 className="text-sm font-semibold text-white mb-3">Sessiya</h3>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            Joriy qurilma
                                        </div>
                                        <span className="text-xs text-green-400 font-medium">Faol hozir</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─ DANGER ZONE ─ */}
                        {activeTab === 'danger' && (
                            <div className="space-y-4">
                            {locked && <LevelLockBanner userLevel={userLevel} />}
                            <div className="bg-gray-900 border border-red-900/40 rounded-2xl">
                                <div className="px-5 py-4 border-b border-red-900/30 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                                    <div>
                                        <h2 className="text-base font-bold text-white">Xavfli zona</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Bu bo&apos;limdagi amallar qaytarib bo&apos;lmaydi</p>
                                    </div>
                                </div>

                                <div className="px-5 py-5 border-b border-gray-800">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-white">Barcha qurilmalardan chiqish</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Joriy sessiya ham yakunlanadi</p>
                                        </div>
                                        <button onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm font-medium rounded-xl transition-colors shrink-0">
                                            <LogOut size={13} /> Chiqish
                                        </button>
                                    </div>
                                </div>

                                <div className="px-5 py-5">
                                    <p className="text-sm font-semibold text-red-400">Hisobni o&apos;chirish</p>
                                    <p className="text-xs text-gray-500 mt-0.5 mb-4">
                                        Barcha ma&apos;lumotlar: XP, statistika, savollar — butunlay o&apos;chiriladi
                                    </p>
                                    <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl">
                                        <p className="text-xs text-gray-400 mb-3">
                                            Tasdiqlash uchun{' '}
                                            <span className="text-red-400 font-mono font-semibold">{user?.username}</span>{' '}
                                            ni kiriting:
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={confirmDelete}
                                                onChange={e => setConfirmDelete(e.target.value)}
                                                placeholder={user?.username}
                                                autoComplete="off"
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-600 transition-colors"
                                            />
                                            <button
                                                disabled={locked || confirmDelete !== user?.username || deleteLoading}
                                                onClick={() => { setDeleteLoading(true); showToast('Bu funksiya hali ishga tushmagan', 'error'); setDeleteLoading(false); }}
                                                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
                                            >
                                                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : "O'chirish"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PasswordStrength({ value }) {
    const checks = [
        { label: 'Kamida 6 belgi',       ok: value.length >= 6 },
        { label: 'Katta harf (A-Z)',      ok: /[A-Z]/.test(value) },
        { label: 'Kichik harf (a-z)',     ok: /[a-z]/.test(value) },
        { label: 'Raqam (0-9)',           ok: /[0-9]/.test(value) },
        { label: 'Maxsus belgi (!@#...)', ok: /[^A-Za-z0-9]/.test(value) },
    ];
    const score  = checks.filter(c => c.ok).length;
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const labels = ['Juda zaif', 'Zaif', "O'rtacha", 'Yaxshi', 'Kuchli'];
    const col    = colors[Math.max(0, score - 1)];

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {colors.map((_, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < score ? col : 'bg-gray-700'}`} />
                ))}
            </div>
            <p className={`text-xs font-medium ${score >= 4 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {labels[Math.max(0, score - 1)]}
            </p>
            <div className="grid grid-cols-1 gap-1">
                {checks.map(c => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-400' : 'text-gray-600'}`}>
                        <Check size={10} className={c.ok ? 'opacity-100' : 'opacity-20'} />
                        {c.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
