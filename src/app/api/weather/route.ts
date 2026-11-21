import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* Current weather in Kolkata for the InkOS clock widget and wallpaper.
   Open-Meteo needs no key; responses are cached for 30 minutes so visitors
   never call the weather service directly and nothing about them is sent. */
export const revalidate = 1800;

const KOLKATA = { lat: 22.5726, lon: 88.3639 };

export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "rain" | "storm";

/* WMO weather codes → a small set the UI can draw. */
function kindFor(code: number): WeatherKind {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 95) return "storm";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 71 && code <= 86)) return "rain";
  return "cloudy";
}

const LABEL: Record<WeatherKind, string> = {
  clear: "Clear",
  partly: "Partly cloudy",
  cloudy: "Cloudy",
  fog: "Haze",
  rain: "Rain",
  storm: "Storm",
};

export async function GET() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${KOLKATA.lat}&longitude=${KOLKATA.lon}` +
      `&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
    const d = await res.json();
    const kind = kindFor(Number(d.current?.weather_code ?? 3));
    return NextResponse.json({
      ok: true,
      temp: Math.round(d.current?.temperature_2m),
      high: Math.round(d.daily?.temperature_2m_max?.[0]),
      low: Math.round(d.daily?.temperature_2m_min?.[0]),
      kind,
      label: LABEL[kind],
      isDay: d.current?.is_day === 1,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
