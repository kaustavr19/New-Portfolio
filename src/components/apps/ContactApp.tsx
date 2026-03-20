"use client";

import { useState } from "react";
import { profile } from "@/data/content";

const SPECIAL_ELITE = "'Special Elite', cursive";
const MONO = "'Share Tech Mono', monospace";

export default function ContactApp() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
  };

  return (
    <div
      className="h-full flex flex-col items-center justify-start overflow-auto"
      style={{ padding: "36px 40px", background: "#141410" }}
    >
      {/* Radio header */}
      <div
        className="w-full max-w-lg mb-6 p-4 relative"
        style={{
          background: "#1e1c12",
          border: "2px solid #7ab64833",
          boxShadow: "0 0 24px rgba(122,182,72,0.05)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "repeating-linear-gradient(90deg, #7ab64822 0, #7ab64822 4px, transparent 4px, transparent 8px)",
          }}
        />
        <div className="flex items-center gap-4 mt-1">
          <div style={{ fontSize: 32 }}>📻</div>
          <div>
            <div style={{ fontFamily: SPECIAL_ELITE, fontSize: 15, color: "#7ab648" }}>
              RADIO CHANNEL — KR-19
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#7ab64866", letterSpacing: "0.12em", marginTop: 2 }}>
              SIGNAL: STRONG · ENCRYPTED
            </div>
          </div>
          <div
            className="ml-auto w-2.5 h-2.5 rounded-full"
            style={{ background: "#7ab648", boxShadow: "0 0 8px #7ab648", animation: "blink 1.2s step-end infinite", flexShrink: 0 }}
          />
        </div>
      </div>

      {!sent ? (
        <div
          className="w-full max-w-lg tlou-paper p-8 relative"
          style={{ border: "1px solid #7ab64833" }}
        >
          {/* Torn corner */}
          <div
            className="absolute top-0 right-0"
            style={{ width: 0, height: 0, borderLeft: "28px solid transparent", borderTop: "28px solid #bfb090" }}
          />

          <div
            className="mb-5"
            style={{
              fontFamily: SPECIAL_ELITE, fontSize: 14, color: "#7ab648", letterSpacing: "0.15em",
              borderBottom: "1px dashed #7ab64844", paddingBottom: 8,
            }}
          >
            Leave a Message
          </div>

          <div className="space-y-4">
            <div>
              <label style={{ fontFamily: MONO, fontSize: 9, color: "#5a4a30", letterSpacing: "0.2em", display: "block", marginBottom: 5 }}>
                YOUR NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Joel, Ellie, or anyone really..."
                className="w-full px-4 py-2.5 outline-none"
                style={{
                  fontFamily: SPECIAL_ELITE, fontSize: 13,
                  background: "#e8dcc0", border: "1px solid #7ab64833",
                  color: "#2a1f10",
                }}
              />
            </div>

            <div>
              <label style={{ fontFamily: MONO, fontSize: 9, color: "#5a4a30", letterSpacing: "0.2em", display: "block", marginBottom: 5 }}>
                MESSAGE
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write here... Don't waste paper."
                rows={5}
                className="w-full px-4 py-3 outline-none resize-none"
                style={{
                  fontFamily: SPECIAL_ELITE, fontSize: 13,
                  background: "#e8dcc0", border: "1px solid #7ab64833",
                  color: "#2a1f10", lineHeight: 1.9,
                }}
              />
            </div>

            <button
              onClick={handleSend}
              className="w-full py-3 transition-all"
              style={{
                fontFamily: SPECIAL_ELITE, fontSize: 14, letterSpacing: "0.1em",
                background: message.trim() ? "#7ab648" : "#3a3a2a",
                color: message.trim() ? "#141410" : "#6b6b5a",
                border: "none", cursor: message.trim() ? "pointer" : "not-allowed",
              }}
            >
              {message.trim() ? "Send Message ↗" : "Write something first..."}
            </button>
          </div>

          <div className="mt-5 pt-4" style={{ borderTop: "1px dashed #7ab64833" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#5a4a30", letterSpacing: "0.2em", marginBottom: 8 }}>
              OR FIND ME DIRECTLY
            </div>
            <div className="space-y-2">
              <a href={`mailto:${profile.social.email}`} style={{ fontFamily: SPECIAL_ELITE, fontSize: 13, color: "#7ab648", display: "block" }}>
                ✉ {profile.social.email}
              </a>
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SPECIAL_ELITE, fontSize: 13, color: "#7ab648", display: "block" }}>
                ↗ linkedin.com/in/kaustavr19
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-lg tlou-paper p-10 text-center"
          style={{ border: "1px solid #7ab64833" }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>📡</div>
          <div style={{ fontFamily: SPECIAL_ELITE, fontSize: 18, color: "#7ab648", marginBottom: 8 }}>
            Message Sent
          </div>
          <div style={{ fontFamily: SPECIAL_ELITE, fontSize: 14, color: "#5a4a30", lineHeight: 1.9 }}>
            {name ? `Thanks, ${name}.` : "Thanks."} Your message is on its way.
            <br />Kaustav will get back to you soon.
          </div>
          <button
            onClick={() => { setSent(false); setName(""); setMessage(""); }}
            className="mt-8 px-8 py-2.5"
            style={{
              fontFamily: SPECIAL_ELITE, fontSize: 13,
              border: "1px solid #7ab64844",
              color: "#7ab648", background: "transparent", cursor: "pointer",
            }}
          >
            Send Another
          </button>
        </div>
      )}
    </div>
  );
}
