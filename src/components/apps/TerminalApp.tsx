"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/lib/use-is-mobile";
import { useDeviant } from "@/lib/deviant";
import { useExperiments } from "@/lib/experiments";
import { runTerminal, TERM_VERBS, type TermLine } from "@/lib/terminal/engine";

const TITLE = "'Press Start 2P', monospace";
const BODY = "'VT323', monospace";

/* Minecraft §-colour palette. */
const MC: Record<string, string> = {
  "0": "#000000", "1": "#3a3ac0", "2": "#3fb54a", "3": "#00AAAA", "4": "#c43c3c",
  "5": "#AA00AA", "6": "#ffb12e", "7": "#b9b9b9", "8": "#6a6a6a", "9": "#5b8cff",
  a: "#6cf05a", b: "#5bf0f0", c: "#ff6b6b", d: "#ff6bd6", e: "#ffe85b", f: "#ffffff",
};

const BASE_COLOR: Record<TermLine["type"], string> = {
  input: "#6cf05a", output: "#b9b9b9", error: "#ff6b6b", system: "#7a7a7a",
};

/* Parse a §-coded string into coloured spans. */
function Segments({ text, base }: { text: string; base: string }) {
  const parts: { t: string; c: string }[] = [];
  let color = base;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "§" && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      if (MC[code]) {
        if (buf) { parts.push({ t: buf, c: color }); buf = ""; }
        color = MC[code];
        i++;
        continue;
      }
    }
    buf += text[i];
  }
  if (buf) parts.push({ t: buf, c: color });
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.c }}>{p.t}</span>
      ))}
    </>
  );
}

export default function TerminalApp() {
  const isMobile = useIsMobile();
  const { toggle: toggleDeviant } = useDeviant();
  const { starfieldWebgl, setFlag } = useExperiments();

  const [lines, setLines] = useState<TermLine[]>([
    { type: "system", text: "§6KR//OS §7Minecraft Terminal §8v2.0" },
    { type: "system", text: "§7Type §e/help§7 for commands — or just §eask me anything§7." },
    { type: "system", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fontSize  = isMobile ? 17 : 19;
  const titleSize = isMobile ? 9 : 9;
  const outputPad = isMobile ? "14px 16px" : "24px 32px";
  const inputPadX = isMobile ? 16 : 32;
  const promptLabel = isMobile ? "kr ~$" : "kaustav@kr-os ~$";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  // Auto-dismiss the advancement toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // Live command suggestions while typing the first token.
  const firstToken = input.replace(/^\//, "").split(/\s+/)[0]?.toLowerCase() ?? "";
  const suggestions = !input.includes(" ") && firstToken
    ? TERM_VERBS.filter((v) => v.startsWith(firstToken) && v !== firstToken).slice(0, 6)
    : [];

  const run = (raw: string) => {
    const echo: TermLine = { type: "input", text: `§a❯ §f${raw}` };
    const result = runTerminal(raw);

    // Side effects.
    const a = result.action;
    if (a?.kind === "clear") {
      setLines([{ type: "system", text: "§8Chat cleared." }]);
      setInput(""); setHistIdx(-1);
      return;
    }
    if (a?.kind === "open") window.dispatchEvent(new CustomEvent("kros:open-app", { detail: a.app }));
    if (a?.kind === "link") window.open(a.url, "_blank", "noopener,noreferrer");
    if (a?.kind === "toggleDeviant") toggleDeviant();
    if (a?.kind === "toggleWallpaper") setFlag("starfieldWebgl", !starfieldWebgl);
    if (a?.kind === "advancement") setToast({ title: a.title, desc: a.desc });

    setLines((prev) => [...prev, echo, ...result.lines, { type: "system", text: "" }]);
    if (raw.trim()) setHistory((h) => [raw, ...h.filter((x) => x !== raw)].slice(0, 40));
    setHistIdx(-1);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length) setInput(suggestions[0] + " ");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next); setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next); setInput(next === -1 ? "" : history[next] ?? "");
    }
  };

  return (
    <div
      className="h-full flex flex-col relative"
      style={{ background: "#10100c" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Advancement toast */}
      {toast && (
        <div
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 20,
            background: "#1c1c12", border: "2px solid #3a3a2a",
            borderLeft: "4px solid #ffb12e",
            padding: "10px 14px", maxWidth: 280,
            boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
            animation: "toastIn 0.35s ease-out",
          }}
        >
          <div style={{ fontFamily: TITLE, fontSize: 7, color: "#ffe85b", letterSpacing: "0.08em", marginBottom: 8 }}>
            ADVANCEMENT MADE!
          </div>
          <div style={{ fontFamily: BODY, fontSize: 19, color: "#fff", lineHeight: 1 }}>{toast.title}</div>
          <div style={{ fontFamily: BODY, fontSize: 15, color: "#9a9a8a", marginTop: 2 }}>{toast.desc}</div>
        </div>
      )}

      {/* Output */}
      <div
        className="flex-1"
        style={{ padding: outputPad, overflowY: "auto", overflowX: "auto" }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{ fontFamily: BODY, fontSize, lineHeight: 1.3, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {line.text ? <Segments text={line.text} base={BASE_COLOR[line.type]} /> : " "}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5"
          style={{ padding: `4px ${inputPadX}px`, background: "#16160f" }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); setInput(s + " "); inputRef.current?.focus(); }}
              style={{
                fontFamily: BODY, fontSize: fontSize - 3, color: "#cfcf9a",
                background: "#22221a", border: "1px solid #3a3a2a", padding: "1px 8px", cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div
        className="flex items-center py-2"
        style={{ paddingLeft: inputPadX, paddingRight: inputPadX, borderTop: "2px solid #2a2a1e", background: "#0b0b08" }}
      >
        <span style={{ fontFamily: TITLE, fontSize: titleSize, color: "#6cf05a", marginRight: 10, flexShrink: 0 }}>
          {promptLabel}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={!isMobile}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="ask me anything…"
          className="flex-1 bg-transparent outline-none min-w-0"
          style={{ fontFamily: BODY, fontSize, color: "#eaeaea", caretColor: "#6cf05a" }}
        />
      </div>
    </div>
  );
}
