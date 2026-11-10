import Link from "next/link";
import { profile } from "@/data/content";
import { READER_SANS } from "@/components/reader/blocks";

/* ──────────────────────────────────────────────────────────
   Server-rendered, indexable pages (/about, /work, /work/[slug]).
   Same content as the OS, as plain documents: what search engines,
   link previews, and visitors arriving from Google see first —
   each one a click away from the full KR//OS experience.

   Reuses the reading-mode class names so the global print styles
   (globals.css @media print) apply here unchanged. The body is
   overflow:hidden for the OS, so this wrapper owns the scrolling.
   ────────────────────────────────────────────────────────── */

const MONO = "'Share Tech Mono', monospace";

const navLink: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  letterSpacing: "0.16em",
  color: "#ffffffaa",
  textDecoration: "none",
};

export default function ReadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="reader-mode fixed inset-0 flex flex-col" style={{ background: "#0a0a0a" }}>
      <header
        className="reader-mode-chrome flex items-center justify-between flex-shrink-0 gap-4"
        style={{ padding: "14px 28px", borderBottom: "1px solid #ffffff1a" }}
      >
        <nav aria-label="Primary" className="flex items-center gap-6">
          <Link href="/" style={{ ...navLink, color: "#4fc3f7", letterSpacing: "0.2em" }}>
            KR//OS
          </Link>
          <Link href="/work" style={navLink}>WORK</Link>
          <Link href="/about" style={navLink}>ABOUT</Link>
        </nav>
        <Link
          href="/"
          style={{
            ...navLink,
            fontSize: 11,
            color: "#0a0a0a",
            background: "#4fc3f7",
            padding: "8px 14px",
            whiteSpace: "nowrap",
          }}
        >
          ENTER THE OS →
        </Link>
      </header>

      <div className="reader-mode-body flex-1 overflow-auto" style={{ padding: "48px 28px 80px" }}>
        <main className="flex flex-col gap-14" style={{ maxWidth: 720, margin: "0 auto" }}>
          {children}

          <footer style={{ borderTop: "1px solid #ffffff24", paddingTop: 32 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#7ab648", letterSpacing: "0.2em" }}>
              NEXT STEP
            </div>
            <h2 style={{ fontFamily: READER_SANS, fontSize: 26, color: "#fff", margin: "8px 0" }}>
              Seen enough to start a conversation?
            </h2>
            <p style={{ fontFamily: READER_SANS, fontSize: 16, color: "#bdbdc8", lineHeight: 1.6 }}>
              Send a role, product brief, or difficult workflow. A little context is enough.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 16 }}>
              <a
                href={`mailto:${profile.social.email}?subject=Portfolio conversation`}
                style={{ ...navLink, fontSize: 11, color: "#0a0a0a", background: "#7ab648", padding: "10px 14px" }}
              >
                EMAIL KAUSTAV
              </a>
              <a
                href="/Kaustav_Roy_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...navLink, fontSize: 11, color: "#e8e8e8", border: "1px solid #ffffff44", padding: "10px 14px" }}
              >
                RESUME (PDF)
              </a>
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noopener noreferrer me"
                style={{ ...navLink, fontSize: 11, color: "#e8e8e8", border: "1px solid #ffffff44", padding: "10px 14px" }}
              >
                LINKEDIN
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
