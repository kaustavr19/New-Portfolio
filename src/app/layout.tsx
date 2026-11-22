import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import "@/components/ink/ink.css";

const DESCRIPTION =
  "Portfolio of Kaustav Roy — Design Consultant specializing in AI-powered enterprise UX. An interactive OS-themed experience.";

export const metadata: Metadata = {
  metadataBase: new URL("https://kr-os-folio.vercel.app"),
  title: { default: "Kaustav Roy — KR//OS", template: "%s · Kaustav Roy" },
  description: DESCRIPTION,
  authors: [{ name: "Kaustav Roy", url: "https://kr-os-folio.vercel.app" }],
  openGraph: {
    title: "Kaustav Roy — KR//OS",
    description: DESCRIPTION,
    type: "website",
    siteName: "KR//OS",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaustav Roy — KR//OS",
    description: DESCRIPTION,
  },
};

/* viewport-fit: cover is what makes env(safe-area-inset-*) actually
   report non-zero values on iOS notched phones. Without it, the page
   doesn't extend under the notch/home indicator, and the env() vars
   resolve to 0. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* Tells browsers the site has its own light AND dark designs, so
     Samsung Internet / Chrome "dark mode for websites" leave it alone
     instead of auto-darkening the light theme into muddy greys. */
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" data-theme="ink" data-ink-mode="system" suppressHydrationWarning>
      <head>
        {/* Apply a saved InkOS light/dark override before first paint (no flash). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=localStorage.getItem("kros_ink_mode");document.documentElement.dataset.inkMode=m==="light"||m==="dark"?m:"system"}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* InkOS (default theme) — dot-matrix display, mono data, sans reading.
            The classic game-themed shell's nine families load only when that
            theme is switched on (lib/theme · ensureClassicFonts). */}
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@500;700;900&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="scanlines h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
