import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function getUsers() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export async function POST(req) {
    try {
        const { username, password, grade } = await req.json();

        if (!username || !password || !grade) {
            return new Response(JSON.stringify({ message: 'Username parol va sinf majburiy' }), { status: 400 });
        }

        const users = await getUsers();

        const existingUser = users.find(user => user.username === username);

        if (existingUser) {
            return new Response(JSON.stringify({ message: 'Bunday username mavjud' }), { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: `user-${Date.now()}`,
            username,
            password: hashedPassword,
            grade: parseInt(grade, 10),
            level: 1,
            xp: 0,
            questionsSolved: 0,
            dayStreak: 0,
            joinedAt: new Date().toISOString(),
        }

        users.push(newUser);

        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

        return new Response(JSON.stringify({ message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi' }), { status: 201 });


    } catch (error) {
        console.error('Signup error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi: ' + error.message }), { status: 500 });
    }
}