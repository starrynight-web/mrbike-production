"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop component - ensures the window scrolls to top on navigation.
 * Next.js App Router usually handles this, but in some sticky header layouts
 * and certain navigation patterns, it may fail. This component provides an
 * explicit override.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // We use transition 'instant' to avoid jarring movements during page transitions
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}
