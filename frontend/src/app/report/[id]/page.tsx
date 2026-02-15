"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flag,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MessageSquareWarning,
  Copy,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { use } from "react";

const REPORT_REASONS = [
  { value: "fraud", label: "Fraud / Scam", icon: ShieldAlert },
  { value: "spam", label: "Spam", icon: AlertTriangle },
  { value: "duplicate", label: "Duplicate Listing", icon: Copy },
  { value: "incorrect", label: "Incorrect Information", icon: HelpCircle },
  { value: "other", label: "Other", icon: MessageSquareWarning },
];

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);
    try {
      // API call would go here
      // await api.reportListing(id, { reason: selectedReason, description });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
      setIsSubmitted(true);
      toast.success("Report submitted successfully");
    } catch (error) {
      console.error("Report error:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20">
        <div className="bg-background border-b">
          <div className="container py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/used-bike/${id}`}
              className="hover:text-primary transition-colors"
            >
              Listing
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Report</span>
          </div>
        </div>

        <div className="container py-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-none shadow-xl text-center">
              <CardContent className="p-10 space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Report Submitted</h2>
                  <p className="text-muted-foreground">
                    Thank you for helping us keep MrBikeBD safe. We&apos;ll
                    review your report and take appropriate action.
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-semibold"
                  onClick={() => router.push(`/used-bike/${id}`)}
                >
                  Back to Listing
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/used-bike/${id}`}
            className="hover:text-primary transition-colors"
          >
            Listing
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Report</span>
        </div>
      </div>

      <div className="container py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-destructive/10 rounded-xl">
                <Flag className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Report Listing</h1>
            </div>
            <p className="text-muted-foreground">
              Help us maintain a trustworthy marketplace. Please tell us
              what&apos;s wrong with this listing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Reason for Reporting
              </Label>
              <div className="grid gap-3">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setSelectedReason(reason.value)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedReason === reason.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-background hover:border-muted-foreground/20 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        selectedReason === reason.value
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}
                    >
                      <reason.icon
                        className={`h-5 w-5 ${
                          selectedReason === reason.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-medium ${
                        selectedReason === reason.value
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {reason.label}
                    </span>
                    <div
                      className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedReason === reason.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedReason === reason.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Additional Details{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide any additional information that might help us investigate this report..."
                className="min-h-[120px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                disabled={isSubmitting || !selectedReason}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Flag className="mr-2 h-5 w-5" />
                )}
                Submit Report
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
