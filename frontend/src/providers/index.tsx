"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { AuthSync } from "./auth-sync";
import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";

const CompareBar = dynamic(() => import("@/components/bikes").then((mod) => mod.CompareBar), { ssr: false });
const MobileNav = dynamic(() => import("@/components/layout").then((mod) => mod.MobileNav), { ssr: false });

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Root providers wrapper - wraps all context providers
 * Order matters: outermost providers are listed first
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <QueryProvider>
            <AuthProvider>
                <AuthSync />
                {children}
                <Toaster
                    position="top-center"
                    richColors
                    closeButton
                    toastOptions={{
                        duration: 4000,
                    }}
                />
                <CompareBar />
                <MobileNav />
            </AuthProvider>
        </QueryProvider>
    );
}
