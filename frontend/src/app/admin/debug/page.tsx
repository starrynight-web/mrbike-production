"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { getSession } from "next-auth/react";

export default function DebugPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [session, setSession] = useState<any>(null);
    const [envVars, setEnvVars] = useState<any>({});

    useEffect(() => {
        async function loadDebugData() {
            try {
                const s = await getSession();
                setSession(s);
            } catch (e) {
                console.error("Debug: Session load failed", e);
            }

            setEnvVars({
                NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
                NODE_ENV: process.env.NODE_ENV,
                BASE_URL: window.location.origin
            });
        }
        loadDebugData();
    }, []);

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Debug Environment & Auth</h1>
            
            <section className="space-y-2">
                <h2 className="text-lg font-semibold">Environment Variables</h2>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(envVars, null, 2)}
                </pre>
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">Zustand Auth Store</h2>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify({ user, isAuthenticated }, null, 2)}
                </pre>
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">NextAuth Session</h2>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(session, null, 2)}
                </pre>
                {session?.accessToken && (
                    <div className="mt-2">
                        <p className="text-xs font-mono break-all">Token: {session.accessToken.substring(0, 20)}...</p>
                    </div>
                )}
            </section>
        </div>
    );
}
