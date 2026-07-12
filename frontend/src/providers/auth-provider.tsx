"use client";

import { SessionProvider, SessionProviderProps, useSession, signOut } from "next-auth/react";
import { ReactNode, ReactElement, useEffect } from "react";

/**
 * Watches for NextAuth session errors (e.g. RefreshAccessTokenError).
 * When a refresh token is expired or blacklisted (e.g. after a backend restart),
 * NextAuth sets session.error = "RefreshAccessTokenError".
 * We silently sign the user out so they can log back in with fresh tokens.
 * This prevents the "Oops!" error from appearing on public pages.
 */
function SessionErrorWatcher() {
  const { data: session } = useSession();
  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      console.error("[Auth] Refresh token invalid — signing out to clear broken session.");
      signOut({ redirect: false });
    }
  }, [session]);
  return null;
}

/**
 * AuthProvider wraps the application with NextAuth's SessionProvider.
 * The main hook (useAuth) handles undefined session gracefully during builds.
 */
export function AuthProvider({ children, session }: SessionProviderProps & { children: ReactNode }): ReactElement {
    return (
        <SessionProvider 
            session={session}
            refetchInterval={5 * 60}
            refetchOnWindowFocus={false}
            basePath="/api/auth"
        >
            <SessionErrorWatcher />
            {children}
        </SessionProvider>
    );
}

