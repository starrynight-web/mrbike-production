"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { AuthSync } from "./auth-sync";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "./motion-provider";

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
                <MotionProvider>
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
                </MotionProvider>
            </AuthProvider>
        </QueryProvider>
    );
}
