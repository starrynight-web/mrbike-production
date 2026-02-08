"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bike, Loader2, Chrome } from "lucide-react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/store";
import { toast } from "sonner";
import Link from "next/link";

export default function RegistrationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </Card>
        }
      >
        <RegistrationContent />
      </Suspense>
    </div>
  );
}

function RegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const mockRegisterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleMockRegister = (e?: React.FormEvent, isMockData = false) => {
    if (e) e.preventDefault();

    if (!isMockData && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    // Simulate API delay
    mockRegisterTimeoutRef.current = setTimeout(() => {
      const userData = isMockData
        ? {
            id: "user-123",
            email: "demo@mrbikebd.com",
            name: "Demo User",
            role: "user" as const,
          }
        : {
            id: `user-${Date.now()}`,
            email: email,
            name: name,
            role: "user" as const,
          };

      login({
        ...userData,
        phoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("Successfully registered!");
      router.push(callbackUrl);
      router.refresh();
    }, 1000);
  };

  const handleGoogleRegister = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Bike className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Sign up to get started with MrBikeBD</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => handleMockRegister(e, false)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign Up
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs text-center text-muted-foreground uppercase mb-2">
              Development Mode
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleMockRegister(undefined, true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Register with Mock Data (Demo User)
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Creates account: <strong>demo@mrbikebd.com</strong>
            </p>
          </div>
        )}

        <div className="relative my-4">
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
          className="w-full"
          onClick={handleGoogleRegister}
          disabled={isLoading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
