import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';
import bcrypt from 'bcryptjs';

function parseSession(cookieHeader) {
    if (!cookieHeader) return null;
    const part = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith('session_token='));
    if (!part) return null;
    try { return JSON.parse(decodeURIComponent(part.split('=')[1] || '')); } catch { return null; }
}

const VALID_COLORS = ['green', 'blue', 'purple', 'orange', 'red', 'pink', 'yellow', 'cyan'];

export async function PUT(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const session = parseSession(cookieHeader);
        if (!session?.username) {
            return new Response(JSON.stringify({ message: 'Avtorizatsiya talab qilinadi' }), { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { username, email, avatarColor, currentPassword, newPassword } = body;

        const user = await User.findOne({ username: session.username });
        if (!user) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi topilmadi' }), { status: 404 });
        }

        const updates = {};

        // Username change
        if (username && username.trim() !== user.username) {
            const trimmed = username.trim();
            if (trimmed.length < 3 || trimmed.length > 20) {
                return new Response(JSON.stringify({ message: "Username 3-20 ta belgidan iborat bo'lishi kerak" }), { status: 400 });
            }
            if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
                return new Response(JSON.stringify({ message: "Username faqat harf, raqam va _ dan iborat bo'lishi mumkin" }), { status: 400 });
            }
            const existing = await User.findOne({ username: trimmed });
            if (existing) {
                return new Response(JSON.stringify({ message: 'Bu username allaqachon band' }), { status: 409 });
            }
            updates.username = trimmed;
        }

        // Email change
        if (email !== undefined) {
            const trimmedEmail = email.trim().toLowerCase();
            if (trimmedEmail === '') {
                updates.email = undefined; // will unset
            } else {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                    return new Response(JSON.stringify({ message: "Email formati noto'g'ri" }), { status: 400 });
                }
                if (trimmedEmail !== user.email) {
                    const existing = await User.findOne({ email: trimmedEmail });
                    if (existing) {
                        return new Response(JSON.stringify({ message: 'Bu email allaqachon band' }), { status: 409 });
                    }
                    updates.email = trimmedEmail;
                }
            }
        }

        // Avatar color change
        if (avatarColor && VALID_COLORS.includes(avatarColor)) {
            updates.avatarColor = avatarColor;
        }

        // Password change
        if (newPassword) {
            if (!currentPassword) {
                return new Response(JSON.stringify({ message: "Joriy parolni kiriting" }), { status: 400 });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return new Response(JSON.stringify({ message: "Joriy parol noto'g'ri" }), { status: 400 });
            }
            if (newPassword.length < 6) {
                return new Response(JSON.stringify({ message: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" }), { status: 400 });
            }
            updates.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updates).length === 0) {
            return new Response(JSON.stringify({ message: "O'zgartirish yo'q" }), { status: 400 });
        }

        // Handle email unset separately (MongoDB $unset)
        if (updates.email === undefined && email !== undefined && email.trim() === '') {
            await User.updateOne({ username: session.username }, {
                $set: { ...updates },
                $unset: { email: '' },
            });
        } else {
            await User.updateOne({ username: session.username }, { $set: updates });
        }

        const updatedUser = await User.findOne({ username: updates.username || session.username })
            .select('-password -activity -dailyChallenges');

        return new Response(
            JSON.stringify({ message: 'Profil yangilandi', user: updatedUser }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Profile update error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
