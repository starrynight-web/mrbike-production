"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Info } from "lucide-react";
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

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const mockVerifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 4) {
      toast.error("Please enter a valid verification code");
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    mockVerifyTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      toast.success("Email verified successfully!");
      router.push("/");
    }, 1500);
  };

  const handleResend = () => {
    toast.info("Verification code resent to your email");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We sent a verification code to your email address. Please enter it
          below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-xs flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              For development, you can enter any 4+ digit code to simulate
              successful verification.
            </p>
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Verify Email
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-sm text-center text-muted-foreground w-full">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            className="text-primary font-medium hover:underline focus:outline-none"
          >
            Resend
          </button>
        </div>
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
