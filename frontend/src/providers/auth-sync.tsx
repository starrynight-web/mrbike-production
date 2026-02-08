"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { UserRole } from "@/types";

interface NextAuthUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
}

export function AuthSync() {
    const { data: session, status } = useSession();
    const { login, setLoading } = useAuthStore();

    useEffect(() => {
        if (status === "loading") {
            setLoading(true);
            return;
        }

        if (status === "authenticated" && session?.user) {
            const user = session.user as NextAuthUser;
            login({
                id: user.id || "unknown",
                email: user.email || "",
                name: user.name || "",
                image: user.image || undefined,
                role: (user.role as UserRole) || "user",
                phoneVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        // Do not call logout() when unauthenticated: keep persisted login state
        // so a single reload does not log the user out. Sign Out clears the store explicitly.

        setLoading(false);
    }, [session, status, login, setLoading]);

    return null;
}
