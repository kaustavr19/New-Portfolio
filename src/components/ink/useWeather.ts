"use client";

import { useEffect, useState } from "react";
import type { WeatherKind } from "@/app/api/weather/route";

export type Weather = { temp: number; high: number; low: number; kind: WeatherKind; label: string; isDay: boolean };

/* Preview any sky without waiting for it: ?sky=day | night | cloudy | rain | storm | fog */
const PREVIEW: Record<string, Partial<Weather>> = {
  day: { kind: "clear", label: "Clear", isDay: true },
  night: { kind: "clear", label: "Clear", isDay: false },
  cloudy: { kind: "cloudy", label: "Cloudy", isDay: true },
  rain: { kind: "rain", label: "Rain", isDay: true },
  storm: { kind: "storm", label: "Storm", isDay: false },
  fog: { kind: "fog", label: "Haze", isDay: true },
};
function preview(w: Weather | null): Weather | null {
  if (typeof window === "undefined") return w;
  const sky = new URLSearchParams(window.location.search).get("sky");
  const p = sky ? PREVIEW[sky] : undefined;
  return p ? { temp: 28, high: 31, low: 24, ...w, ...p } as Weather : w;
}

/* One fetch per page load, shared by every caller (widget, wallpaper, lock screen). */
let pending: Promise<Weather | null> | null = null;
function load(): Promise<Weather | null> {
  pending ??= fetch("/api/weather")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d?.ok ? (d as Weather) : null))
    .catch(() => null)
    .then(preview);
  return pending;
}

export function useWeather(): Weather | null {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    let live = true;
    load().then((v) => live && setW(v));
    return () => {
      live = false;
    };
  }, []);
  return w;
}
