import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/data/content";
import { caseStudies, jsonLd, personJsonLd, SITE_NAME, SITE_URL } from "@/lib/site";
import OSRoot from "@/components/os/OSRoot";

/* Server component. The OS shell (OSRoot) is client-only, so on its own
   the server HTML is just a <title>. This adds the same content as a real,
   linked document: crawlers and link unfurlers can read it, and screen-
   reader / keyboard users get a direct route to the readable pages.
   It's visually hidden (not display:none) and mirrors what the OS shows. */

export const metadata: Metadata = {
  alternates: { canonical: "/", types: { "text/markdown": "/index.md" } },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  author: { "@id": `${SITE_URL}/#person` },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([personJsonLd, websiteJsonLd]) }} />

      {/* First tab stop: becomes visible on keyboard focus */}
      <Link
        href="/work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2"
        style={{ zIndex: 10000, background: "#4fc3f7", color: "#0a0a0a", fontFamily: "'Share Tech Mono', monospace", fontSize: 12 }}
      >
        Skip to readable portfolio
      </Link>

      <div className="sr-only">
        <h1>
          {profile.name} — {profile.designation}, {profile.tagline}
        </h1>
        <p>{profile.bio}</p>
        <nav aria-label="Readable portfolio">
          <h2>Case studies</h2>
          <ul>
            {caseStudies.map((p) => (
              <li key={p.id}>
                <Link href={`/work/${p.id}`}>{p.name}</Link> — {p.tagline}
              </li>
            ))}
          </ul>
          <ul>
            <li><Link href="/work">All work</Link></li>
            <li><Link href="/about">About, experience &amp; capabilities</Link></li>
            <li><a href="/Kaustav_Roy_CV.pdf">Resume (PDF)</a></li>
            <li><a href={profile.social.linkedin}>LinkedIn</a></li>
          </ul>
        </nav>
      </div>

      <OSRoot />
    </>
  );
}
