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
  let session, status;
  
  try {
    const result = useSession?.();
    // Handle case where useSession returns undefined or doesn't have data property
    if (!result) {
      session = undefined;
      status = "unauthenticated";
    } else {
      session = result.data ?? undefined;
      status = result.status ?? "unauthenticated";
    }
  } catch (e) {
    // During static generation, useSession may throw or return undefined
    session = undefined;
    status = "unauthenticated";
  }
  
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
  // 1. Check Super Admin by email (most trusted)
  const isSuperAdmin = !!(resolvedAuthenticated && SUPER_ADMIN && user?.email && 
    user.email.toLowerCase().trim() === SUPER_ADMIN.toLowerCase().trim());

  // 2. Identify all staff sections/roles
  let staffAdminSections: string[] = (sessionUser as any)?.staffAdminSections || [];

  // Fallback for stale tokens or specific roles: 
  if (staffAdminSections.length === 0 && user?.role) {
    const roleStr = user.role.toString().toLowerCase();
    if (roleStr.startsWith('staff_')) {
      staffAdminSections = [roleStr];
    } else if (roleStr === 'admin' || roleStr === 'staff') {
      // If generic staff, give them entry but they see dashboard only
      staffAdminSections = ['staff_dashboard'];
    }
  }

  // 3. Comprehensive check for any administrative access
  const isStaff = resolvedAuthenticated && (
    isSuperAdmin || 
    user?.role === 'staff' ||
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    (user?.role && user.role.toString().toLowerCase().startsWith('staff_')) ||
    staffAdminSections.length > 0
  );

  const accessToken: string | undefined = (session as any)?.accessToken;
  const refreshToken: string | undefined = (session as any)?.refreshToken;
  const sessionError: string | undefined = (session as any)?.error;

  return {
    // Core state
    user,
    isAuthenticated: resolvedAuthenticated,
    isLoading: isLoadingStore,
    isSuperAdmin,
    isStaff,
    staffAdminSections,

    // Token helpers
    accessToken,
    refreshToken,
    sessionError,

    // Granular status
    sessionStatus: status,
  };
}
