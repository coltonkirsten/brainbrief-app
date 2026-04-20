import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/forgot-password",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/pricing",
        destination: "/subscribe",
        permanent: false,
      },
      {
        // Short-lived slug that went live briefly on Apr 20, 2026 during the
        // post #16 publish sequence — redirect to the final canonical slug
        // to preserve IndexNow submissions and any early external references.
        source: "/blog/we-generated-1000-ai-briefings",
        destination: "/blog/what-1000-ai-briefings-taught-us",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com https://generativelanguage.googleapis.com",
              "frame-src https://js.stripe.com https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
