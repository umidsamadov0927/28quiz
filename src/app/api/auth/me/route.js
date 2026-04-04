import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

function parseSessionFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map(p => p.trim());
    const tokenPart = parts.find(p => p.startsWith('session_token='));
    if (!tokenPart) return null;
    let raw = tokenPart.split('=')[1] || '';
    try {
        // cookie values may be encoded, try decode then parse
        raw = decodeURIComponent(raw);
        return JSON.parse(raw);
    } catch (e) {
        try {
            return JSON.parse(raw);
        } catch (err) {
            return null;
        }
    }
}

export async function GET(req) {
    try {
        await connectDB();

        const cookieHeader = req.headers.get('cookie');
        const session = parseSessionFromCookie(cookieHeader);
        if (!session || !session.username) {
            return new Response(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
        }

        const user = await User.findOne({ username: session.username }).select('-password');
        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }

        const userObj = user.toObject();
        if (userObj.dailyXp == null) userObj.dailyXp = 0;
        if (userObj.dailyXpDate == null) userObj.dailyXpDate = null;
        if (userObj.activity == null) userObj.activity = [];

        return new Response(JSON.stringify({ user: userObj }), { status: 200 });

    } catch (error) {
        console.error('Get current user error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi' }), { status: 500 });
    }
}
