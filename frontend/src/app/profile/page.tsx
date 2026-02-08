import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
    title: `My Profile${SEO_DEFAULTS.titleSuffix}`,
    description: "Manage your listings, wishlist, and account settings on MrBikeBD.",
    robots: {
        index: false, // Don't index profile pages
        follow: false,
    },
};

export default function ProfilePage() {
    return <ProfileClient />;
}
