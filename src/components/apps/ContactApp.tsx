"use client";

import { useState, useEffect } from "react";
import { profile } from "@/data/content";
import { useIsMobile } from "@/lib/use-is-mobile";

const MONO = "'Share Tech Mono', monospace";
const GREEN  = "#00dd00";
const DIM    = "#007a00";
const AMBER  = "#d4a500";
const BG     = "#030d03";
const PANEL  = "#060f06";

function Portrait({
  icon, label, sub, side,
}: {
  icon: string; label: string; sub: string; side: "left" | "right";
}) {
  return (
    <div
      style={{
        width: 108,
        flexShrink: 0,
        background: PANEL,
        borderRight: side === "left"  ? `1px solid ${GREEN}2a` : "none",
        borderLeft:  side === "right" ? `1px solid ${GREEN}2a` : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "0 12px",
      }}
    >
      {/* Face frame with corner brackets */}
      <div style={{ position: "relative", width: 76, height: 76 }}>
        <div
          style={{
            width: "100%", height: "100%",
            border: `1px solid ${GREEN}44`,
            background: "#020802",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34,
          }}
        >
          <i className={`hn hn-${icon}`} style={{ fontSize: 34 }} />
        </div>
        {/* Corner brackets */}
        {[
          { top: -1, left: -1, borderTop: `2px solid ${GREEN}`, borderLeft: `2px solid ${GREEN}` },
          { top: -1, right: -1, borderTop: `2px solid ${GREEN}`, borderRight: `2px solid ${GREEN}` },
          { bottom: -1, left: -1, borderBottom: `2px solid ${GREEN}`, borderLeft: `2px solid ${GREEN}` },
          { bottom: -1, right: -1, borderBottom: `2px solid ${GREEN}`, borderRight: `2px solid ${GREEN}` },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 12, height: 12, ...s }} />
        ))}
      </div>

      {/* Name plate */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN, letterSpacing: "0.12em" }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 8,  color: DIM,   letterSpacing: "0.1em",  marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

/* Smaller variant for the mobile portrait row — same CODEC framing
   but compressed to fit two portraits side-by-side in a 375px viewport. */
function MobilePortrait({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 8, flexShrink: 0 }}>
      <div style={{ position: "relative", width: 60, height: 60 }}>
        <div
          style={{
            width: "100%", height: "100%",
            border: `1px solid ${GREEN}44`,
            background: "#020802",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className={`hn hn-${icon}`} style={{ fontSize: 28 }} />
        </div>
        {[
          { top: -1, left: -1, borderTop: `2px solid ${GREEN}`, borderLeft: `2px solid ${GREEN}` },
          { top: -1, right: -1, borderTop: `2px solid ${GREEN}`, borderRight: `2px solid ${GREEN}` },
          { bottom: -1, left: -1, borderBottom: `2px solid ${GREEN}`, borderLeft: `2px solid ${GREEN}` },
          { bottom: -1, right: -1, borderBottom: `2px solid ${GREEN}`, borderRight: `2px solid ${GREEN}` },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 10, height: 10, ...s }} />
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GREEN, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 8,  color: DIM,   letterSpacing: "0.1em",  marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function ContactApp() {
  const isMobile = useIsMobile();
  const [sent, setSent]       = useState(false);
  const [name, setName]       = useState("");
  const [message, setMessage] = useState("");
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
  };

  // Animated waveform heights
  const wave = Array.from({ length: 55 }, (_, i) => {
    const a = Math.sin((i * 0.45) + tick * 0.25) * 38;
    const b = Math.sin((i * 1.1)  + tick * 0.4)  * 22;
    return Math.max(6, Math.min(96, 50 + a + b));
  });

  const callerLabel = name ? name.toUpperCase().slice(0, 8) : "UNKNOWN";

  /* ──────────────────────────────────────────────────────────
     Mobile layout — stacked CODEC.
     ────────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div
        className="h-full flex flex-col overflow-auto"
        style={{ background: BG, color: GREEN, position: "relative" }}
      >
        {/* CRT scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
            zIndex: 20,
          }}
        />

        {/* ── CODEC header (compact) ── */}
        <div
          style={{
            flexShrink: 0,
            background: "#020902",
            borderBottom: `1px solid ${GREEN}33`,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.3em" }}>
            <i className="hn hn-angle-left" /> CODEC <i className="hn hn-angle-right" />
          </span>
          <div style={{ flex: 1, height: 1, background: `${GREEN}18` }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: AMBER, letterSpacing: "0.06em" }}>
            140.85
          </span>
          <div className="flex items-end gap-0.5" style={{ height: 12 }}>
            {[3, 5, 8, 11].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, background: GREEN, opacity: 0.8 }} />
            ))}
          </div>
        </div>

        {/* ── Portraits row ── */}
        <div
          className="flex items-center"
          style={{
            flexShrink: 0,
            padding: "14px 16px",
            background: PANEL,
            borderBottom: `1px solid ${GREEN}22`,
            gap: 12,
          }}
        >
          <MobilePortrait icon="robot" label="KR·19" sub="RECV" />
          {/* Status link line */}
          <div className="flex-1 flex flex-col items-center" style={{ gap: 4 }}>
            <div className="w-full" style={{ height: 1, background: `${GREEN}33` }} />
            <div style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.3em" }}>
              {sent ? "RELAYED" : "OPEN"}
            </div>
            <div className="w-full" style={{ height: 1, background: `${GREEN}33` }} />
          </div>
          <MobilePortrait
            icon={sent ? "share-alt" : "user"}
            label={callerLabel}
            sub="SEND"
          />
        </div>

        {/* ── Form / Sent state ── */}
        <div className="flex flex-col" style={{ padding: "18px 16px 12px" }}>
          {!sent ? (
            <>
              {/* Callsign */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.35em", marginBottom: 6 }}>
                  CALLSIGN
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ENTER CODENAME..."
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 14,
                    padding: "10px 12px",
                    outline: "none",
                    letterSpacing: "0.04em",
                  }}
                />
              </div>

              {/* Transmission */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.35em", marginBottom: 6 }}>
                  TRANSMISSION
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={"BEGIN TRANSMISSION...\n\n_"}
                  rows={6}
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 14,
                    padding: "10px 12px",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.65,
                    letterSpacing: "0.02em",
                    minHeight: 140,
                  }}
                />
              </div>

              {/* Transmit button */}
              <button
                onClick={handleSend}
                style={{
                  background: message.trim() ? `${GREEN}18` : "transparent",
                  border: `1px solid ${message.trim() ? GREEN + "99" : DIM + "66"}`,
                  color: message.trim() ? GREEN : DIM,
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: "12px 8px",
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  letterSpacing: "0.25em",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {message.trim() ? (
                  <><i className="hn hn-play" />{"  TRANSMIT"}</>
                ) : (
                  <><i className="hn hn-play" style={{ opacity: 0.4 }} />{"  AWAITING INPUT..."}</>
                )}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center" style={{ gap: 18, textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: "0.3em" }}>
                ── TRANSMISSION COMPLETE ──
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: GREEN, lineHeight: 1.8, letterSpacing: "0.02em" }}>
                {name && <span style={{ color: AMBER }}>{name.toUpperCase()}</span>}
                {name && <br />}
                <span style={{ color: DIM }}>MESSAGE RECEIVED.</span><br />
                <span style={{ color: DIM }}>KR-19 WILL RESPOND.</span>
              </div>
              <button
                onClick={() => { setSent(false); setName(""); setMessage(""); }}
                style={{
                  marginTop: 4,
                  background: "transparent",
                  border: `1px solid ${GREEN}44`,
                  color: DIM,
                  fontFamily: MONO,
                  fontSize: 10,
                  padding: "8px 20px",
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                }}
              >
                NEW TRANSMISSION
              </button>
            </div>
          )}
        </div>

        {/* ── Waveform + direct links ── */}
        <div className="mt-auto" style={{ flexShrink: 0, background: "#020902", borderTop: `1px solid ${GREEN}22` }}>
          <div
            className="flex items-center"
            style={{ height: 28, padding: "0 10px", gap: "1px", overflow: "hidden" }}
          >
            {wave.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: GREEN,
                  opacity: 0.45,
                  minWidth: 2,
                  maxWidth: 6,
                }}
              />
            ))}
          </div>

          <div
            className="flex flex-col items-center"
            style={{ padding: "10px 12px 14px", borderTop: `1px solid ${GREEN}18`, gap: 6 }}
          >
            <a
              href={`mailto:${profile.social.email}`}
              style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.08em", textDecoration: "none" }}
            >
              <i className="hn hn-envelope" /> {profile.social.email}
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.08em", textDecoration: "none" }}
            >
              <i className="hn hn-external-link" /> LINKEDIN
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: BG, color: GREEN, position: "relative" }}
    >
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
          zIndex: 20,
        }}
      />

      {/* ── TOP: CODEC header ── */}
      <div
        style={{
          flexShrink: 0,
          background: "#020902",
          borderBottom: `1px solid ${GREEN}33`,
          padding: "9px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.35em" }}><i className="hn hn-angle-left" /> CODEC <i className="hn hn-angle-right" /></span>
        <div style={{ flex: 1, height: 1, background: `${GREEN}18` }} />
        <span style={{ fontFamily: MONO, fontSize: 13, color: AMBER, letterSpacing: "0.08em" }}>
          FREQ: 140.85 MHz
        </span>
        <div style={{ flex: 1, height: 1, background: `${GREEN}18` }} />
        {/* Signal bars */}
        <div className="flex items-end gap-0.5" style={{ height: 14 }}>
          {[4, 6, 9, 12, 14].map((h, i) => (
            <div key={i} style={{ width: 4, height: h, background: GREEN, opacity: 0.8 }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.18em" }}>STRONG</span>
      </div>

      {/* ── MAIN: Portraits + Form ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left portrait — KR-19 */}
        <Portrait icon="robot" label="KR·19" sub="RECV" side="left" />

        {/* Center form */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ padding: "18px 18px 14px" }}
        >
          {!sent ? (
            <>
              {/* Callsign */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.35em", marginBottom: 5 }}>
                  CALLSIGN
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ENTER CODENAME..."
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 14,
                    padding: "9px 12px",
                    outline: "none",
                    letterSpacing: "0.04em",
                  }}
                />
              </div>

              {/* Transmission textarea */}
              <div className="flex flex-col flex-1" style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: DIM, letterSpacing: "0.35em", marginBottom: 5 }}>
                  TRANSMISSION
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={"BEGIN TRANSMISSION...\n\n_"}
                  style={{
                    flex: 1,
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 14,
                    padding: "10px 12px",
                    outline: "none",
                    resize: "none",
                    lineHeight: 1.7,
                    letterSpacing: "0.02em",
                  }}
                />
              </div>

              {/* Transmit button */}
              <button
                onClick={handleSend}
                style={{
                  background: message.trim() ? `${GREEN}18` : "transparent",
                  border: `1px solid ${message.trim() ? GREEN + "99" : DIM + "66"}`,
                  color: message.trim() ? GREEN : DIM,
                  fontFamily: MONO,
                  fontSize: 11,
                  padding: "9px 8px",
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  letterSpacing: "0.25em",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {message.trim() ? <><i className="hn hn-play" />{"  TRANSMIT"}</> : <><i className="hn hn-play" style={{ opacity: 0.4 }} />{"  AWAITING INPUT..."}</>}
              </button>
            </>
          ) : (
            /* Sent state */
            <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: 18, textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: "0.3em" }}>
                ── TRANSMISSION COMPLETE ──
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: GREEN, lineHeight: 1.8, letterSpacing: "0.02em" }}>
                {name && <span style={{ color: AMBER }}>{name.toUpperCase()}</span>}
                {name && <br />}
                <span style={{ color: DIM }}>MESSAGE RECEIVED.</span><br />
                <span style={{ color: DIM }}>KR-19 WILL RESPOND.</span>
              </div>
              <button
                onClick={() => { setSent(false); setName(""); setMessage(""); }}
                style={{
                  marginTop: 8,
                  background: "transparent",
                  border: `1px solid ${GREEN}44`,
                  color: DIM,
                  fontFamily: MONO,
                  fontSize: 9,
                  padding: "6px 18px",
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                }}
              >
                NEW TRANSMISSION
              </button>
            </div>
          )}
        </div>

        {/* Right portrait — Caller */}
        <Portrait
          icon={sent ? "share-alt" : "user"}
          label={callerLabel}
          sub="SEND"
          side="right"
        />
      </div>

      {/* ── BOTTOM: Waveform + direct links ── */}
      <div style={{ flexShrink: 0, background: "#020902", borderTop: `1px solid ${GREEN}22` }}>
        {/* Animated waveform */}
        <div
          className="flex items-center"
          style={{ height: 32, padding: "0 10px", gap: "1px", overflow: "hidden" }}
        >
          {wave.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: GREEN,
                opacity: 0.45,
                minWidth: 2,
                maxWidth: 6,
              }}
            />
          ))}
        </div>

        {/* Direct links */}
        <div
          className="flex items-center justify-center gap-6"
          style={{ padding: "7px 16px 11px", borderTop: `1px solid ${GREEN}18` }}
        >
          <a
            href={`mailto:${profile.social.email}`}
            style={{ fontFamily: MONO, fontSize: 9, color: DIM, letterSpacing: "0.1em", textDecoration: "none" }}
          >
            <i className="hn hn-envelope" /> {profile.social.email}
          </a>
          <span style={{ color: `${GREEN}22` }}>│</span>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: MONO, fontSize: 9, color: DIM, letterSpacing: "0.1em", textDecoration: "none" }}
          >
            <i className="hn hn-external-link" /> LINKEDIN
          </a>
        </div>
      </div>
    </div>
  );
}
