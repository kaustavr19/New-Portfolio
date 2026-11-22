"use client";

import { useId, useState } from "react";
import { profile } from "@/data/content";
import { Icon } from "../ui";

/* Same /api/contact contract as the classic Contact app: intent, name,
   email, message, and the hidden honeypot field. */

const INTENTS = [
  { id: "PRODUCT ROLE", label: "Role", prompt: "Team, role, and what you're building…" },
  { id: "PORTFOLIO REVIEW", label: "Portfolio", prompt: "What would you like to discuss or see in more detail?" },
  { id: "PROJECT COLLAB", label: "Collab", prompt: "The problem, current stage, and where design could help…" },
  { id: "SPEAKING / WRITING", label: "Speaking", prompt: "Topic, format, audience, and timeline…" },
] as const;
type Intent = (typeof INTENTS)[number]["id"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InkContact() {
  const uid = useId();
  const [intent, setIntent] = useState<Intent>("PRODUCT ROLE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const emailOk = EMAIL_RE.test(email.trim());
  const canSend = message.trim() !== "" && emailOk;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
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

  const reset = () => {
    setStatus("idle");
    setName("");
    setEmail("");
    setMessage("");
    setTouched(false);
  };

  const direct = [
    { label: "Email", value: profile.social.email, href: `mailto:${profile.social.email}`, icon: "mail" },
    { label: "LinkedIn", value: "in/kaustavr19", href: profile.social.linkedin, icon: "about" },
    { label: "Medium", value: "@kaustavr19", href: profile.social.medium, icon: "resume" },
    { label: "Resume", value: "Kaustav_Roy_CV.pdf", href: "/Kaustav_Roy_CV.pdf", icon: "resume" },
  ];

  return (
    <div className="ink-app ink-app-scroll">
      <div className="ink-split">
        <aside className="ink-split-side">
          <span className="ink-label ink-live">Channel open</span>
          <h3 className="ink-dot-900" style={{ fontSize: "var(--dot-l)", lineHeight: 1 }}>SAY<br />HELLO.</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>
            Send a role, product brief, or difficult workflow. A little context is enough — not a polished brief.
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {direct.map((d) => (
              <li key={d.label}>
                <a href={d.href} target={d.href.startsWith("http") || d.href.endsWith(".pdf") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, border: "1px solid var(--ink-line)", textDecoration: "none" }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ink-raised)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={d.icon} size={16} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="ink-label" style={{ display: "block" }}>{d.label}</span>
                    <span style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="ink-split-main">
          {status === "sent" ? (
            <div role="status" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start", paddingTop: 20 }}>
              <span className="ink-label">Transmission sent</span>
              <div className="ink-dot-900" style={{ fontSize: "var(--dot-l)", lineHeight: 1 }}>RECEIVED<span className="ink-red">.</span></div>
              <p className="ink-body">Thanks{name.trim() ? `, ${name.trim()}` : ""}. A reply goes to {email.trim()} — usually within a couple of days.</p>
              <button type="button" className="ink-pill" onClick={reset}>Send another</button>
            </div>
          ) : (
            <form onSubmit={send} noValidate style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 620 }}>
              <fieldset style={{ border: 0 }}>
                <legend className="ink-label" style={{ marginBottom: 10 }}>What&apos;s this about?</legend>
                <div className="ink-seg" style={{ flexWrap: "wrap", borderRadius: 22 }}>
                  {INTENTS.map((i) => (
                    <button key={i.id} type="button" aria-pressed={intent === i.id} onClick={() => setIntent(i.id)}>{i.label}</button>
                  ))}
                </div>
              </fieldset>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <label className="ink-field" htmlFor={`${uid}-name`}>
                  <span className="ink-label">Name · optional</span>
                  <input id={`${uid}-name`} className="ink-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
                </label>
                <label className="ink-field" htmlFor={`${uid}-email`}>
                  <span className="ink-label">Reply email · required</span>
                  <input
                    id={`${uid}-email`}
                    className="ink-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={touched && !emailOk}
                    aria-describedby={touched && !emailOk ? `${uid}-email-err` : undefined}
                  />
                  {touched && !emailOk && <span id={`${uid}-email-err`} className="ink-meta ink-red">Enter a valid email so a reply can reach you.</span>}
                </label>
              </div>
              {/* Honeypot — hidden from people, filled by bots */}
              <input tabIndex={-1} autoComplete="off" aria-hidden value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} name="website" />
              <label className="ink-field" htmlFor={`${uid}-msg`}>
                <span className="ink-label">Message · required</span>
                <textarea id={`${uid}-msg`} className="ink-input" required rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={INTENTS.find((i) => i.id === intent)!.prompt} />
              </label>
              {status === "error" && (
                <p role="alert" className="ink-meta ink-red">The message didn&apos;t send. Try again, or email {profile.social.email} directly.</p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="ink-meta">Goes straight to Kaustav&apos;s inbox.</span>
                <button type="submit" className="ink-pill solid" disabled={!canSend || status === "sending"} style={{ padding: "12px 22px" }}>
                  {status === "sending" ? "Sending…" : "Send message →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
