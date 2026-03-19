import { JsonLd } from "@/components/seo/JsonLd";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";
import { Metadata } from "next";
import { DealersClient } from "./dealers-client";

export const metadata: Metadata = {
  title: `Authorized Dealers${SEO_DEFAULTS.titleSuffix}`,
  description: "Find authorized motorcycle dealers across Bangladesh. Locate official showrooms for Yamaha, Honda, Suzuki, Bajaj, and more in your city.",
  alternates: {
    canonical: `${APP_CONFIG.url}/dealers`,
  },
};

export default function DealersPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Motorcycle Dealers in Bangladesh",
    "description": "Authorized motorcycle showrooms and dealers across major cities in Bangladesh including Dhaka, Chittagong, and Sylhet.",
    "url": `${APP_CONFIG.url}/dealers`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dhaka",
      "addressCountry": "BD"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.8103,
      "longitude": 90.4125
    }
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <DealersClient />
    </>
  );
}
