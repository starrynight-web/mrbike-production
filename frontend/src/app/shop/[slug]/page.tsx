import ShopProfileClient from "./shop-profile-client";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Shop Detail - MrBikeBD Marketplace`,
    description: "Browse premium motorcycle listings from verified dealers and sellers in Bangladesh.",
  };
}

export default async function ShopProfilePage({ params }: Props) {
  const { slug } = await params;
  return <ShopProfileClient slug={slug} />;
}
