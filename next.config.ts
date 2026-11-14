import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Host-level rewrites for dedicated subdomains:
  // - reviews.tysonlabs.in -> /dashboard
  // - creatorautomation.tysonlabs.in -> /inbox
  async rewrites() {
    const dashboardHost = [{ type: 'host' as const, value: (process.env.DASHBOARD_HOST ?? 'reviews.tysonlabs.in').replace(/\./g, '\\.') }];
    const creatorHost = [{ type: 'host' as const, value: (process.env.CREATOR_AUTOMATION_HOST ?? 'creatorautomation.tysonlabs.in').replace(/\./g, '\\.') }];
    return {
      beforeFiles: [
        { source: '/', has: creatorHost, destination: '/inbox' },
        { source: '/:path((?!api/|_next/|inbox|favicon\\.ico|robots\\.txt|sitemap\\.xml).+)', has: creatorHost, destination: '/inbox/:path' },
        { source: '/', has: dashboardHost, destination: '/dashboard' },
        { source: '/:path((?!api/|_next/|dashboard|favicon\\.ico|robots\\.txt|sitemap\\.xml).+)', has: dashboardHost, destination: '/dashboard/:path' },
        // On other hosts the private dashboard routes do not exist
        { source: '/dashboard/:path*', missing: dashboardHost, destination: '/this-page-does-not-exist' },
        { source: '/dashboard', missing: dashboardHost, destination: '/this-page-does-not-exist' },
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
