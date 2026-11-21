"use client";

import { useEffect } from "react";
import { useA11y } from "@/lib/a11y";
import { setAmbience, setInkWeather, startInk, stopInk, uiTick } from "@/lib/ink-sound";
import { useWeather } from "./useWeather";

/* The site's one ambience, for every theme.
   Builds the Ink sound graph on the first gesture (autoplay rule), keeps
   it in step with the ambience pref and the Kolkata weather, and gives
   every toggle, tab, radio and dock chip a dry relay tick. */
export default function InkAmbientAudio() {
  const { ambience, soundEffects } = useA11y();
  const weather = useWeather();

  useEffect(() => {
    const start = () => {
      startInk();
      detach();
    };
    const detach = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start);
    return () => {
      detach();
      stopInk();
    };
  }, []);

  useEffect(() => setAmbience(ambience), [ambience]);

  useEffect(() => {
    if (weather) setInkWeather(weather.kind, weather.isDay);
  }, [weather]);

  useEffect(() => {
    if (!soundEffects) return;
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest(".ink-seg button, [role=switch], [role=tab], [role=radio], [data-tick]")) uiTick();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [soundEffects]);

  return null;
}
