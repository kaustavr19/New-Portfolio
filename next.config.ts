import type { NextConfig } from "next";

/* Markdown for AI agents (see src/app/md/[...path]/route.ts).
   beforeFiles, not the default afterFiles: these pages are static, so an
   afterFiles rewrite would never run — the HTML page would match first. */
const PAGES: { source: string; md: string }[] = [
  { source: "/", md: "/md/index" },
  { source: "/about", md: "/md/about" },
  { source: "/work", md: "/md/work" },
  { source: "/work/:slug", md: "/md/work/:slug" },
];

const acceptsMarkdown = [{ type: "header" as const, key: "accept", value: "(.*)text/markdown(.*)" }];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Explicit .md URLs ("." is escaped — it's a regex char in path patterns)
        { source: "/index\\.md", destination: "/md/index" },
        { source: "/about\\.md", destination: "/md/about" },
        { source: "/work\\.md", destination: "/md/work" },
        { source: "/work/:slug\\.md", destination: "/md/work/:slug" },
        // Content negotiation: same URL, Markdown when the client asks for it
        ...PAGES.map(({ source, md }) => ({ source, destination: md, has: acceptsMarkdown })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
