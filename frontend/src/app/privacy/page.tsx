import { SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `Privacy Policy${SEO_DEFAULTS.titleSuffix}`,
    description: "Privacy Policy for MrBikeBD. Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
    return (
        <div className="container py-12 md:py-20 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <p className="text-lg text-muted-foreground italic">Last Updated: January 30, 2026</p>
                    <p className="mt-4">
                        At MrBikeBD, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our website and mobile application.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Information We Collect</h2>
                    <p>We collect information that you provide directly to us, such as when you create an account, post an advertisement, or contact us for support.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Personal Information:</strong> Name, email address, phone number, and location.</li>
                        <li><strong>Listing Data:</strong> Bike details, images, and pricing information.</li>
                        <li><strong>Usage Data:</strong> Information about your interactions with our platform.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
                    <p>We use the collected information for various purposes:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To provide and maintain our Service.</li>
                        <li>To notify you about changes to our Service.</li>
                        <li>To allow you to participate in interactive features.</li>
                        <li>To provide customer support.</li>
                        <li>To gather analysis or valuable information so that we can improve our Service.</li>
                        <li>To monitor the usage of our Service.</li>
                        <li>To detect, prevent and address technical issues.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Data Security</h2>
                    <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Your Data Rights</h2>
                    <p>Under certain circumstances, you have the following data protection rights:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>The right to access, update or delete the information we have on you.</li>
                        <li>The right of rectification.</li>
                        <li>The right to withdraw consent.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                    <p className="font-medium text-primary">privacy@mrbikebd.com</p>
                </section>
            </div>
        </div>
    );
}
