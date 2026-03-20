import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaustav Roy — KR//OS",
  description:
    "Portfolio of Kaustav Roy — Design Consultant specializing in AI-powered enterprise UX.",
  openGraph: {
    title: "Kaustav Roy — KR//OS",
    description: "Design × AI × Enterprise UX. An interactive OS-themed portfolio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* OS Shell */}
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        {/* Minecraft Terminal */}
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        {/* Detroit: Become Human — futuristic tech */}
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />
        {/* Cyberpunk 2077 — condensed angular */}
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* GTA V — bold block */}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        {/* Red Dead Redemption 2 — western serif */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />
        {/* The Last of Us — typewriter worn */}
        <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet" />
      </head>
      <body className="scanlines h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
