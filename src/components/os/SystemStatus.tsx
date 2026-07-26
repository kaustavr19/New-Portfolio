"use client";

import { useEffect, useRef, useState } from "react";

const MONO = "'Share Tech Mono', monospace";

/* ──────────────────────────────────────────────────────────
   System status — ambient taskbar flavor. An uptime counter, two
   fake CPU/network sparklines, and the real last commit pulled from
   GitHub. All ticking is throttled and paused on document.hidden,
   same discipline as the rest of the OS's background loops.
   ────────────────────────────────────────────────────────── */

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function useUptime(): string {
  const startRef = useRef(0);
  const [label, setLabel] = useState("00:00:00");

  useEffect(() => {
    startRef.current = Date.now();
    let id: ReturnType<typeof setInterval> | null = null;
    const tick = () => setLabel(formatUptime(Date.now() - startRef.current));
    const start = () => {
      if (id === null) id = setInterval(tick, 1000);
    };
    const stop = () => {
      if (id !== null) { clearInterval(id); id = null; }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    tick();
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return label;
}

/* Simulated metric — a gentle random walk clamped to [floor, ceil],
   sampled at a low cadence. Purely decorative; not a real reading. */
function useFakeMetric(seed: number, floor: number, ceil: number, intervalMs = 1400): number[] {
  const valueRef = useRef((floor + ceil) / 2);
  const [samples, setSamples] = useState<number[]>(() => Array(16).fill(valueRef.current));

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const step = () => {
      const drift = (Math.random() - 0.5) * (ceil - floor) * 0.35;
      valueRef.current = Math.min(ceil, Math.max(floor, valueRef.current + drift));
      setSamples((prev) => [...prev.slice(1), valueRef.current]);
    };
    const start = () => {
      if (id === null) id = setInterval(step, intervalMs);
    };
    const stop = () => {
      if (id !== null) { clearInterval(id); id = null; }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [seed, floor, ceil, intervalMs]);

  return samples;
}

function Sparkline({ samples, color, min, max }: { samples: number[]; color: string; min: number; max: number }) {
  const w = 36, h = 14;
  const range = max - min || 1;
  const points = samples
    .map((v, i) => {
      const x = (i / (samples.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
    </svg>
  );
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type CommitInfo = { sha: string; message: string; date: string | null; url: string };

function useLastCommit(): CommitInfo | null {
  const [commit, setCommit] = useState<CommitInfo | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/last-commit")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.ok) {
          setCommit({ sha: data.sha, message: data.message, date: data.date, url: data.url });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return commit;
}

export default function SystemStatus() {
  const uptime = useUptime();
  const cpu = useFakeMetric(1, 8, 62);
  const net = useFakeMetric(2, 4, 88);
  const commit = useLastCommit();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="hidden md:flex items-center gap-3 px-2 py-1 transition-all hover:bg-white/5"
        style={{ border: "none", background: "transparent", cursor: "pointer" }}
        title="System status"
        aria-label="System status"
        aria-expanded={open}
      >
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#6a6a7e", letterSpacing: "0.08em" }}>
          UP {uptime}
        </span>
        <Sparkline samples={cpu} color="#4fc3f7" min={0} max={100} />
        <Sparkline samples={net} color="#a4c639" min={0} max={100} />
      </button>

      {open && (
        <div
          className="absolute right-0"
          style={{
            bottom: "100%",
            marginBottom: 8,
            width: 260,
            background: "rgba(10, 16, 32, 0.96)",
            border: "1px solid rgba(79,195,247,0.25)",
            borderRadius: 4,
            padding: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#4fc3f788", letterSpacing: "0.3em", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid rgba(79,195,247,0.15)" }}>
            SYSTEM STATUS
          </div>

          <div className="flex flex-col gap-2" style={{ marginBottom: 12 }}>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#8a8a9c", letterSpacing: "0.1em" }}>UPTIME</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#e0e0e8" }}>{uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#8a8a9c", letterSpacing: "0.1em" }}>CPU</span>
              <Sparkline samples={cpu} color="#4fc3f7" min={0} max={100} />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#8a8a9c", letterSpacing: "0.1em" }}>NET</span>
              <Sparkline samples={net} color="#a4c639" min={0} max={100} />
            </div>
          </div>

          <div style={{ paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#4a4a5a", letterSpacing: "0.15em", marginBottom: 6 }}>
              LAST COMMIT
            </div>
            {commit ? (
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:opacity-80"
                style={{ textDecoration: "none" }}
              >
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#e0e0e8", lineHeight: 1.4 }}>
                  <span style={{ color: "#4fc3f7" }}>{commit.sha}</span> {commit.message}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#6a6a7e", marginTop: 3 }}>
                  {relativeTime(commit.date)}
                </div>
              </a>
            ) : (
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#4a4a5a" }}>—</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
