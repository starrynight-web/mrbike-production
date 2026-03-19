import { JsonLd } from "@/components/seo/JsonLd";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";
import { FAQClient } from "./faq-client";

export const metadata: Metadata = {
  title: `Frequently Asked Questions${SEO_DEFAULTS.titleSuffix}`,
  description: "Find answers to commonly asked questions about buying, selling, and managing your motorcycle listings on MrBikeBD.",
  alternates: {
    canonical: `${APP_CONFIG.url}/faqs`,
  },
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: "Buying a Bike",
      questions: [
        {
          q: "How do I contact a seller?",
          a: "You can find the seller's phone number or email by clicking the 'Contact Seller' button on any used bike listing page. You'll need to be logged in to view their contact details.",
        },
        {
          q: "Are the prices negotiable?",
          a: "Negotiation depends entirely on the individual seller. We recommend contacting the seller directly to discuss the price and set up a physical inspection.",
        },
        {
          q: "How do I verify a bike's condition?",
          a: "We recommend meeting in a safe, public place and bring a trusted mechanic to inspect the bike. Check the chassis number, engine condition, and valid paperwork before making any payment.",
        },
      ],
    },
    {
      title: "Selling a Bike",
      questions: [
        {
          q: "How much does it cost to list a bike?",
          a: "Listing is completely free for your first two bikes! If you want to list more or get more visibility, check out our premium selling plans.",
        },
        {
          q: "How long does it take for my listing to go live?",
          a: "For security reasons, our moderation team reviews all listings. This process typically takes between 2 to 6 hours.",
        },
        {
          q: "How do I make my bike sell faster?",
          a: "High-quality photos from multiple angles, a competitive price, and an honest description are key. You can also upgrade to a Silver or Gold plan to get featured at the top of search results.",
        },
      ],
    },
    {
      title: "Account & Safety",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Go to the login page and click 'Forgot Password'. We'll send a password reset link to your registered email address.",
        },
        {
          q: "Is MrBikeBD involved in the payment process?",
          a: "No, MrBikeBD only provides the platform for buyers and sellers to meet. We never handle payments for the bikes themselves. Never pay anyone before seeing the bike in person.",
        },
      ],
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqCategories.flatMap((cat) =>
      cat.questions.map((q) => ({
        "@type": "Question",
        "name": q.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.a,
        },
      }))
    ),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <FAQClient faqCategories={faqCategories} />
    </>
  );
}
