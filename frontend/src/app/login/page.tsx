"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bike, Loader2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Suspense fallback={<Card className="w-full max-w-md p-6"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></Card>}>
                <LoginContent />
            </Suspense>
        </div>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const mockLoginTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMockLogin = (role: "user" | "admin" = "user") => {
        setIsLoading(true);
        // Simulate API delay
        mockLoginTimeoutRef.current = setTimeout(() => {
            login({
                id: role === "admin" ? "admin-1" : "user-123",
                email: role === "admin" ? "admin@mrbikebd.com" : "demo@mrbikebd.com",
                name: role === "admin" ? "Admin User" : "Demo User",
                role: role,
                phoneVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            toast.success("Successfully logged in!");
            router.push(callbackUrl);
            router.refresh(); // Ensure header state updates
        }, 1000);
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn("google", { callbackUrl });
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Bike className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                    Sign in to your MrBikeBD account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="demo@mrbikebd.com" disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" disabled />
                </div>

                {process.env.NODE_ENV === "development" && (
                    <>
                        <Button className="w-full" onClick={() => handleMockLogin("user")} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In (User Mock)
                        </Button>

                        <Button variant="secondary" className="w-full" onClick={() => handleMockLogin("admin")} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In (Admin Mock)
                        </Button>
                    </>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account? <span className="text-primary font-medium cursor-pointer">Sign up</span>
                </p>
            </CardFooter>
        </Card>
    );
}
