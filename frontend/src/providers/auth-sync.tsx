"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store";
import { UserRole, User } from "@/types";

interface NextAuthUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
}

export function AuthSync() {
    const { data: session, status } = useSession();
    
    // Store actions and state (using refs for stable access inside effect)
    const login = useAuthStore(state => state.login);
    const setLoading = useAuthStore(state => state.setLoading);
    const storeState = useRef({
        isAuthenticated: false,
        currentUser: null as User | null
    });

    // Keep ref in sync with store
    useEffect(() => {
        const unsubscribe = useAuthStore.subscribe((state) => {
            storeState.current = {
                isAuthenticated: state.isAuthenticated,
                currentUser: state.user
            };
        });
        return unsubscribe;
    }, []);
    
    // Prevent redundant syncs
    const lastSyncedRef = useRef<string | null>(null);

    useEffect(() => {
        if ((session as any)?.error === "RefreshAccessTokenError") {
            console.warn("[AuthSync] RefreshAccessTokenError detected, signing out...");
            import("next-auth/react").then(({ signOut }) => {
                signOut({ callbackUrl: "/login?error=SessionExpired" });
            });
            return;
        }

        const syncProfile = async () => {
            if (status !== "authenticated" || !session?.user) {
                if (status === "unauthenticated") {
                    setLoading(false);
                    // Clear stale token from localStorage on sign-out
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem("accessToken");
                    }
                }
                return;
            }

            const user = session.user as NextAuthUser;
            const sessionEmail = user.email || "";
            const syncKey = `${sessionEmail}-${user.role}`;
            const { isAuthenticated, currentUser } = storeState.current;

            // Still show loading while we fetch the source-of-truth profile
            setLoading(true);

            try {
                // IMPORTANT: Fetch the full profile from backend to get latest role/sections
                // This bypasses stale NextAuth tokens.
                const { api } = await import("@/lib/api-service");
                const response = await api.get<any>("/users/profile/");
                
                if (response.success && response.data) {
                    const dbUser = response.data;
                    const userData: User = {
                        id: dbUser.id?.toString() || user.id || "unknown",
                        email: dbUser.email || sessionEmail,
                        name: `${dbUser.first_name || ""} ${dbUser.last_name || ""}`.trim() || dbUser.username || user.name || "",
                        image: dbUser.profile_image || user.image || undefined,
                        role: (dbUser.role as UserRole) || "user",
                        phoneVerified: !!dbUser.phone_verified,
                        isEmailVerified: !!dbUser.is_email_verified,
                        createdAt: dbUser.date_joined || new Date(),
                        updatedAt: new Date(),
                        // Attach sections for useAuth fallback
                        staffAdminSections: dbUser.staff_profile_sections || []
                    } as any;

                    // Persist JWT token so axios interceptor can attach it synchronously
                    const accessToken = (session as any)?.accessToken;
                    if (typeof window !== 'undefined' && accessToken) {
                        localStorage.setItem("accessToken", accessToken);
                    }

                    console.log(`[AUTH-SYNC] Successfully synced profile for ${sessionEmail}. Role: ${userData.role}`);
                    login(userData);
                    lastSyncedRef.current = syncKey;
                } else {
                    // Fallback to session data if profile fetch fails
                    console.warn("[AUTH-SYNC] Profile fetch failed, falling back to session data.");
                    const userData: User = {
                        id: user.id || "unknown",
                        email: sessionEmail,
                        name: user.name || "",
                        image: user.image || undefined,
                        role: (user.role as UserRole) || "user",
                        phoneVerified: false,
                        isEmailVerified: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    login(userData);
                }
            } catch (err: any) {
                console.warn("[AuthSync] Profile sync failed:", err.message);
                if (err.code === 'HTTP_401' || err.status === 401) {
                    //Interceptors already handled token cleanup
                    setLoading(false);
                }
            } finally {
                setLoading(false);
            }
        };

        syncProfile();
    }, [session, status, login, setLoading]);

    return null;
}
