'use client'
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import {useState, useEffect} from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";


export default function RootLayout({children}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !!Cookies.get('session_token');
    });
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setIsAuthenticated(!!Cookies.get('session_token'));
    }, [pathname]);

    // Pages that don't require authentication
    const publicPages = ['/login', '/signup'];
    const isPublicPage = publicPages.includes(pathname);

    // Show sidebar and header only if authenticated and not on public pages
    const showLayout = isAuthenticated && !isPublicPage;

    return (
        <html lang="en">
            <body className="flex bg-gray-950">
                {showLayout && <Sidebar isExpanded={isExpanded}/>}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    {showLayout && <Header onToggle={() => setIsExpanded(!isExpanded)} />}
                    <main className={`flex-1 overflow-y-auto ${showLayout ? 'pb-16 md:pb-0' : ''}`}>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
