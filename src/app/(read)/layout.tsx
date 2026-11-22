import Link from "next/link";
import { profile } from "@/data/content";
import KrosMark from "@/components/ink/KrosMark";
import InkModePicker from "@/components/ink/InkModePicker";

/* ──────────────────────────────────────────────────────────
   Server-rendered, indexable pages (/about, /work, /work/[slug]).
   Same content as the OS, as plain documents: what search engines,
   link previews, and visitors arriving from Google see first —
   each one a click away from the full KR//OS experience.

   Styled in InkOS, the default theme. Reuses the reading-mode class
   names so the global print styles (globals.css @media print) apply
   unchanged. The body is overflow:hidden for the OS, so this wrapper
   owns the scrolling.
   ────────────────────────────────────────────────────────── */

export default function ReadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ink reader-mode fixed inset-0 flex flex-col" style={{ background: "var(--ink-bg)" }}>
      <header
        className="reader-mode-chrome flex items-center justify-between flex-shrink-0 gap-4"
        style={{ padding: "14px clamp(16px, 4vw, 28px)", borderBottom: "1px solid var(--ink-line)" }}
      >
        <nav aria-label="Primary" className="flex items-center gap-5">
          <Link href="/" className="ink-dot-900" style={{ fontSize: "var(--dot-s)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <KrosMark size={18} />
            KR//OS
          </Link>
          <Link href="/work" className="ink-label" style={{ color: "var(--ink-fg)", textDecoration: "none" }}>Work</Link>
          <Link href="/about" className="ink-label" style={{ color: "var(--ink-fg)", textDecoration: "none" }}>About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block"><InkModePicker compact /></span>
          <Link href="/" className="ink-pill solid">
            Enter the OS →
          </Link>
        </div>
      </header>

      <div className="reader-mode-body flex-1 overflow-auto" style={{ padding: "48px clamp(16px, 4vw, 28px) 80px" }}>
        <main className="ink-read flex flex-col gap-14" style={{ maxWidth: 760, margin: "0 auto" }}>
          {children}

          <footer className="ink-card" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <span aria-hidden className="ink-glyph" />
            <span className="ink-label ink-live">Next step</span>
            <h2 className="ink-dot-900" style={{ fontSize: "var(--dot-m)", lineHeight: 1.05, margin: "12px 0 8px" }}>
              SEEN ENOUGH TO START A CONVERSATION?
            </h2>
            <p className="ink-body">Send a role, product brief, or difficult workflow. A little context is enough.</p>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 18 }}>
              <a href={`mailto:${profile.social.email}?subject=Portfolio conversation`} className="ink-pill solid">
                Email Kaustav
              </a>
              <a href="/Kaustav_Roy_CV.pdf" target="_blank" rel="noopener noreferrer" className="ink-pill action">
                Resume (PDF) ↗
              </a>
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer me" className="ink-pill action">
                LinkedIn ↗
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
