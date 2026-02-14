"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Bike,
  Loader2,
  Chrome,
  Phone,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
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
import { api } from "@/lib/api-service";
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
            <span className="text-2xl font-bold tracking-tight">MrBikeBD</span>
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
              <Card className="w-full p-8 border-none shadow-none bg-transparent">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </Card>
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
      toast.error("Please enter a valid phone number (e.g., 017XXXXXXXX)");
      return;
    }

    setIsLoading(true);
    try {
      await api.sendOtp(phone);
      toast.success("OTP sent successfully!");
      setStep("otp");
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error("Failed to send OTP. Please try again.");
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
      const result = await signIn("credentials", {
        phone,
        otp,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        toast.error("Invalid OTP or verification failed");
      } else {
        toast.success("Successfully logged in!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
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
      console.error("Demo login error:", error);
      toast.error("An error occurred during demo login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("otp", {
        phone: "01999999999",
        otp: "123456",
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Admin login failed");
      } else {
        toast.success("Logged in as Admin!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("An error occurred during admin login");
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
        <h2 className="text-2xl font-bold">MrBikeBD</h2>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {step === "phone" ? "Welcome Back" : "Verify Phone"}
        </h1>
        <p className="text-muted-foreground">
          {step === "phone"
            ? "Sign in with your phone number to continue"
            : `Enter the 6-digit code we sent to ${phone}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="pl-10 h-12 text-lg"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
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
                  <>
                    Send OTP
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {process.env.NODE_ENV === "development" && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    Demo User
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleAdminLogin}
                    disabled={isLoading}
                  >
                    Admin
                  </Button>
                </div>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="h-14 text-center text-2xl tracking-[0.5em] font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Verify & Sign In"
                )}
              </Button>
              <button
                type="button"
                className="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setStep("phone")}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Phone Number
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </a>
        .
      </p>
    </motion.div>
  );
}
