"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const BootScreen = dynamic(() => import("@/components/os/BootScreen"), { ssr: false });
const Desktop = dynamic(() => import("@/components/os/Desktop"), { ssr: false });

export default function Home() {
  const [booted, setBooted] = useState(false);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      {booted && <Desktop />}
    </div>
  );
}
