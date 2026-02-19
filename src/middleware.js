import { NextResponse } from 'next/server';

export function middleware(request) {
    // 1. Foydalanuvchining sessiya "hujjati" (cookie) bormi-yo'qligini tekshiramiz
    const sessionCookie = request.cookies.get('session_token');

    // 2. Foydalanuvchi bormoqchi bo'lgan manzil (URL)
    const { pathname } = request.nextUrl;

    // 3. Qaysi sahifalar ochiq bo'lishi kerakligini belgilaymiz
    const publicPaths = ['/login', '/signup'];

    // AGAR: Foydalanuvchi sessiyasi yo'q bo'lsa VA u himoyalangan sahifaga (login/signup'dan boshqa) kirmoqchi bo'lsa
    if (!sessionCookie && !publicPaths.includes(pathname)) {
        // Uni majburan LOGIN sahifasiga qaytaramiz
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // AGAR: Foydalanuvchi sessiyasi BOR bo'lsa VA u login yoki signup sahifasiga qayta kirmoqchi bo'lsa
    if (sessionCookie && publicPaths.includes(pathname)) {
        // Uni ASOSIY sahifaga yo'naltiramiz, chunki u allaqachon tizimda
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Agar yuqoridagi shartlarning hech biri bajarilmasa, demak hammasi joyida. Davom etishga ruxsat beramiz.
    return NextResponse.next();
}

// Qaysi manzillar uchun bu middleware ishlashini belgilaymiz
export const config = {
    matcher: [
        /*
         * Quyidagilardan tashqari barcha yo'llarni tekshirish:
         * - api (...)
         * - _next/static (...)
         * - _next/image (...)
         * - favicon.ico (...)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};