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
    const { login, logout, setLoading } = useAuthStore();

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
        } else if (status === "unauthenticated") {
            logout();
        }

        setLoading(false);
    }, [session, status, login, logout, setLoading]);

    return null;
}
