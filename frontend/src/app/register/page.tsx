"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Bike, Loader2, Chrome, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Registration successful! Logging you in...");
                // Auto sign in
                const result = await signIn("email", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                    callbackUrl: "/profile",
                });

                if (result?.error) {
                    router.push("/login");
                } else {
                    router.push("/profile");
                }
            } else {
                toast.error(data.detail || data.email?.[0] || data.username?.[0] || "Registration failed");
            }
        } catch (error: unknown) {
            console.error("Registration error:", error);
            toast.error("An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/profile" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 pt-20">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <Bike className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>
                        Join Bangladesh's #1 Motorcycle Ecosystem
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="first_name"
                                        placeholder="John"
                                        className="pl-10"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="johndoe123"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>

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

                    <Button
                        variant="outline"
                        className="w-full h-11"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        <Chrome className="mr-2 h-4 w-4 text-red-500" />
                        Sign up with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                    <p className="text-center text-xs text-muted-foreground leading-relaxed">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{" "}
                        <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
