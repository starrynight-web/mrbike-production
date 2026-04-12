import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/mrbikebd-sys-admin/",
                    "/profile/",
                    "/api/",
                    "/login/",
                    "/register/",
                    "/dashboard/",
                    "/sell-bike",
                    "/verify-email",
                    "/forgot-password",
                    "/reset-password",
                ],
                crawlDelay: 1,
            },
            {
                userAgent: "Googlebot-News",
                allow: "/news/",
            },
            {
                userAgent: "Googlebot-Image",
                allow: "/",
            },
        ],
        sitemap: `${APP_CONFIG.url}/sitemap.xml`,
    };
}
