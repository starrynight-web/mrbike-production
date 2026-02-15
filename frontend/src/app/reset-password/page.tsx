"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      {/* Background Image for Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/images/hero.webp"
          alt="Motorcycle Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-background to-background" />
      </div>

      {/* Left side: Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 overflow-hidden">
        <Image
          src="/images/hero.webp"
          alt="Motorcycle"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <div className="flex items-center gap-2">
            <Image
              src="/images/onlybike_dark.png"
              alt="MrBikeBD Logo"
              width={40}
              height={40}
              className="brightness-0 invert"
            />
            <Image
              src="/images/onlytext_dark.png"
              alt="MrBikeBD"
              width={120}
              height={40}
              className="brightness-0 invert h-12 w-auto object-contain"
            />
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Set a New <span className="text-primary">Strong Password</span>
            </h1>
            <p className="text-xl text-zinc-300">
              Create a secure password to protect your MrBikeBD account. Use a
              mix of letters, numbers, and special characters.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-zinc-400">
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">50k+</span>
              <span>Active Users</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">10k+</span>
              <span>Bikes Listed</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">100+</span>
              <span>Dealers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 lg:p-16 bg-muted/20 md:bg-muted/20 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-background/80 md:bg-transparent p-6 md:p-0 rounded-2xl backdrop-blur-sm md:backdrop-blur-none shadow-xl md:shadow-none border border-white/10 md:border-none">
          <Suspense
            fallback={
              <div className="w-full p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!uid || !token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/auth/password-reset-confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            token,
            new_password: password,
          }),
        },
      );

      if (res.ok) {
        setIsSubmitted(true);
        toast.success("Password reset successful!");
      } else {
        const data = await res.json();
        toast.error(
          data.detail ||
            data.token?.[0] ||
            "Failed to reset password. The link may have expired.",
        );
      }
    } catch (error) {
      console.error("Password reset confirm error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Invalid Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </div>
        <Button className="w-full h-12 text-lg font-semibold" asChild>
          <Link href="/forgot-password">Request New Link</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Logo */}
      <div className="md:hidden flex flex-col items-center mb-8">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
          <Image
            src="/images/onlybike_dark.png"
            alt="MrBikeBD"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <Image
          src="/images/onlytext_dark.png"
          alt="MrBikeBD"
          width={120}
          height={40}
          className="h-12 w-auto object-contain"
        />
      </div>

      {isSubmitted ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Password Reset!
            </h1>
            <p className="text-muted-foreground">
              Your password has been successfully updated. You can now log in
              with your new password.
            </p>
          </div>
          <Button
            className="w-full h-12 text-lg font-semibold"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Reset Password
            </h1>
            <p className="text-muted-foreground">
              Enter your new password below. Make sure it&apos;s at least 8
              characters long.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 h-12 text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10 h-12 text-lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </p>
        </>
      )}
    </motion.div>
  );
}
