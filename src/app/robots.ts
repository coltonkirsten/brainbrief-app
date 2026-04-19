import type { MetadataRoute } from "next";

/**
 * robots.txt — tells search engine crawlers what to index.
 *
 * All public pages are allowed. Auth pages, API routes, and
 * dashboard are disallowed since they require authentication
 * or produce non-indexable content.
 *
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are
 * explicitly allowed. 69% of sites block these — by allowing
 * them, our 97 topic pages + 14 blog posts become citable
 * in AI search results (ChatGPT, Perplexity, Claude).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow all public pages
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
      // AI crawlers — explicitly allowed for AI search citation
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: "https://www.brainbrief.app/sitemap.xml",
  };
}
