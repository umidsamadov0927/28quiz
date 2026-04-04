import bcrypt from 'bcryptjs';
import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

export async function POST(req) {
    try {
        await connectDB();

        const { username, password } = await req.json();
        if (!username || !password) {
            return new Response(JSON.stringify({ message: 'Username va parol majburiy' }), { status: 400 });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return new Response(JSON.stringify({ message: 'Username yoki parol xato' }), { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ message: 'Username yoki parol xato' }), { status: 401 });
        }

        // Exclude password from response and ensure daily fields exist so the
        // client cookie always contains predictable values.
        const userResponse = user.toObject();
        delete userResponse.password;
        if (userResponse.dailyXp == null) userResponse.dailyXp = 0;
        if (userResponse.dailyXpDate == null) userResponse.dailyXpDate = null;

        return new Response(JSON.stringify({ message: 'Kirish muvaffaqiyatli', user: userResponse }), { status: 200 });

    } catch (error) {
        console.error('Signin error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi: ' + error.message }), { status: 500 });
    }
}
