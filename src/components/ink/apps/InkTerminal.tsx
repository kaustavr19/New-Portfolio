"use client";

import { useEffect, useRef, useState } from "react";
import { runTerminal, TERM_VERBS, type TermLine } from "@/lib/terminal/engine";
import { setHash } from "@/lib/deep-link";
import { useDeviant } from "@/lib/deviant";
import { useTheme } from "@/lib/theme";

/* Same engine as the classic terminal; its §-colour codes are mapped onto
   the Ink palette: greens/whites → ink, golds → bright, aquas/blues → blue,
   reds → red, greys → muted. */
const FG = "var(--ink-fg)", SOFT = "var(--ink-soft)", MUTE = "var(--ink-mute)", DIM = "var(--ink-dim)", RED = "var(--ink-red)", BLUE = "var(--ink-blue)", STRONG = "var(--ink-strong)";
const INK_CODES: Record<string, string> = {
  "0": DIM, "1": BLUE, "2": FG, "3": BLUE, "4": RED,
  "5": SOFT, "6": STRONG, "7": SOFT, "8": MUTE, "9": BLUE,
  a: FG, b: BLUE, c: RED, d: SOFT, e: STRONG, f: FG,
};
const BASE: Record<TermLine["type"], string> = { input: FG, output: SOFT, error: RED, system: MUTE };

function Segments({ text, base }: { text: string; base: string }) {
  const parts: { t: string; c: string }[] = [];
  let color = base;
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "§" && i + 1 < text.length && INK_CODES[text[i + 1].toLowerCase()]) {
      if (buf) parts.push({ t: buf, c: color });
      buf = "";
      color = INK_CODES[text[i + 1].toLowerCase()];
      i++;
      continue;
    }
    buf += text[i];
  }
  if (buf) parts.push({ t: buf, c: color });
  return <>{parts.map((p, i) => <span key={i} style={{ color: p.c }}>{p.t}</span>)}</>;
}

export default function InkTerminal() {
  const { toggle: toggleDeviant } = useDeviant();
  const { setTheme } = useTheme();
  const [lines, setLines] = useState<TermLine[]>([
    { type: "system", text: "§fKR//OS §8InkOS terminal" },
    { type: "system", text: "§8Type §fhelp§8 for commands — or just ask a question." },
    { type: "system", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const first = input.replace(/^\//, "").split(/\s+/)[0]?.toLowerCase() ?? "";
  const suggestions = !input.includes(" ") && first ? TERM_VERBS.filter((v) => v.startsWith(first) && v !== first).slice(0, 6) : [];

  const run = (raw: string) => {
    const echo: TermLine = { type: "input", text: `§b❯ §f${raw}` };
    const result = runTerminal(raw);
    const a = result.action;
    if (a?.kind === "clear") {
      setLines([{ type: "system", text: "§8Cleared." }]);
      setInput("");
      setHistIdx(-1);
      return;
    }
    if (a?.kind === "open") {
      if (a.projectId) {
        setHash("projects", a.projectId);
        window.dispatchEvent(new Event("hashchange"));
      }
      window.dispatchEvent(new CustomEvent("kros:open-app", { detail: a.app }));
    }
    if (a?.kind === "link") window.open(a.url, "_blank", "noopener,noreferrer");
    if (a?.kind === "toggleDeviant") toggleDeviant();
    if (a?.kind === "setTheme") setTheme(a.theme);
    if (a?.kind === "advancement") setToast({ title: a.title, desc: a.desc });
    setLines((prev) => [...prev, echo, ...result.lines, { type: "system", text: "" }]);
    if (raw.trim()) setHistory((h) => [raw, ...h.filter((x) => x !== raw)].slice(0, 40));
    setHistIdx(-1);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") run(input);
    else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length) setInput(suggestions[0] + " ");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(n);
      setInput(history[n] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(histIdx - 1, -1);
      setHistIdx(n);
      setInput(n === -1 ? "" : history[n] ?? "");
    }
  };

  return (
    <div className="ink-app" style={{ display: "flex", flexDirection: "column", position: "relative", background: "var(--ink-bg)" }} onClick={() => inputRef.current?.focus()}>
      {toast && (
        <div role="status" className="ink-card" style={{ position: "absolute", top: 14, right: 14, zIndex: 2, maxWidth: 300, display: "flex", gap: 12, animation: "ink-in .2s ease-out" }}>
          <span aria-hidden style={{ width: 3, borderRadius: 3, background: "var(--ink-red)", boxShadow: "0 0 10px var(--ink-red)" }} />
          <div>
            <span className="ink-label">Achievement</span>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{toast.title}</div>
            <div className="ink-meta">{toast.desc}</div>
          </div>
        </div>
      )}
      <div className="ink-scroll" role="log" aria-live="polite" style={{ flex: 1, padding: "clamp(16px, 3cqi, 28px)", fontFamily: "var(--font-mono)", fontSize: 13.5, lineHeight: 1.7 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: "1.7em" }}>
            <Segments text={l.text} base={BASE[l.type]} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: "flex", gap: 6, padding: "0 20px 10px", flexWrap: "wrap" }} aria-label="Suggestions">
          {suggestions.map((s) => (
            <button key={s} type="button" className="ink-pill" style={{ padding: "5px 10px" }} onClick={() => { setInput(s + " "); inputRef.current?.focus(); }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderTop: "1px solid var(--ink-line)", fontFamily: "var(--font-mono)", fontSize: 13.5 }}>
        <span className="ink-blue" aria-hidden>kaustav@kr-os ~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal command"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: "var(--ink-fg)", font: "inherit", caretColor: "var(--ink-red)" }}
        />
      </div>
    </div>
  );
}
