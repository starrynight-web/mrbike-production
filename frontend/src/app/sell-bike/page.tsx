import { Metadata } from "next";
import { SEO_DEFAULTS } from "@/config/constants";
import { SellBikeWizard } from "./sell-bike-wizard";

export const metadata: Metadata = {
    title: `Sell Your Bike${SEO_DEFAULTS.titleSuffix}`,
    description: "Post a free ad to sell your used motorcycle in Bangladesh. Reach thousands of buyers on MrBikeBD.",
};

export default function SellBikePage() {
    return (
        <main className="container min-h-screen">
            <SellBikeWizard />
        </main>
    );
}
