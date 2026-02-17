"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />

            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Missing verification token.");
            return;
        }

        const verifyToken = async () => {
            try {
                const result = await signIn("verify-token", {
                    token,
                    redirect: false,
                });

                if (result?.error) {
                    setStatus("error");
                    setErrorMessage(result.error);
                } else {
                    setStatus("success");
                    toast.success("Email verified and logged in!");
                    // Small delay before redirecting to profile
                    setTimeout(() => {
                        router.push("/profile");
                        router.refresh();
                    }, 2000);
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setErrorMessage("An unexpected error occurred during verification.");
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-card border border-border shadow-2xl rounded-3xl p-8 md:p-12 text-center relative z-10"
        >
            {status === "verifying" && (
                <div className="space-y-6">
                    <div className="relative h-20 w-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                        <Loader2 className="h-20 w-20 animate-spin text-primary relative z-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Verifying Email</h1>
                        <p className="text-muted-foreground">
                            Please wait while we confirm your identity...
                        </p>
                    </div>
                </div>
            )}

            {status === "success" && (
                <div className="space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500"
                    >
                        <CheckCircle className="h-10 w-10" />
                    </motion.div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Success!</h1>
                        <p className="text-lg text-muted-foreground">
                            Your email has been verified.
                        </p>
                    </div>
                    <p className="text-sm">
                        Redirecting you to your profile in a few seconds...
                    </p>
                    <div className="pt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2 }}
                            className="h-full bg-green-500"
                        />
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="space-y-6">
                    <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                        <XCircle className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Verification Failed</h1>
                        <p className="text-muted-foreground">
                            {errorMessage || "We couldn't verify your email address."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-6">
                        <Link href="/login" passHref>
                            <Button className="w-full h-12 text-lg font-semibold">
                                Go to Login
                            </Button>
                        </Link>
                        <Link href="/register" passHref>
                            <Button variant="ghost" className="w-full h-12 text-base">
                                Try Registering Again
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
