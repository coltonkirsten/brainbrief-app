import type { MetadataRoute } from "next";

/**
 * robots.txt — tells search engine crawlers what to index.
 *
 * All public pages are allowed. Auth pages, API routes, and
 * dashboard are disallowed since they require authentication
 * or produce non-indexable content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/signup",
          "/reset-password",
          "/auth/",
          "/feedback",
          "/unsubscribe",
        ],
      },
    ],
    sitemap: "https://www.brainbrief.app/sitemap.xml",
  };
}
