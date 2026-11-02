import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The reviews dashboard lives on its own host and is served from /dashboard. The same app and database serve both sites.
  // DASHBOARD_HOST must be the same value at build time (here) and at run time (the dashboard layout). Dots are escaped because has.value is a pattern.
  async rewrites() {
    const host = [{ type: 'host' as const, value: (process.env.DASHBOARD_HOST ?? 'reviews.tysonlabs.in').replace(/\./g, '\\.') }];
    return {
      beforeFiles: [
        { source: '/', has: host, destination: '/dashboard' },
        { source: '/:path((?!api/|_next/|dashboard|favicon\\.ico|robots\\.txt|sitemap\\.xml).+)', has: host, destination: '/dashboard/:path' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    const has = [{ type: 'host' as const, value: (process.env.DASHBOARD_HOST ?? 'reviews.tysonlabs.in').replace(/\./g, '\\.') }];
    return [{
      source: '/:path*', has,
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" }, // nobody may frame the dashboard and trick a click on Approve
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'same-origin' },
        { key: 'Cache-Control', value: 'no-store' },
      ],
    }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
