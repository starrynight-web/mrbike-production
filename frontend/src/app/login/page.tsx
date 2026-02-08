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
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn("google", { callbackUrl });
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 11) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/auth/otp/send/`, {
                method: "POST",
                body: JSON.stringify({ phone }),
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                toast.success("OTP sent successfully!");
                setStep("otp");
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn("otp", {
                phone,
                otp,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                toast.error("Invalid OTP or verification failed");
            } else {
                toast.success("Successfully logged in!");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred during sign in");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signIn("otp", {
                phone: "01711111111",
                otp: "123456",
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                toast.error("Demo login failed");
            } else {
                toast.success("Logged in as Demo User!");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred during demo login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Bike className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                    {step === "phone" ? "Welcome Back" : "Verify Phone"}
                </CardTitle>
                <CardDescription>
                    {step === "phone"
                        ? "Sign in with your phone number"
                        : `Enter the 6-digit code sent to ${phone}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send OTP
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full border-primary/20 hover:bg-primary/5"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Login as Demo User
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify & Login
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setStep("phone")}
                            disabled={isLoading}
                        >
                            Change Phone Number
                        </Button>
                    </form>
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
                    By continuing, you agree to our Terms and Privacy Policy.
                </p>
            </CardFooter>
        </Card>
    );
}
