'use client'
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import {useState, useEffect} from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";


export default function RootLayout({children}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Check if user has session token
        const sessionToken = Cookies.get('session_token');
        setIsAuthenticated(!!sessionToken);
        setIsLoading(false);
    }, [pathname]); // Re-check on pathname change

    // Pages that don't require authentication
    const publicPages = ['/login', '/signup'];
    const isPublicPage = publicPages.includes(pathname);

    // Show sidebar and header only if authenticated and not on public pages
    const showLayout = isAuthenticated && !isPublicPage;

    if (isLoading) {
        return (
            <html lang="en">
                <body className="flex items-center justify-center h-screen bg-gray-900">
                    <div className="text-white">Loading...</div>
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body className="flex">
                {showLayout && <Sidebar isExpanded={isExpanded}/>}
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {showLayout && <Header onToggle={() => setIsExpanded(!isExpanded)} />}
                            <main className={`flex-1 overflow-y-auto ${!showLayout ? 'w-full' : ''}`}>
                                {children}
                            </main>
                    </div>
            </body>
        </html>
    );
}
