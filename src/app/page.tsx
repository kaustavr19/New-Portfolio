"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const BootScreen = dynamic(() => import("@/components/os/BootScreen"), { ssr: false });
const Desktop = dynamic(() => import("@/components/os/Desktop"), { ssr: false });

const BOOT_KEY = "kros_booted";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check session cache on mount — refreshes within the same session skip boot
  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_KEY) === "1") {
        setBooted(true);
      }
    } catch {
      // sessionStorage unavailable (e.g. SSR / private mode) — show boot
    }
    setChecked(true);
  }, []);

  const handleBootComplete = () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // ignore
    }
    setBooted(true);
  };

  if (!checked) return null;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {!booted && <BootScreen onComplete={handleBootComplete} />}
      {booted && <Desktop />}
    </div>
  );
}
