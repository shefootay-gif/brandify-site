import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["sharp", "pg"],
  // Uploaded files are runtime data, never part of the server bundle.
  outputFileTracingExcludes: { "*": ["storage/**", "docs/**", "*.otf", "*.jpeg"] },
  turbopack: {
    // The local storage driver reads runtime upload paths by design; its
    // output is excluded from tracing above.
    ignoreIssue: [{ path: "**/src/server/storage/**", title: /Dynamic filesystem access/ }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ar",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Browsers request /favicon.ico directly; serve the generated app icon.
    return [{ source: "/favicon.ico", destination: "/icon.png" }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
