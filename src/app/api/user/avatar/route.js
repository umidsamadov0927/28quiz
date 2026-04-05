import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

function parseSession(cookieHeader) {
    if (!cookieHeader) return null;
    const part = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith('session_token='));
    if (!part) return null;
    try { return JSON.parse(decodeURIComponent(part.split('=')[1] || '')); } catch { return null; }
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const session = parseSession(cookieHeader);
        if (!session?.username) {
            return new Response(JSON.stringify({ message: 'Avtorizatsiya talab qilinadi' }), { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('avatar');

        if (!file || typeof file === 'string') {
            return new Response(JSON.stringify({ message: 'Fayl topilmadi' }), { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return new Response(JSON.stringify({ message: 'Faqat JPG, PNG, WEBP yoki GIF formatlar qabul qilinadi' }), { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        if (bytes.byteLength > MAX_SIZE) {
            return new Response(JSON.stringify({ message: 'Fayl hajmi 2MB dan oshmasligi kerak' }), { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ username: session.username });
        if (!user) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi topilmadi' }), { status: 404 });
        }

        const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
        const filename = `${user._id}.${ext}`;
        const avatarsDir = path.join(process.cwd(), 'public', 'avatars');

        await mkdir(avatarsDir, { recursive: true });
        await writeFile(path.join(avatarsDir, filename), Buffer.from(bytes));

        // append timestamp so browsers don't serve stale cached version
        const avatarUrl = `/avatars/${filename}?v=${Date.now()}`;
        user.avatarUrl = avatarUrl;
        await user.save();

        return new Response(
            JSON.stringify({ avatarUrl }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Avatar upload error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const session = parseSession(cookieHeader);
        if (!session?.username) {
            return new Response(JSON.stringify({ message: 'Avtorizatsiya talab qilinadi' }), { status: 401 });
        }

        await connectDB();
        await User.updateOne({ username: session.username }, { $unset: { avatarUrl: '' } });

        return new Response(JSON.stringify({ message: "Rasm o'chirildi" }), { status: 200 });
    } catch (error) {
        console.error('Avatar delete error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
