"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { A11yProvider } from "@/lib/a11y";
import { DeviantProvider } from "@/lib/deviant";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { ExperimentsProvider } from "@/lib/experiments";
import { ReaderModeProvider } from "@/lib/reader-mode";
import { useIsMobile } from "@/lib/use-is-mobile";
import ExperimentLayer from "@/components/experiments/ExperimentLayer";

/* The interactive OS shell — moved out of app/page.tsx (unchanged) so the
   page itself can be a server component that also ships real, indexable
   HTML alongside it. */

const BootScreen = dynamic(() => import("@/components/os/BootScreen"), { ssr: false });
const Desktop = dynamic(() => import("@/components/os/Desktop"), { ssr: false });
const MobileOS = dynamic(() => import("@/components/os/MobileOS"), { ssr: false });
const DeviantOverlay = dynamic(() => import("@/components/os/DeviantOverlay"), { ssr: false });
const ReaderMode = dynamic(() => import("@/components/os/ReaderMode"), { ssr: false });
const InkBoot = dynamic(() => import("@/components/ink/InkBoot"), { ssr: false });
const InkDesktop = dynamic(() => import("@/components/ink/InkDesktop"), { ssr: false });
const InkMobile = dynamic(() => import("@/components/ink/InkMobile"), { ssr: false });
const InkAmbientAudio = dynamic(() => import("@/components/ink/InkAmbientAudio"), { ssr: false });

const BOOT_KEY = "kros_booted";

/* Picks the shell for the active theme. Ink is the default; classic and
   deviant share the original game-themed shell. */
function Shell({ booted, onBootComplete }: { booted: boolean; onBootComplete: () => void }) {
  const isMobile = useIsMobile();
  const { theme, ready } = useTheme();
  if (!ready) return null;
  if (theme === "ink") {
    return isMobile ? <InkMobile /> : !booted ? <InkBoot onComplete={onBootComplete} /> : <InkDesktop />;
  }
  return isMobile ? <MobileOS /> : !booted ? <BootScreen onComplete={onBootComplete} /> : <Desktop />;
}

/* WebGL effects belong to the classic look; Ink renders without them. */
function ClassicOnlyLayers() {
  const { theme } = useTheme();
  if (theme === "ink") return null;
  return (
    <>
      <DeviantOverlay />
      <ExperimentLayer />
    </>
  );
}

export default function OSRoot() {
  const [booted, setBooted] = useState(false);
  const [checked, setChecked] = useState(false);

  // Returning visitors (any prior visit, not just this tab session) skip the boot replay
  useEffect(() => {
    try {
      if (localStorage.getItem(BOOT_KEY) === "1") {
        setBooted(true);
      }
    } catch {
      // localStorage unavailable (e.g. SSR / private mode) — show boot
    }
    setChecked(true);
  }, []);

  const handleBootComplete = () => {
    try {
      localStorage.setItem(BOOT_KEY, "1");
    } catch {
      // ignore
    }
    setBooted(true);
  };

  if (!checked) return null;

  /* Mobile flow: MobileOS owns its own lock screen (the boot-replacement
     on phones). We deliberately skip the desktop BootScreen on mobile so
     phone users get one tap to home, not a 3s chunk loader animation.

     Desktop flow: BootScreen plays the chunk loader before handing off
     to the Desktop shell, same as before. */
  return (
    <A11yProvider>
      <ExperimentsProvider>
        <ThemeProvider>
        <DeviantProvider>
          <ReaderModeProvider>
            <div className="fixed inset-0 overflow-hidden">
              <Shell booted={booted} onBootComplete={handleBootComplete} />
              {/* Deviant wash + WebGL experiments — classic themes only */}
              <ClassicOnlyLayers />
              {/* Ambience: calm room tone + weather (gesture-gated, follows the a11y pref) */}
              <InkAmbientAudio />
              {/* Site-wide plain-text reading view — About/Experience/Projects as one document */}
              <ReaderMode />
            </div>
          </ReaderModeProvider>
        </DeviantProvider>
        </ThemeProvider>
      </ExperimentsProvider>
    </A11yProvider>
  );
}
