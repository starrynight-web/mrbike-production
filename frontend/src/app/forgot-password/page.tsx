"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/auth/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json();
        toast.error(
          data.detail || "Failed to send reset link. Please try again.",
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      // Still show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

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
              Don&apos;t Worry, <span className="text-primary">We Got You</span>
            </h1>
            <p className="text-xl text-zinc-300">
              It happens to the best of us. Enter your email and we&apos;ll send
              you a link to reset your password.
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
                    Check Your Email
                  </h1>
                  <p className="text-muted-foreground">
                    If an account exists with{" "}
                    <span className="font-semibold text-foreground">
                      {email}
                    </span>
                    , we&apos;ve sent a password reset link. Please check your
                    inbox and spam folder.
                  </p>
                </div>
                <Button className="w-full h-12 text-lg font-semibold" asChild>
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Forgot Password?
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email address and we&apos;ll send you a link to
                    reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        autoFocus
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
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-semibold"
                  >
                    Back to Login
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
