"use client";

import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { ReactNode, ReactElement } from "react";

/**
 * AuthProvider wraps the application with NextAuth's SessionProvider.
 * The main hook (useAuth) handles undefined session gracefully during builds.
 */
export function AuthProvider({ children, session }: SessionProviderProps & { children: ReactNode }): ReactElement {
    const isServer = typeof window === 'undefined';
    
    return (
        <SessionProvider 
            // On server: pass null to prevent automatic session fetching during build
            session={isServer ? null : session}
            // Disable automatic refetching during SSR
            refetchInterval={isServer ? 0 : 5 * 60}
            // Only refetch on window focus on client side
            refetchOnWindowFocus={!isServer}
            basePath="/api/auth"
        >
            {children}
        </SessionProvider>
    );
}

