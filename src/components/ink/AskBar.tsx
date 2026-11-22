"use client";

import { useEffect, useRef, useState } from "react";
import type { Chip } from "@/lib/terminal/engine";
import { termSession, useTermSession } from "@/lib/terminal/session";
import { useRunAction } from "@/lib/terminal/useRunAction";
import { ChipRow, TermLines } from "./TermText";
import { Icon } from "./ui";

/* ──────────────────────────────────────────────────────────
   Ask KR-19 — the quick-question bar.

   Desktop: lives in the dock; "/" or ⌘K focuses it. Phone: the pill at
   the bottom of the home screen. Either way the answer pops up in a card
   above the bar, with follow-up chips; "Open in Terminal" carries the
   conversation into the full terminal window (it's one shared session).
   ────────────────────────────────────────────────────────── */

export default function AskBar({ variant }: { variant: "dock" | "mobile" }) {
  const { blocks, history } = useTermSession();
  const runAction = useRunAction();
  const [value, setValue] = useState("");
  const [shownId, setShownId] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [histIdx, setHistIdx] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = shownId === null ? null : blocks.find((b) => b.id === shownId) ?? null;
  const dock = variant === "dock";

  const close = () => setShownId(null);

  const submit = (q: string) => {
    if (!q.trim()) return;
    const { block, result } = termSession.run(q);
    if (result.action && result.action.kind !== "clear") runAction(result.action);
    setShownId(block?.id ?? null);
    setValue("");
    setHistIdx(-1);
    if (!dock) inputRef.current?.blur(); // let the phone keyboard drop so the answer is visible
  };

  const onChip = (c: Chip) => {
    if (c.act.kind === "ask") submit(c.act.q);
    else {
      runAction(c.act);
      close();
    }
  };

  const expand = () => {
    window.dispatchEvent(new CustomEvent("kros:open-app", { detail: "terminal" }));
    close();
  };

  // "/" or ⌘K / Ctrl+K focuses the dock bar from anywhere on the desktop.
  useEffect(() => {
    if (!dock) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dock]);

  // Click anywhere else closes the card.
  useEffect(() => {
    if (shownId === null) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [shownId]);

  // Keep the newest answer in view when the card scrolls (phone).
  useEffect(() => {
    cardRef.current?.scrollTo({ top: 0 });
  }, [shownId]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (dock) submit(value); // the phone bar is a <form>; its submit handles Enter
    } else if (e.key === "Escape") {
      if (shownId !== null) close();
      else inputRef.current?.blur();
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const n = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(n);
      setValue(history[n] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(histIdx - 1, -1);
      setHistIdx(n);
      setValue(n === -1 ? "" : history[n] ?? "");
    }
  };

  const card = shown && (
    <div
      ref={cardRef}
      role="region"
      aria-label="Answer from KR-19"
      aria-live="polite"
      className="ink-card ink-scroll"
      style={{
        position: "absolute",
        bottom: "calc(100% + 12px)",
        ...(dock ? { left: "50%", transform: "translateX(-50%)", width: "min(560px, calc(100vw - 32px))" } : { left: 0, right: 0 }),
        maxHeight: dock ? "min(56vh, 520px)" : "58vh",
        padding: "14px 18px 16px",
        boxShadow: "var(--ink-shadow)",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        lineHeight: 1.6,
        textAlign: "left",
        zIndex: 2,
        animation: "ink-in .16s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span className="ink-label">KR-19</span>
        <span style={{ marginLeft: "auto" }} />
        <button type="button" data-tick onClick={expand} className="ink-label ink-blue" style={{ padding: "2px 4px" }}>
          Open in Terminal ↗
        </button>
        <button type="button" onClick={close} aria-label="Close answer" style={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: "50%", color: "var(--ink-mute)" }}>
          ×
        </button>
      </div>
      {shown.input && (
        <div style={{ color: "var(--ink-fg)", marginBottom: 6 }}>
          <span style={{ color: "var(--ink-blue)" }}>❯ </span>
          {shown.input}
        </div>
      )}
      <TermLines lines={shown.lines} />
      <ChipRow chips={shown.chips} onChip={onChip} />
    </div>
  );

  if (dock) {
    return (
      <div ref={rootRef} style={{ display: "flex", alignItems: "center" }}>
        {card}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            borderRadius: "var(--r-pill)",
            background: focused ? "var(--ink-raised)" : "transparent",
            border: `1px solid ${focused ? "var(--ink-line-strong)" : "transparent"}`,
            transition: "background .15s, border-color .15s",
            cursor: "text",
          }}
        >
          <Icon name="search" size={14} color="var(--ink-mute)" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask KR-19…"
            aria-label="Ask KR-19 a question about Kaustav"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: focused || value ? 240 : 120,
              transition: "width .18s ease",
              background: "transparent",
              border: 0,
              outline: "none",
              color: "var(--ink-fg)",
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              caretColor: "var(--ink-red)",
            }}
          />
          {!focused && !value && (
            <kbd className="ink-label" aria-hidden style={{ border: "1px solid var(--ink-line-strong)", borderRadius: 5, padding: "1px 6px", letterSpacing: 0 }}>
              /
            </kbd>
          )}
        </label>
      </div>
    );
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {card}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 8px 18px", borderRadius: 999, background: "var(--ink-raised)", border: "1px solid var(--ink-line)" }}
      >
        <Icon name="search" size={16} color="var(--ink-mute)" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask KR-19 anything…"
          aria-label="Ask KR-19 a question about Kaustav"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="send"
          style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "var(--ink-fg)", fontFamily: "var(--font-mono)", fontSize: 14, caretColor: "var(--ink-red)", padding: "6px 0" }}
        />
        <button
          type={value.trim() ? "submit" : "button"}
          onClick={value.trim() ? undefined : expand}
          className="ink-label ink-blue"
          style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid var(--ink-blue-soft)", whiteSpace: "nowrap" }}
        >
          {value.trim() ? "Ask ↵" : "Terminal →"}
        </button>
      </form>
    </div>
  );
}
