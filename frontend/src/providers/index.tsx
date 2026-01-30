"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";

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
            {children}
            <Toaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                    duration: 4000,
                }}
            />
        </QueryProvider>
    );
}
