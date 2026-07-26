"use client";

import { useState, useEffect } from "react";
import { profile } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { useIsMobile } from "@/lib/use-is-mobile";
import { useWindowFocus } from "@/components/os/Window";

const MONO = "'Share Tech Mono', monospace";
const GREEN  = "#39e639";
const DIM    = "#42a842";
const AMBER  = "#f0bf3c";
const BG     = "#030d03";
const PANEL  = "#060f06";
const CONTACT_INTENTS = ["PRODUCT ROLE", "PORTFOLIO REVIEW", "PROJECT COLLAB", "SPEAKING / WRITING"] as const;
type ContactIntent = typeof CONTACT_INTENTS[number];
const CONTACT_INTENT_LABELS: Record<ContactIntent, string> = {
  "PRODUCT ROLE": "PRODUCT ROLE",
  "PORTFOLIO REVIEW": "PORTFOLIO",
  "PROJECT COLLAB": "COLLAB",
  "SPEAKING / WRITING": "SPEAKING",
};

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
        <div style={{ fontFamily: MONO, fontSize: 12, color: GREEN, letterSpacing: "0.1em" }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.08em", marginTop: 3 }}>{sub}</div>
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
        <div style={{ fontFamily: MONO, fontSize: 12, color: GREEN, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.08em", marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function messagePlaceholder(intent: ContactIntent) {
  const prompts: Record<ContactIntent, string> = {
    "PRODUCT ROLE": "TEAM / ROLE / WHAT YOU ARE BUILDING...\n\n_",
    "PORTFOLIO REVIEW": "WHAT WOULD YOU LIKE TO DISCUSS OR SEE IN MORE DETAIL?\n\n_",
    "PROJECT COLLAB": "THE PROBLEM, CURRENT STAGE, AND WHERE DESIGN COULD HELP...\n\n_",
    "SPEAKING / WRITING": "TOPIC, FORMAT, AUDIENCE, AND TIMELINE...\n\n_",
  };
  return prompts[intent];
}

function ContactBrief({
  intent,
  setIntent,
  mobile = false,
}: {
  intent: ContactIntent;
  setIntent: (intent: ContactIntent) => void;
  mobile?: boolean;
}) {
  return (
    <fieldset
      style={{
        marginBottom: mobile ? 18 : 8,
        padding: mobile ? "14px" : "9px 10px",
        border: `1px solid ${GREEN}2c`,
        background: `${GREEN}08`,
      }}
    >
      <legend className="sr-only">Reason for contacting</legend>
      <div className={mobile ? "" : "flex items-start justify-between gap-5"}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: AMBER, letterSpacing: "0.16em" }}>
            CHANNEL OPEN
          </div>
          <div style={{ fontFamily: MONO, fontSize: mobile ? 14 : 12, color: GREEN, lineHeight: 1.45, marginTop: 5 }}>
            Enterprise AI · B2B products · design systems · selected collaborations
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: DIM, lineHeight: 1.45, marginTop: mobile ? 9 : 0, maxWidth: 175 }}>
          A role, rough brief, or difficult workflow is enough to start.
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5" style={{ marginTop: mobile ? 12 : 9 }}>
        {CONTACT_INTENTS.map((option) => {
          const selected = option === intent;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setIntent(option)}
              aria-pressed={selected}
              className="contact-control"
              style={{
                minHeight: 32,
                padding: mobile ? "6px 9px" : "5px 8px",
                border: `1px solid ${selected ? GREEN : `${GREEN}30`}`,
                background: selected ? `${GREEN}18` : "transparent",
                color: selected ? GREEN : DIM,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              {mobile ? option : CONTACT_INTENT_LABELS[option]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ContactApp() {
  const isMobile = useIsMobile();
  const { motionReduced, highContrast } = useA11y();
  const [status, setStatus]   = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState<ContactIntent>("PRODUCT ROLE");
  const [emailTouched, setEmailTouched] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [tick, setTick]       = useState(0);
  const sent = status === "sent";
  const isFocused = useWindowFocus();

  useEffect(() => {
    if (!isFocused || motionReduced) return;
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id === null) id = setInterval(() => setTick((t) => t + 1), 80);
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [isFocused, motionReduced]);

  const canSend = message.trim() !== "" && EMAIL_RE.test(email.trim());
  const emailInvalid = emailTouched && !EMAIL_RE.test(email.trim());

  const handleSend = async () => {
    if (!canSend || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, intent, honeypot }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setName("");
    setEmail("");
    setMessage("");
    setIntent("PRODUCT ROLE");
    setEmailTouched(false);
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
            opacity: highContrast ? 0 : 1,
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
          <span style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.18em" }}>
            <i className="hn hn-angle-left" /> CODEC <i className="hn hn-angle-right" />
          </span>
          <div style={{ flex: 1, height: 1, background: `${GREEN}18` }} />
          <span style={{ fontFamily: MONO, fontSize: 13, color: AMBER, letterSpacing: "0.05em" }}>
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
            <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.2em" }}>
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
        <form
          className="flex flex-col"
          style={{ padding: "18px 16px 12px" }}
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          noValidate
        >
          {!sent ? (
            <>
              <ContactBrief intent={intent} setIntent={setIntent} mobile />

              {/* Callsign */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.14em", marginBottom: 7 }}>
                  CALLSIGN · OPTIONAL
                </div>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ENTER CODENAME..."
                  autoComplete="name"
                  aria-label="Callsign or name, optional"
                  className="contact-control"
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 16,
                    padding: "12px 13px",
                    letterSpacing: "0.04em",
                  }}
                />
              </div>

              {/* Reply channel */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.14em", marginBottom: 7 }}>
                  REPLY CHANNEL · REQUIRED
                </div>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="YOUR.CALLBACK@FREQ.COM"
                  autoComplete="email"
                  required
                  aria-label="Reply email, required"
                  aria-invalid={emailInvalid}
                  aria-describedby="contact-email-help"
                  className="contact-control"
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${emailInvalid ? AMBER : `${GREEN}55`}`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 16,
                    padding: "12px 13px",
                    letterSpacing: "0.04em",
                  }}
                />
                <div id="contact-email-help" style={{ fontFamily: MONO, fontSize: 11, color: emailInvalid ? AMBER : DIM, lineHeight: 1.4, marginTop: 6 }}>
                  {emailInvalid ? "ENTER A VALID REPLY ADDRESS." : "Used only to reply to this message."}
                </div>
              </div>

              {/* Honeypot — hidden from sighted users and screen readers, catches naive bots */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
              />

              {/* Transmission */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.14em", marginBottom: 7 }}>
                  TRANSMISSION · REQUIRED
                </div>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={messagePlaceholder(intent)}
                  rows={6}
                  required
                  aria-label="Message, required"
                  className="contact-control"
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 16,
                    padding: "12px 13px",
                    resize: "vertical",
                    lineHeight: 1.65,
                    letterSpacing: "0.02em",
                    minHeight: 140,
                  }}
                />
              </div>

              {/* Transmit button */}
              {status === "error" && (
                <div role="alert" style={{ fontFamily: MONO, fontSize: 12, color: AMBER, letterSpacing: "0.06em", marginBottom: 10 }}>
                  ⚠ TRANSMISSION FAILED — TRY AGAIN OR EMAIL DIRECTLY
                </div>
              )}
              <button
                type="submit"
                disabled={!canSend || status === "sending"}
                className="contact-control"
                aria-describedby={!canSend ? "contact-send-help" : undefined}
                style={{
                  background: canSend ? `${GREEN}18` : "transparent",
                  border: `1px solid ${canSend ? GREEN + "99" : DIM + "66"}`,
                  color: canSend ? GREEN : DIM,
                  fontFamily: MONO,
                  fontSize: 14,
                  padding: "13px 10px",
                  cursor: canSend && status !== "sending" ? "pointer" : "not-allowed",
                  letterSpacing: "0.25em",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {status === "sending" ? (
                  <><i className="hn hn-play" style={{ opacity: 0.6 }} />{"  TRANSMITTING..."}</>
                ) : canSend ? (
                  <><i className="hn hn-play" />{"  TRANSMIT"}</>
                ) : (
                  <><i className="hn hn-play" style={{ opacity: 0.4 }} />{"  AWAITING INPUT..."}</>
                )}
              </button>
              {!canSend && (
                <div id="contact-send-help" style={{ fontFamily: MONO, fontSize: 11, color: DIM, lineHeight: 1.4, marginTop: 7, textAlign: "center" }}>
                  Add a valid reply email and a message to transmit.
                </div>
              )}
            </>
          ) : (
            <div role="status" aria-live="polite" className="flex flex-col items-center justify-center" style={{ gap: 18, textAlign: "center", padding: "32px 0" }}>
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
                type="button"
                onClick={resetForm}
                className="contact-control"
                style={{
                  marginTop: 4,
                  background: "transparent",
                  border: `1px solid ${GREEN}44`,
                  color: DIM,
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: "8px 20px",
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                }}
              >
                NEW TRANSMISSION
              </button>
            </div>
          )}
        </form>

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
              className="contact-control"
              style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.04em", textDecoration: "none", padding: "4px" }}
            >
              <i className="hn hn-envelope" /> {profile.social.email}
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-control"
              style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.04em", textDecoration: "none", padding: "4px" }}
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
          opacity: highContrast ? 0 : 1,
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
        <span style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.2em" }}><i className="hn hn-angle-left" /> CODEC <i className="hn hn-angle-right" /></span>
        <div style={{ flex: 1, height: 1, background: `${GREEN}18` }} />
        <span style={{ fontFamily: MONO, fontSize: 14, color: AMBER, letterSpacing: "0.06em" }}>
          FREQ: 140.85 MHz
        </span>
        <div style={{ flex: 1, height: 1, background: `${GREEN}18` }} />
        {/* Signal bars */}
        <div className="flex items-end gap-0.5" style={{ height: 14 }}>
          {[4, 6, 9, 12, 14].map((h, i) => (
            <div key={i} style={{ width: 4, height: h, background: GREEN, opacity: 0.8 }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.12em" }}>STRONG</span>
      </div>

      {/* ── MAIN: Portraits + Form ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left portrait — KR-19 */}
        <Portrait icon="robot" label="KR·19" sub="RECV" side="left" />

        {/* Center form */}
        <form
          className="flex-1 flex flex-col overflow-auto"
          style={{ padding: "12px 16px 10px" }}
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          noValidate
        >
          {!sent ? (
            <>
              <ContactBrief intent={intent} setIntent={setIntent} />

              {/* Callsign */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.14em", marginBottom: 6 }}>
                  CALLSIGN · OPTIONAL
                </div>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ENTER CODENAME..."
                  autoComplete="name"
                  aria-label="Callsign or name, optional"
                  className="contact-control"
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 16,
                    padding: "10px 12px",
                    letterSpacing: "0.04em",
                  }}
                />
              </div>

              {/* Reply channel */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.14em", marginBottom: 6 }}>
                  REPLY CHANNEL · REQUIRED
                </div>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="YOUR.CALLBACK@FREQ.COM"
                  autoComplete="email"
                  required
                  aria-label="Reply email, required"
                  aria-invalid={emailInvalid}
                  aria-describedby="contact-email-help"
                  className="contact-control"
                  style={{
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${emailInvalid ? AMBER : `${GREEN}55`}`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 16,
                    padding: "10px 12px",
                    letterSpacing: "0.04em",
                  }}
                />
                <div id="contact-email-help" style={{ fontFamily: MONO, fontSize: 11, color: emailInvalid ? AMBER : DIM, lineHeight: 1.4, marginTop: 5 }}>
                  {emailInvalid ? "ENTER A VALID REPLY ADDRESS." : "Used only to reply to this message."}
                </div>
              </div>

              {/* Honeypot — hidden from sighted users and screen readers, catches naive bots */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
              />

              {/* Transmission textarea */}
              <div className="flex flex-col flex-1" style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.14em", marginBottom: 6 }}>
                  TRANSMISSION · REQUIRED
                </div>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={messagePlaceholder(intent)}
                  required
                  aria-label="Message, required"
                  className="contact-control"
                  style={{
                    flex: 1,
                    width: "100%",
                    background: "#020902",
                    border: `1px solid ${GREEN}33`,
                    color: GREEN,
                    fontFamily: MONO,
                    fontSize: 16,
                    padding: "10px 12px",
                    resize: "none",
                    lineHeight: 1.7,
                    letterSpacing: "0.02em",
                  }}
                />
              </div>

              {/* Transmit button */}
              {status === "error" && (
                <div role="alert" style={{ fontFamily: MONO, fontSize: 12, color: AMBER, letterSpacing: "0.06em", marginBottom: 8 }}>
                  ⚠ TRANSMISSION FAILED — TRY AGAIN OR EMAIL DIRECTLY
                </div>
              )}
              <button
                type="submit"
                disabled={!canSend || status === "sending"}
                className="contact-control"
                aria-describedby={!canSend ? "contact-send-help-desktop" : undefined}
                style={{
                  background: canSend ? `${GREEN}18` : "transparent",
                  border: `1px solid ${canSend ? GREEN + "99" : DIM + "66"}`,
                  color: canSend ? GREEN : DIM,
                  fontFamily: MONO,
                  fontSize: 14,
                  padding: "10px",
                  cursor: canSend && status !== "sending" ? "pointer" : "not-allowed",
                  letterSpacing: "0.25em",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {status === "sending" ? (
                  <><i className="hn hn-play" style={{ opacity: 0.6 }} />{"  TRANSMITTING..."}</>
                ) : canSend ? (
                  <><i className="hn hn-play" />{"  TRANSMIT"}</>
                ) : (
                  <><i className="hn hn-play" style={{ opacity: 0.4 }} />{"  AWAITING INPUT..."}</>
                )}
              </button>
              {!canSend && (
                <div id="contact-send-help-desktop" style={{ fontFamily: MONO, fontSize: 11, color: DIM, lineHeight: 1.4, marginTop: 6, textAlign: "center" }}>
                  Add a valid reply email and a message to transmit.
                </div>
              )}
            </>
          ) : (
            /* Sent state */
            <div role="status" aria-live="polite" className="flex-1 flex flex-col items-center justify-center" style={{ gap: 18, textAlign: "center" }}>
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
                type="button"
                onClick={resetForm}
                className="contact-control"
                style={{
                  marginTop: 8,
                  background: "transparent",
                  border: `1px solid ${GREEN}44`,
                  color: DIM,
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: "6px 18px",
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                }}
              >
                NEW TRANSMISSION
              </button>
            </div>
          )}
        </form>

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
            className="contact-control"
            style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.04em", textDecoration: "none", padding: "4px" }}
          >
            <i className="hn hn-envelope" /> {profile.social.email}
          </a>
          <span style={{ color: `${GREEN}22` }}>│</span>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-control"
            style={{ fontFamily: MONO, fontSize: 12, color: DIM, letterSpacing: "0.04em", textDecoration: "none", padding: "4px" }}
          >
            <i className="hn hn-external-link" /> LINKEDIN
          </a>
        </div>
      </div>
    </div>
  );
}
