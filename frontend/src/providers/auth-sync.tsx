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
        console.log(`[DEBUG-LOOP] AuthSync Status: ${status}`);
        
        if (status === "loading") {
            setLoading(true);
            return;
        }

        if (status === "authenticated" && session?.user) {
            const user = session.user as NextAuthUser;
            const sessionEmail = user.email || "";
            
            // Shallow comparison to avoid loops
            const syncKey = `${sessionEmail}-${user.role}`;
            const { isAuthenticated, currentUser } = storeState.current;

            if (isAuthenticated && currentUser?.email === sessionEmail && lastSyncedRef.current === syncKey) {
                console.log("[DEBUG-LOOP] AuthSync: Already synced, skipping.");
                setLoading(false);
                return;
            }
            
            console.log(`[DEBUG-LOOP] AuthSync: Syncing user ${sessionEmail} to store...`);
            
            // Sync tokens
            if (session.accessToken) localStorage.setItem("accessToken", session.accessToken);
            if (session.refreshToken) localStorage.setItem("refreshToken", session.refreshToken);

            const userData: User = {
                id: user.id || "unknown",
                email: sessionEmail,
                name: user.name || "",
                image: user.image || undefined,
                role: (user.role as UserRole) || "user",
                phoneVerified: false,
                isEmailVerified: true,
                createdAt: currentUser?.createdAt || new Date(),
                updatedAt: new Date(),
            };

            login(userData);
            lastSyncedRef.current = syncKey;
        } else if (status === "unauthenticated") {
            console.log("[DEBUG-LOOP] AuthSync: Status is unauthenticated.");
        }

        setLoading(false);
    }, [session, status, login, setLoading]); // Removed dependent store values

    return null;
}
