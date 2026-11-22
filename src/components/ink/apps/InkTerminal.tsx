"use client";

import { useEffect, useRef, useState } from "react";
import { TERM_VERBS, type Chip } from "@/lib/terminal/engine";
import { termSession, useTermSession } from "@/lib/terminal/session";
import { useRunAction } from "@/lib/terminal/useRunAction";
import { ChipRow, TermLines } from "../TermText";

/* InkOS terminal window. Same engine as the classic terminal, and the same
   conversation as the dock / phone ask bar (lib/terminal/session), so a
   question asked there is already here. Answers come with follow-up chips. */
export default function InkTerminal() {
  const { blocks, history } = useTermSession();
  const runAction = useRunAction();
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState(-1);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [blocks]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const first = input.replace(/^\//, "").split(/\s+/)[0]?.toLowerCase() ?? "";
  const suggestions = !input.includes(" ") && first ? TERM_VERBS.filter((v) => v.startsWith(first) && v !== first).slice(0, 6) : [];

  const run = (raw: string) => {
    const { result } = termSession.run(raw);
    const a = result.action;
    if (a?.kind === "advancement") setToast({ title: a.title, desc: a.desc });
    else if (a && a.kind !== "clear") runAction(a);
    setHistIdx(-1);
    setInput("");
  };

  const onChip = (c: Chip) => {
    if (c.act.kind === "ask") run(c.act.q);
    else runAction(c.act);
    inputRef.current?.focus();
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

  const last = blocks[blocks.length - 1];

  return (
    <div className="ink-app" style={{ display: "flex", flexDirection: "column", position: "relative", background: "var(--ink-bg)" }} onClick={(e) => { if (!(e.target as HTMLElement).closest("button, a")) inputRef.current?.focus(); }}>
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
        {blocks.map((b) => (
          <div key={b.id} style={{ marginBottom: "1.1em" }}>
            {b.input !== undefined && (
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--ink-fg)" }}>
                <span style={{ color: "var(--ink-blue)" }}>❯ </span>
                {b.input}
              </div>
            )}
            <TermLines lines={b.lines} />
            {/* Only the latest answer keeps live follow-ups; older ones are history. */}
            {b === last && <ChipRow chips={b.chips} onChip={onChip} />}
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
          aria-label="Terminal command or question"
          placeholder="ask anything, or type help"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: "var(--ink-fg)", font: "inherit", caretColor: "var(--ink-red)" }}
        />
      </div>
    </div>
  );
}
