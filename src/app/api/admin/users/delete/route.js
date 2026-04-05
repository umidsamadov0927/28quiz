import { connectDB } from '../../../config/mongodb.js';
import { User } from '../../../models/User.js';

function parseSession(cookieHeader) {
    if (!cookieHeader) return null;
    const part = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith('session_token='));
    if (!part) return null;
    try { return JSON.parse(decodeURIComponent(part.split('=')[1] || '')); } catch { return null; }
}

export async function DELETE(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const session = parseSession(cookieHeader);
        if (!session || session.username !== 'username') {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        const { userId } = await req.json();
        if (!userId) {
            return new Response(JSON.stringify({ message: 'userId talab qilinadi' }), { status: 400 });
        }

        await connectDB();
        const user = await User.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi topilmadi' }), { status: 404 });
        }
        if (user.username === 'username') {
            return new Response(JSON.stringify({ message: 'Admin hisobini o\'chirib bo\'lmaydi' }), { status: 403 });
        }

        await User.deleteOne({ _id: userId });
        return new Response(JSON.stringify({ message: 'Foydalanuvchi o\'chirildi' }), { status: 200 });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
