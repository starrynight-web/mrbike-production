"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { login } = useAuthStore();

  useEffect(() => {
    // Simulate processing auth callback
    const processCallback = async () => {
      // const token = searchParams.get("token"); // Unused in mock
      const error = searchParams.get("error");
      const callbackUrl = searchParams.get("callbackUrl") || "/";

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        router.push("/login");
        return;
      }

      // In a real app, we would exchange code/token for session
      // For now, if we hit this page, we assume success or handle mock

      // Artificial delay for UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      // If we have a token (or even if we don't for mock), log them in
      // Ideally this page is hit after Google/Server redirects back
      // For simplicity, we just check if we're not already logged in?
      // Or we just update store with a mock user if one isn't there

      // NOTE: In the real app (NextAuth), the callback is handled by API route
      // This page might be a custom redirect or intermediate loader.
      // If using NextAuth 'pages' config for newUser, this might be relevant.

      // For this mock implementation, let's assume we redirect home
      router.push(callbackUrl);
    };

    processCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
