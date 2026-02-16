import { promises as fs } from 'fs';
import path from 'path';


const usersFilePath = path.join(process.cwd(), 'data', 'users.json');


export async function GET() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        const users = JSON.parse(data);

        //const usersWithoutPassword = users.map(({ password, ...user }) => user);

        return new Response(JSON.stringify({ users }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: "Foydalanuvchilarni o'qishda xato yuz berdi" }), { status: 500 });
    }
}