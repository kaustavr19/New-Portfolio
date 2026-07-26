"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "@/data/content";
import { useA11y } from "@/lib/a11y";
import { setHash } from "@/lib/deep-link";
import { useReaderMode } from "@/lib/reader-mode";
import KRMark from "./KRMark";

const BRIEFED_KEY = "kros_personnel_brief_v2";
const REVEAL_DELAY_MS = 650;
const MONO = "'Share Tech Mono', monospace";
const SANS = "'Rajdhani', sans-serif";

const proofSignals = [
  { value: "~40%", label: "FASTER REVIEW", detail: "AI underwriting workflow" },
  { value: "50+", label: "DESIGNERS ENABLED", detail: "Shared design system" },
  { value: "I/O 2024", label: "FEATURED", detail: "Google sustainability work" },
];

export default function PersonnelBrief() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const { motionReduced } = useA11y();
  const { setOpen: setReaderOpen } = useReaderMode();

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(BRIEFED_KEY, "1");
    } catch {
      // Dismissal still works for this mount when persistence is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(BRIEFED_KEY) === "1") return;
      // A shared deep link already carries strong visitor intent. Let it open
      // unobstructed and preserve the brief for a later root visit.
      if (window.location.hash) return;
    } catch {
      // Storage can be unavailable in private contexts. The brief remains
      // useful for this visit; it simply cannot remember the dismissal.
    }

    const timer = window.setTimeout(() => setVisible(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const focusTimer = window.setTimeout(
      () => dialogRef.current?.focus(),
      motionReduced ? 0 : 320,
    );
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, motionReduced, dismiss]);

  function openFlagshipMission() {
    setHash("projects", "underwriting");
    window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "projects" }));
    dismiss();
  }

  function openRecruiterView() {
    setReaderOpen(true);
    dismiss();
  }

  const duration = motionReduced ? 0 : 0.28;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 9985,
            padding:
              "max(18px, env(safe-area-inset-top, 0px)) max(14px, env(safe-area-inset-right, 0px)) max(18px, env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left, 0px))",
            background: "rgba(2, 5, 14, 0.74)",
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="personnel-brief-title"
            aria-describedby="personnel-brief-summary"
            tabIndex={-1}
            className="relative w-full overflow-auto"
            style={{
              maxWidth: 860,
              maxHeight: "calc(100dvh - 36px)",
              color: "#edf7ff",
              background:
                "linear-gradient(145deg, rgba(10,18,32,0.98) 0%, rgba(5,10,21,0.98) 68%, rgba(8,16,27,0.98) 100%)",
              border: "1px solid rgba(79,195,247,0.48)",
              borderRadius: 4,
              boxShadow:
                "0 30px 90px rgba(0,0,0,0.72), 0 0 45px rgba(79,195,247,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            initial={motionReduced ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={motionReduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <CornerBrackets />

            <header
              className="flex items-center justify-between gap-4"
              style={{
                minHeight: 48,
                padding: "12px 16px",
                borderBottom: "1px solid rgba(79,195,247,0.18)",
                background: "rgba(79,195,247,0.035)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#4fc3f7",
                    boxShadow: "0 0 10px rgba(79,195,247,0.85)",
                  }}
                />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "#8fdcff",
                    letterSpacing: "0.22em",
                  }}
                >
                  INBOUND PERSONNEL FILE
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="hidden sm:inline"
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    color: "rgba(255,255,255,0.38)",
                    letterSpacing: "0.16em",
                  }}
                >
                  CLEARANCE // PUBLIC
                </span>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Close personnel brief"
                  className="transition-colors hover:bg-white/5"
                  style={{
                    width: 30,
                    height: 30,
                    color: "#82a3b5",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    fontFamily: MONO,
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>
            </header>

            <div className="grid md:grid-cols-[190px_1fr]">
              <aside
                className="flex md:flex-col items-center md:items-stretch gap-4"
                style={{
                  padding: "24px",
                  borderRight: "1px solid rgba(79,195,247,0.12)",
                  borderBottom: "1px solid rgba(79,195,247,0.12)",
                  background:
                    "linear-gradient(180deg, rgba(79,195,247,0.045), rgba(79,195,247,0.008))",
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 112,
                    height: 112,
                    border: "1px solid rgba(79,195,247,0.65)",
                    background: "rgba(3,10,19,0.72)",
                    boxShadow: "inset 0 0 24px rgba(79,195,247,0.08)",
                  }}
                >
                  <KRMark width={72} color="#73d3ff" />
                </div>

                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.2em",
                      marginBottom: 8,
                    }}
                  >
                    SUBJECT
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: "#bcecff",
                      letterSpacing: "0.14em",
                    }}
                  >
                    KR-19
                  </div>
                  <div
                    className="hidden md:block"
                    style={{
                      height: 1,
                      background: "rgba(79,195,247,0.18)",
                      margin: "14px 0",
                    }}
                  />
                  <div
                    className="hidden md:flex flex-col gap-2"
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      color: "rgba(255,255,255,0.42)",
                      letterSpacing: "0.1em",
                      lineHeight: 1.5,
                    }}
                  >
                    <span>STATUS&nbsp;&nbsp; ACTIVE</span>
                    <span>BASE&nbsp;&nbsp;&nbsp;&nbsp; BENGALURU</span>
                    <span>DOMAIN&nbsp;&nbsp; ENTERPRISE AI</span>
                  </div>
                </div>
              </aside>

              <main style={{ padding: "clamp(22px, 4vw, 36px)" }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "#f5e642",
                    letterSpacing: "0.18em",
                    marginBottom: 10,
                  }}
                >
                  DESIGN × AI × ENTERPRISE UX
                </div>
                <h1
                  id="personnel-brief-title"
                  style={{
                    fontFamily: SANS,
                    fontSize: "clamp(32px, 6vw, 52px)",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.025em",
                    lineHeight: 0.98,
                    margin: 0,
                  }}
                >
                  {profile.name}
                </h1>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: "clamp(16px, 2.2vw, 20px)",
                    color: "#9edfff",
                    fontWeight: 500,
                    marginTop: 10,
                  }}
                >
                  {profile.designation} · AI-powered products people can understand, question, and trust.
                </div>
                <p
                  id="personnel-brief-summary"
                  style={{
                    fontFamily: SANS,
                    fontSize: 15,
                    color: "rgba(232,242,248,0.7)",
                    lineHeight: 1.6,
                    margin: "18px 0 0",
                    maxWidth: 610,
                  }}
                >
                  {profile.bioShort}
                </p>

                <div className="grid grid-cols-3" style={{ gap: 8, marginTop: 24 }}>
                  {proofSignals.map((signal) => (
                    <div
                      key={signal.label}
                      style={{
                        minHeight: 108,
                        padding: "clamp(10px, 2vw, 14px)",
                        border: "1px solid rgba(79,195,247,0.16)",
                        background: "rgba(79,195,247,0.025)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: "clamp(18px, 5vw, 25px)",
                          fontWeight: 700,
                          color: "#ffffff",
                          lineHeight: 1,
                        }}
                      >
                        {signal.value}
                      </div>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          color: "#67cfff",
                          letterSpacing: "0.13em",
                          marginTop: 9,
                        }}
                      >
                        {signal.label}
                      </div>
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 4,
                          lineHeight: 1.3,
                        }}
                      >
                        {signal.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5" style={{ marginTop: 24 }}>
                  <ActionButton
                    label="OPEN FLAGSHIP MISSION"
                    detail="Operation Underwriting"
                    accent="#f5e642"
                    primary
                    onClick={openFlagshipMission}
                  />
                  <ActionButton
                    label="OPEN RECRUITER VIEW"
                    detail="Fast, readable overview"
                    accent="#4fc3f7"
                    onClick={openRecruiterView}
                  />
                  <ActionButton
                    label="ENTER KR//OS"
                    detail="Explore freely"
                    accent="#a8b8c4"
                    onClick={dismiss}
                  />
                </div>
              </main>
            </div>

            <footer
              className="flex items-center justify-between gap-4"
              style={{
                padding: "10px 16px",
                borderTop: "1px solid rgba(79,195,247,0.14)",
                fontFamily: MONO,
                fontSize: 8,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.13em",
              }}
            >
              <span>KR//OS ONBOARDING PROTOCOL</span>
              <span>ESC / CLOSE TO DISMISS</span>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionButton({
  label,
  detail,
  accent,
  primary = false,
  onClick,
}: {
  label: string;
  detail: string;
  accent: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 text-left transition-all hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
      style={{
        padding: "12px 14px",
        border: `1px solid ${accent}${primary ? "99" : "66"}`,
        background: primary ? `${accent}12` : "rgba(255,255,255,0.018)",
        boxShadow: primary ? `inset 3px 0 0 ${accent}` : "none",
        borderRadius: 2,
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: MONO,
          fontSize: 10,
          color: accent,
          letterSpacing: "0.11em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: SANS,
          fontSize: 12,
          color: "rgba(255,255,255,0.47)",
          marginTop: 4,
        }}
      >
        {detail}
      </span>
    </button>
  );
}

function CornerBrackets() {
  const common: React.CSSProperties = {
    position: "absolute",
    width: 16,
    height: 16,
    pointerEvents: "none",
    zIndex: 2,
  };
  return (
    <>
      <span aria-hidden style={{ ...common, left: -1, top: -1, borderLeft: "2px solid #4fc3f7", borderTop: "2px solid #4fc3f7" }} />
      <span aria-hidden style={{ ...common, right: -1, top: -1, borderRight: "2px solid #4fc3f7", borderTop: "2px solid #4fc3f7" }} />
      <span aria-hidden style={{ ...common, left: -1, bottom: -1, borderLeft: "2px solid #4fc3f7", borderBottom: "2px solid #4fc3f7" }} />
      <span aria-hidden style={{ ...common, right: -1, bottom: -1, borderRight: "2px solid #4fc3f7", borderBottom: "2px solid #4fc3f7" }} />
    </>
  );
}
