"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { desktopIcons } from "@/data/content";
import { audienceProfiles, useAudience } from "@/lib/audience";
import { requestPersonnelBrief } from "@/lib/personnel-brief";
import { useReaderMode } from "@/lib/reader-mode";

const MONO = "'Share Tech Mono', monospace";
const SANS = "'Rajdhani', sans-serif";

type Command = {
  id: string;
  label: string;
  detail: string;
  icon: string;
  accent: string;
  keywords: string;
  run: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenApp: (id: string) => void;
  onMinimizeAll: () => void;
  onCloseAll: () => void;
};

const APP_ACCENTS: Record<string, string> = {
  detroit: "#4fc3f7",
  cyberpunk: "#f5e642",
  gta: "#a4c639",
  rdr2: "#c8a96e",
  tlou: "#7ab648",
  minecraft: "#5aaf26",
  settings: "#b388ff",
};

export default function CommandCenter({
  open,
  onClose,
  onOpenApp,
  onMinimizeAll,
  onCloseAll,
}: Props) {
  const [query, setQuery] = useState("");
  const audience = useAudience();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { setOpen: setReaderOpen } = useReaderMode();

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      setQuery("");
      inputRef.current?.focus();
    }, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  const closeCommandCenter = () => {
    setQuery("");
    onClose();
  };

  const run = (action: () => void) => {
    action();
    closeCommandCenter();
  };

  const commands = useMemo<Command[]>(() => {
    const apps = desktopIcons.map((icon) => ({
      id: `app-${icon.id}`,
      label: `Open ${icon.label}`,
      detail: "Application",
      icon: icon.icon,
      accent: APP_ACCENTS[icon.theme] ?? "#e0e0e8",
      keywords: `${icon.label} ${icon.id} app`,
      run: () => onOpenApp(icon.id),
    }));
    const profile = audienceProfiles.find((item) => item.id === audience);
    const recommended: Command[] =
      audience === "recruiter"
        ? [
            {
              id: "recommended",
              label: "Continue recruiter route",
              detail: "Readable evidence brief",
              icon: "book",
              accent: profile?.accent ?? "#4fc3f7",
              keywords: "recommended recruiter hiring brief reader",
              run: () => setReaderOpen(true),
            },
          ]
        : audience === "collaborator"
          ? [
              {
                id: "recommended",
                label: "Continue builder route",
                detail: "Open flagship mission",
                icon: "folder",
                accent: profile?.accent ?? "#f5e642",
                keywords: "recommended collaborator founder building project flagship",
                run: () => onOpenApp("projects"),
              },
            ]
          : audience === "explorer"
            ? [
                {
                  id: "recommended",
                  label: "Continue explorer route",
                  detail: "Open the hidden terminal",
                  icon: "code-block",
                  accent: profile?.accent ?? "#a4c639",
                  keywords: "recommended explorer curious terminal hidden",
                  run: () => onOpenApp("terminal"),
                },
              ]
            : [];

    return [
      ...recommended,
      ...apps,
      {
        id: "reader",
        label: "Open reader mode",
        detail: "Accessible portfolio overview",
        icon: "book",
        accent: "#4fc3f7",
        keywords: "reader recruiter overview accessible brief",
        run: () => setReaderOpen(true),
      },
      {
        id: "audience",
        label: "Change visitor route",
        detail: profile ? `Current: ${profile.label}` : "Choose a guided path",
        icon: "users",
        accent: "#f5e642",
        keywords: "audience onboarding route hiring building exploring",
        run: requestPersonnelBrief,
      },
      {
        id: "minimize",
        label: "Minimize all windows",
        detail: "Reveal the desktop",
        icon: "minus",
        accent: "#febc2e",
        keywords: "desktop minimize hide windows",
        run: onMinimizeAll,
      },
      {
        id: "close",
        label: "Close all windows",
        detail: "Clear the workspace",
        icon: "times",
        accent: "#ff5f57",
        keywords: "desktop close clear windows",
        run: onCloseAll,
      },
    ];
  }, [audience, onCloseAll, onMinimizeAll, onOpenApp, setReaderOpen]);

  const normalized = query.trim().toLowerCase();
  const visibleCommands = commands
    .filter((command) =>
      normalized
        ? `${command.label} ${command.detail} ${command.keywords}`
            .toLowerCase()
            .includes(normalized)
        : true,
    )
    .slice(0, 9);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center"
      style={{
        zIndex: 9992,
        padding: "max(72px, 10vh) 16px 64px",
        background: "rgba(2,5,14,0.58)",
        backdropFilter: "blur(6px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCommandCenter();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-center-title"
        className="w-full overflow-hidden self-start"
        style={{
          maxWidth: 620,
          background: "rgba(10,15,27,0.985)",
          border: "1px solid rgba(79,195,247,0.42)",
          borderRadius: 5,
          boxShadow: "0 28px 90px rgba(0,0,0,0.75), 0 0 36px rgba(79,195,247,0.08)",
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ padding: "16px 18px", borderBottom: "1px solid rgba(79,195,247,0.16)" }}
        >
          <i className="hn hn-search" aria-hidden style={{ color: "#4fc3f7", fontSize: 18 }} />
          <label id="command-center-title" htmlFor="kros-command-search" className="sr-only">
            Search commands
          </label>
          <input
            ref={inputRef}
            id="kros-command-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeCommandCenter();
              if (event.key === "Enter" && visibleCommands.length === 1) {
                run(visibleCommands[0].run);
              }
            }}
            placeholder="Search apps, routes, and system actions..."
            autoComplete="off"
            style={{
              width: "100%",
              minWidth: 0,
              background: "transparent",
              border: 0,
              outline: 0,
              color: "#f2f8ff",
              fontFamily: SANS,
              fontSize: 18,
            }}
          />
          <kbd
            style={{
              padding: "3px 7px",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 3,
              color: "#8b9baa",
              fontFamily: MONO,
              fontSize: 9,
            }}
          >
            ESC
          </kbd>
        </div>

        <div style={{ maxHeight: "min(520px, calc(100dvh - 190px))", overflowY: "auto", padding: 8 }}>
          {visibleCommands.length ? (
            visibleCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                onClick={() => run(command.run)}
                className="group flex w-full items-center gap-3 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5"
                style={{
                  padding: "11px 12px",
                  borderRadius: 3,
                  border: "1px solid transparent",
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    border: `1px solid ${command.accent}55`,
                    color: command.accent,
                    background: `${command.accent}0c`,
                    borderRadius: 3,
                  }}
                >
                  <i className={`hn hn-${command.icon}`} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span style={{ display: "block", color: "#e8edf3", fontFamily: SANS, fontSize: 15 }}>
                    {command.label}
                  </span>
                  <span style={{ display: "block", color: "#748594", fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", marginTop: 2 }}>
                    {command.detail}
                  </span>
                </span>
                {index === 0 && audience && !normalized && (
                  <span style={{ color: command.accent, fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em" }}>
                    RECOMMENDED
                  </span>
                )}
              </button>
            ))
          ) : (
            <div style={{ padding: "28px 16px", color: "#7d8d9b", fontFamily: MONO, fontSize: 11, textAlign: "center" }}>
              NO COMMANDS MATCH &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <footer
          className="flex items-center justify-between"
          style={{
            padding: "9px 14px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            color: "#586978",
            fontFamily: MONO,
            fontSize: 8,
            letterSpacing: "0.1em",
          }}
        >
          <span>KR//OS COMMAND CENTER</span>
          <span>CTRL / CMD + K</span>
        </footer>
      </section>
    </div>
  );
}
