"use client";

import { useState, useRef, Suspense } from "react";
import { Bike, Loader2, ArrowLeft } from "lucide-react";
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
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </Card>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}

function ForgotPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const mockResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMockReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    mockResetTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success(`Password reset link sent to ${email}`);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Bike className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSubmitted ? (
          <form onSubmit={handleMockReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@mrbikebd.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
              If an account exists for <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-center border-t pt-4 mt-4">
                <p className="text-muted-foreground mb-2">Development Only:</p>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/reset-password?token=mock-token-123">
                    Open Mock Reset Link
                  </Link>
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
