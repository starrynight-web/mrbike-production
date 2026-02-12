import { SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service${SEO_DEFAULTS.titleSuffix}`,
  description:
    "Terms and conditions for using MrBikeBD platform in Bangladesh.",
};

import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/50 border-b relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
          <FileText size={400} />
        </div>
        <div className="w-full px-4 md:px-8 py-12 relative z-10">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-left">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg text-left">
              Terms and conditions for using MrBikeBD platform in Bangladesh.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full px-4 md:px-8 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-left">
          <section>
            <p className="text-lg text-muted-foreground italic">
              Version 1.0 - Last Updated: January 30, 2026
            </p>
            <p className="mt-4 font-medium">
              Please read these terms and conditions carefully before using
              MrBikeBD.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
            <p>
              By accessing or using MrBikeBD, you agree to be bound by these
              Terms of Service. If you do not agree to any part of the terms,
              then you do not have permission to access the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. Failure to
              do so constitutes a breach of the Terms, which may result in
              immediate termination of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. Advertisements & Listings</h2>
            <p>
              Users are responsible for the content they post. MrBikeBD does not
              guarantee the accuracy, integrity, or quality of user-submitted
              advertisements. We reserve the right, but have no obligation, to
              monitor and review any content.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only motorcycles may be listed.</li>
              <li>Misleading information will result in ad removal.</li>
              <li>
                Spam or fraudulent activities will lead to permanent bans.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Fees and Payments</h2>
            <p>
              Basic listings are currently free. Premium features and
              subscriptions are available and are subject to the pricing
              specified on our platform. All payments are non-refundable unless
              stated otherwise.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
            <p>
              In no event shall MrBikeBD, nor its directors, employees, or
              partners, be liable for any indirect, incidental, special,
              consequential or punitive damages, including without limitation,
              loss of profits, data, or other intangible losses, resulting from
              your use of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">6. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of Bangladesh, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">7. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="font-medium text-primary">legal@mrbikebd.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
