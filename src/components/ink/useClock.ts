"use client";

import { useEffect, useState } from "react";

/* Minute-resolution clock; null until mounted so SSR and first paint agree. */
export function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}
