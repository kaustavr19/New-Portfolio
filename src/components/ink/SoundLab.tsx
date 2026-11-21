"use client";

import { useEffect, useState } from "react";
import { useA11y } from "@/lib/a11y";
import {
  SOUND_LAYERS,
  audioEngines,
  birdChirp,
  closeStrayAudio,
  stopAllAudio,
  getLayers,
  setLayer,
  starTwinkle,
  startInk,
  thunder,
  uiClose,
  uiOpen,
  uiReady,
  uiThock,
  uiTick,
  type SoundLayer,
} from "@/lib/ink-sound";
import { SectionHead, SwitchRow } from "./ui";

/* Sound lab — switch each layer of the Ink soundscape on/off, play any
   event on demand, and see every audio engine on the page (a stray one
   left over from a hot reload keeps playing until it's closed). */
export default function SoundLab() {
  const a11y = useA11y();
  const [layers, setLayers] = useState(getLayers);
  const [engines, setEngines] = useState(audioEngines);

  useEffect(() => {
    const id = setInterval(() => setEngines(audioEngines()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggle = (id: SoundLayer) => {
    setLayer(id, !layers[id]);
    setLayers(getLayers());
  };

  const play = (fn: () => void) => {
    startInk();
    fn();
  };

  const running = engines.filter((e) => e.state === "running");
  const strays = engines.filter((e) => !e.current && e.state !== "closed");

  return (
    <section>
      <SectionHead as="h3">Sound lab</SectionHead>
      <p className="ink-meta" style={{ marginBottom: 12 }}>
        Switch layers off one by one to find a sound. Ambient layers need Ambience on; UI sounds need Sound effects on. Switches reset on reload. If you still hear something with every switch off and only one engine listed, it&apos;s coming from another tab or from audio started before your last hard reload.
      </p>

      <div className="ink-raised" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="ink-label">
            Audio engines · <span className={running.length > 1 ? "ink-red" : ""}>{running.length} running</span>
          </span>
          <button type="button" className="ink-pill" onClick={() => { stopAllAudio(); setEngines(audioEngines()); }}>
            Stop all audio
          </button>
          {strays.length > 0 && (
            <button type="button" className="ink-pill" onClick={() => { closeStrayAudio(); setEngines(audioEngines()); }}>
              Close {strays.length} stray
            </button>
          )}
        </div>
        <ul style={{ listStyle: "none", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {engines.length === 0 && <li className="ink-meta">None yet — click anywhere once to start audio.</li>}
          {engines.map((e, i) => (
            <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
              <span>
                {e.label}
                {e.current && <span className="ink-meta"> · current</span>}
                {!e.current && e.label.startsWith("InkOS") && e.state !== "closed" && <span className="ink-meta ink-red"> · stray</span>}
              </span>
              <span className={`ink-label ${e.state === "running" ? "ink-live" : ""}`}>{e.state}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0 28px" }}>
        <SwitchRow label="Ambience (master)" hint="Every ambient layer below" checked={a11y.ambience} onChange={() => a11y.toggle("ambience")} />
        <SwitchRow label="Sound effects (master)" hint="UI sounds" checked={a11y.soundEffects} onChange={() => a11y.toggle("soundEffects")} />
        {SOUND_LAYERS.map((l) => (
          <SwitchRow key={l.id} label={l.label} hint={l.hint} checked={layers[l.id]} onChange={() => toggle(l.id)} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <span className="ink-label" style={{ alignSelf: "center", marginRight: 4 }}>Play</span>
        <button type="button" className="ink-pill" onClick={() => play(() => starTwinkle(true))}>Star</button>
        <button type="button" className="ink-pill" onClick={() => play(() => birdChirp(true))}>Bird</button>
        <button type="button" className="ink-pill" onClick={() => play(() => thunder(true))}>Thunder</button>
        <button type="button" className="ink-pill" onClick={() => play(uiOpen)}>Open</button>
        <button type="button" className="ink-pill" onClick={() => play(uiClose)}>Close</button>
        <button type="button" className="ink-pill" onClick={() => play(uiTick)}>Tick</button>
        <button type="button" className="ink-pill" onClick={() => play(uiThock)}>Thock</button>
        <button type="button" className="ink-pill" onClick={() => play(uiReady)}>Ready chord</button>
      </div>
    </section>
  );
}
