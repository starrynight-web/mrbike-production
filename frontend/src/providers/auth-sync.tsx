"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { UserRole } from "@/types";

export function AuthSync() {
    const { data: session, status } = useSession();
    const { login, logout, setLoading } = useAuthStore();

    useEffect(() => {
        if (status === "loading") {
            setLoading(true);
            return;
        }

        if (status === "authenticated" && session?.user) {
            login({
                id: (session.user as any).id || "unknown",
                email: session.user.email || "",
                name: session.user.name || "",
                image: session.user.image || undefined,
                role: ((session.user as any).role as UserRole) || "user",
                phoneVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else if (status === "unauthenticated") {
            logout();
        }

        setLoading(false);
    }, [session, status, login, logout, setLoading]);

    return null;
}
