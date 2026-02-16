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
        const { username, password } = await req.json();
        if (!username || !password) {
            return new Response(JSON.stringify({ message: 'Username va parol majburiy' }), { status: 400 });
        }

        const users = await getUsers();
        const user = users.find(user => user.username === username);

        if (!user) {
            return new Response(JSON.stringify({ message: 'Username yoki parol xato' }), { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return new Response(JSON.stringify({ message: 'Username yoki parol xato' }), { status: 401 });
        }


        const { password: _, ...userWithoutPassword } = user; // Exclude password from response
        return new Response(JSON.stringify({ message: 'Kirish muvaffaqiyatli', user: userWithoutPassword }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi' }), { status: 500 });
    }
}