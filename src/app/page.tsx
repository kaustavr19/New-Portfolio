"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { A11yProvider } from "@/lib/a11y";
import { DeviantProvider } from "@/lib/deviant";
import { ExperimentsProvider } from "@/lib/experiments";
import { ReaderModeProvider } from "@/lib/reader-mode";
import { useIsMobile } from "@/lib/use-is-mobile";
import ExperimentLayer from "@/components/experiments/ExperimentLayer";

const BootScreen = dynamic(() => import("@/components/os/BootScreen"), { ssr: false });
const Desktop = dynamic(() => import("@/components/os/Desktop"), { ssr: false });
const MobileOS = dynamic(() => import("@/components/os/MobileOS"), { ssr: false });
const DeviantOverlay = dynamic(() => import("@/components/os/DeviantOverlay"), { ssr: false });
const AmbientAudio = dynamic(() => import("@/components/os/AmbientAudio"), { ssr: false });
const ReaderMode = dynamic(() => import("@/components/os/ReaderMode"), { ssr: false });

const BOOT_KEY = "kros_booted";

export default function Home() {
  const isMobile = useIsMobile();
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
        <DeviantProvider>
          <ReaderModeProvider>
            <div className="fixed inset-0 overflow-hidden">
              {isMobile ? (
                <MobileOS />
              ) : !booted ? (
                <BootScreen onComplete={handleBootComplete} />
              ) : (
                <Desktop />
              )}
              <DeviantOverlay />
              {/* WebGL experiments — render nothing unless a flag is on */}
              <ExperimentLayer />
              {/* Galactic ambient hum (gesture-gated, gain follows the a11y pref) */}
              <AmbientAudio />
              {/* Site-wide plain-text reading view — About/Experience/Projects as one document */}
              <ReaderMode />
            </div>
          </ReaderModeProvider>
        </DeviantProvider>
      </ExperimentsProvider>
    </A11yProvider>
  );
}
