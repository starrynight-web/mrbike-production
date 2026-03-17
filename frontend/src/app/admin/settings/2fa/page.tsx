"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ShieldCheck, Shield, AlertTriangle, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api-service";

export default function AdminTwoFactorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [setupStarted, setSetupStarted] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleGetQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/users/auth/setup-2fa/");
      const data = response.data as { message?: string; qr_code?: string; secret?: string };
      if (data.message === "2FA is already enabled") {
        setIs2FAEnabled(true);
        toast.info("2FA is already enabled for your account.");
      } else {
        setQrCode(data.qr_code || null);
        setSecret(data.secret || null);
        setSetupStarted(true);
        toast.success("QR code generated! Scan it with your authenticator app.");
      }
    } catch (error: any) {
      if (error.response?.data?.message === "2FA is already enabled") {
        setIs2FAEnabled(true);
        toast.info("2FA is already active on your account.");
      } else {
        toast.error(error.response?.data?.error || "Failed to generate QR code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error("Please enter the 6-digit code from your authenticator app");
      return;
    }

    setIsVerifying(true);
    try {
      // Use verify-2fa endpoint with a special "setup" session flag
      await api.post("/users/auth/setup-2fa/", { code: verifyCode });
      setSetupComplete(true);
      toast.success("🎉 2FA verified and activated! Your account is now protected.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid code. Please try again.");
      setVerifyCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Secret key copied to clipboard!");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1>
            <p className="text-zinc-400 text-sm">Add an extra layer of security to your admin account</p>
          </div>
        </div>

        {/* Status Card */}
        {is2FAEnabled || setupComplete ? (
          <Card className="bg-green-950/40 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-10 w-10 text-green-400 shrink-0" />
                <div>
                  <h2 className="text-lg font-bold text-green-300">2FA is Active</h2>
                  <p className="text-green-400/80 text-sm mt-1">
                    Your admin account is protected with two-factor authentication. Every login will require a code from your authenticator app.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Warning */}
            <Card className="bg-amber-950/40 border-amber-500/30 mb-6">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300/90 text-sm">
                  2FA is not enabled on your account. Admin accounts must have 2FA enabled for production security.
                </p>
              </CardContent>
            </Card>

            {/* Setup Flow */}
            <Card className="bg-zinc-900/80 border-zinc-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Set Up Authenticator App
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Use Google Authenticator, Authy, or any TOTP-compatible app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!setupStarted ? (
                  <div className="space-y-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                      <p className="text-zinc-300 font-medium text-sm">How it works:</p>
                      <ol className="text-zinc-400 text-sm space-y-1 list-decimal list-inside">
                        <li>Click the button below to generate your QR code</li>
                        <li>Open your authenticator app and scan the QR code</li>
                        <li>Enter the 6-digit code to confirm setup</li>
                        <li>From now on, login will require this code</li>
                      </ol>
                    </div>
                    <Button
                      className="w-full h-12 text-base font-semibold"
                      onClick={handleGetQRCode}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 justify-center">
                      <a
                        href="https://apps.apple.com/app/google-authenticator/id388497605"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Get Google Authenticator (iOS)
                      </a>
                      <span className="text-zinc-600">·</span>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Android
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* QR Code */}
                    {qrCode && (
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-zinc-300 text-center">
                          Scan this QR code with your authenticator app:
                        </p>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                          <Image
                            src={`data:image/png;base64,${qrCode}`}
                            alt="2FA QR Code"
                            width={200}
                            height={200}
                          />
                        </div>
                      </div>
                    )}

                    {/* Secret Key (manual entry fallback) */}
                    {secret && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-400">
                          Can&apos;t scan? Enter this secret key manually in your app:
                        </p>
                        <div className="flex gap-2">
                          <code className="flex-1 bg-zinc-800 px-3 py-2 rounded-lg text-xs text-zinc-300 font-mono break-all">
                            {secret}
                          </code>
                          <Button
                            size="icon"
                            variant="outline"
                            className="shrink-0 border-zinc-700"
                            onClick={copySecret}
                          >
                            {copied ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Verification */}
                    <form onSubmit={handleVerifySetup} className="space-y-4 pt-2 border-t border-zinc-700/50">
                      <p className="text-sm text-zinc-300 font-medium">
                        Verify setup by entering the code from your app:
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="verify-code" className="text-zinc-300">
                          6-Digit Code
                        </Label>
                        <Input
                          id="verify-code"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          placeholder="000000"
                          className="h-14 text-2xl tracking-[0.5em] text-center font-mono bg-zinc-800/50 border-zinc-600 text-white"
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          autoFocus
                          autoComplete="one-time-code"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isVerifying || verifyCode.length !== 6}
                      >
                        {isVerifying ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Activate 2FA
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
