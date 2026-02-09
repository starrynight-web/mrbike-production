import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/profile/", "/api/", "/login/"],
        },
        sitemap: `${APP_CONFIG.url}/sitemap.xml`,
    };
}
