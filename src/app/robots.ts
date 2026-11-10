import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* AI crawler policy: SEARCH yes, TRAINING no.

   Allowed — crawlers that power AI search answers and the live fetches an
   assistant makes when someone asks about this site. These are what get the
   portfolio cited.

   Blocked — crawlers that collect content for model training. Blocking them
   does NOT affect regular search: Google-Extended and Applebot-Extended are
   opt-out tokens only (Google Search / AI Overviews still use Googlebot;
   Apple search still uses Applebot).

   robots.txt is honoured voluntarily; it's a policy statement, not a lock. */

const AI_SEARCH = [
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // ChatGPT fetching a page for a user
  "Claude-SearchBot", // Claude search index
  "Claude-User", // Claude fetching a page for a user
  "PerplexityBot", // Perplexity search index
  "Perplexity-User", // Perplexity fetching a page for a user
];

const AI_TRAINING = [
  "GPTBot", // OpenAI training
  "ClaudeBot", // Anthropic training
  "anthropic-ai", // legacy Anthropic token
  "Google-Extended", // Gemini / Vertex training opt-out
  "Applebot-Extended", // Apple Intelligence training opt-out
  "CCBot", // Common Crawl (feeds many training sets)
  "Meta-ExternalAgent", // Meta AI training
  "Bytespider", // ByteDance
  "cohere-training-data-crawler",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_SEARCH, allow: "/", disallow: "/api/" },
      { userAgent: AI_TRAINING, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
