"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Chrome,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      {/* Background Image for Mobile (Absolute positioned) */}
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

      {/* Left side: Branding/Image (Hidden on mobile) */}
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
              The Ultimate Destination for{" "}
              <span className="text-primary">Bike Lovers</span>
            </h1>
            <p className="text-xl text-zinc-300">
              Join our community to explore, compare, and find your perfect
              ride. Get exclusive updates and connect with fellow riders.
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

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 lg:p-16 bg-muted/20 md:bg-muted/20 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-background/80 md:bg-transparent p-6 md:p-0 rounded-2xl backdrop-blur-sm md:backdrop-blur-none shadow-xl md:shadow-none border border-white/10 md:border-none">
          <Suspense
            fallback={
              <div className="w-full p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            }
          >
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Email login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  // 2FA states (for admin users)
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpSession, setTotpSession] = useState("");
  const [totpCode, setTotpCode] = useState("");


  const handleGoogleLogin = () => {
    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (superAdminEmail && email.toLowerCase() === superAdminEmail.toLowerCase()) {
      toast.error("Super Admin must log in with email & password.", {
        description: "Google Sign-In is disabled for the Super Admin account."
      });
      return;
    }
    setIsLoading(true);
    signIn("google", { callbackUrl });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    setVerificationError(false);
    try {
      // First call to backend to check password and get 2FA status
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/auth/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        if (data.needs_verification) {
          setVerificationError(true);
          toast.error("Email not verified", {
            description: "Please check your inbox or resend the verification link.",
          });
        } else {
          toast.error(data.error || "Invalid email or password");
        }
        return;
      }

      // Backend returned 2FA requirement
      if (data.requires_2fa) {
        setTotpSession(data.totp_session);
        setRequires2FA(true);
        toast.info("Verification code sent", {
          description: "Please check your registered email for the 6-digit login code.",
        });
        return;
      }

      // No 2FA — proceed with NextAuth sign in
      const result = await signIn("email-password", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid email or password");
      } else {
        toast.success("Successfully logged in!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Email login error:", error);
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      // Normal 2FA Verification during login
      const result = await signIn("verify-2fa", {
        totp_session: totpSession,
        code: totpCode,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid code. Please try again.");
        setTotpCode("");
      } else {
        toast.success("Successfully logged in!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: any) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/auth/resend-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Verification email sent!");
        setVerificationError(false);
      } else {
        toast.error(data.error || "Failed to resend verification link");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Email + Password ── */}
        {!requires2FA && (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Login TO Continue</h1>
              <p className="text-muted-foreground">Sign in with your email and password</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-12 text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              {verificationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex flex-col gap-2">
                  <p>Your email has not been verified yet.</p>
                  <Button
                    variant="link"
                    className="p-0 text-red-700 font-bold justify-start h-auto"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    type="button"
                  >
                    Resend verification link
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-4 text-muted-foreground font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium border-zinc-200 hover:bg-zinc-50"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-5 w-5 text-red-500" />
                Sign in with Google
              </Button>
            </div>

            <p className="mt-10 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        )}

        {/* ── STEP 2: 2FA TOTP Code ── */}
        {requires2FA && (
          <motion.div
            key="totp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
              <p className="text-muted-foreground mt-2 max-w-xs">
                We've sent a 6-digit login code to your registered email address.
              </p>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    className="pl-10 h-14 text-2xl tracking-[0.5em] text-center font-mono"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoFocus
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading || totpCode.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify & Sign In
                    <ShieldCheck className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setRequires2FA(false);
                  setTotpCode("");
                  setTotpSession("");
                }}
                disabled={isLoading}
              >
                ← Back to login
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Lost access to your authenticator?{" "}
              <a href="mailto:contact@mrbikebd.com" className="text-primary hover:underline">
                Contact support
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
