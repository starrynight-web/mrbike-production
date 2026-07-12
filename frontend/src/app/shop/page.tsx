import { redirect } from "next/navigation";

/**
 * /shop (root) has no content — redirect to /dealers
 * which is the proper shop/dealer listing page.
 */
export default function ShopIndexPage() {
  redirect("/dealers");
}
