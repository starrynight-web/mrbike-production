"use client";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store";
import type { User } from "@/types";
import type { UserRole } from "@/types";

const SUPER_ADMIN = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

/**
 * 4.2 — Unified Auth Hook (Single Source of Truth)
 * 
 * Merges NextAuth (server-verified session) and Zustand (client cache).
 * NextAuth state is always the authoritative source.
 * Provides a single clean `useAuth()` API for all components.
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const { user: storedUser, isAuthenticated, isLoading: storeLoading } = useAuthStore();

  const isLoadingSession = status === "loading";
  const isLoadingStore = isLoadingSession || storeLoading;

  // Authoritative user data: merge NextAuth session (primary) with Zustand cache
  const sessionUser = session?.user;
  const user: User | null = sessionUser
    ? {
        id: (sessionUser as any).id || storedUser?.id || "unknown",
        email: sessionUser.email || "",
        name: sessionUser.name || "",
        image: sessionUser.image || undefined,
        role: ((sessionUser as any).role as UserRole) || storedUser?.role || "user",
        phoneVerified: storedUser?.phoneVerified ?? false,
        isEmailVerified: (sessionUser as any).isEmailVerified ?? storedUser?.isEmailVerified ?? false,
        createdAt: storedUser?.createdAt || new Date(),
        updatedAt: storedUser?.updatedAt || new Date(),
      }
    : null;

  const resolvedAuthenticated = status === "authenticated" && !!sessionUser;

  /**
   * Whether the current user is the super admin.
   * Checked via NEXT_PUBLIC_SUPER_ADMIN_EMAIL env var on client.
   */
  const isSuperAdmin = resolvedAuthenticated && SUPER_ADMIN
    ? user?.email === SUPER_ADMIN
    : false;

  const accessToken: string | undefined = (session as any)?.accessToken;
  const refreshToken: string | undefined = (session as any)?.refreshToken;
  const sessionError: string | undefined = (session as any)?.error;

  return {
    // Core state
    user,
    isAuthenticated: resolvedAuthenticated,
    isLoading: isLoadingStore,
    isSuperAdmin,

    // Token helpers
    accessToken,
    refreshToken,
    sessionError,

    // Granular status
    sessionStatus: status,
  };
}
