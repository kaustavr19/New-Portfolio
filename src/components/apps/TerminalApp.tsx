"use client";

import { useState, useRef, useEffect } from "react";

type Line = { type: "input" | "output" | "error" | "system"; text: string };

const HELP_TEXT = [
  "  help         — show this list",
  "  about        — who is kaustav?",
  "  skills       — list top skills",
  "  projects     — list projects",
  "  experience   — work history",
  "  contact      — how to reach me",
  "  clear        — clear terminal",
  "  sudo hire    — make a great decision",
  "  craft        — open crafting table 🪵",
];

const COMMANDS: Record<string, string[]> = {
  help: HELP_TEXT,
  about: [
    "  NAME:    Kaustav Roy",
    "  ROLE:    Design Consultant",
    "  COMPANY: Fractal",
    "  FOCUS:   AI-powered enterprise UX",
    "  XP:      3+ years",
    "  BIOME:   Bengaluru, India",
  ],
  skills: [
    "  [██████████] Product Design     95/100",
    "  [█████████░] UX Research        90/100",
    "  [████████░░] Design Systems     87/100",
    "  [████████░░] AI/UX Strategy     88/100",
    "  [███████░░░] Figma              95/100",
    "  [███████░░░] Data Visualization 80/100",
  ],
  projects: [
    "  > FlinQ       — Community design platform [IN PROGRESS]",
    "  > DevCom      — Developer collaboration app [LIVE]",
    "  > StayPut     — Focus productivity tool [LIVE]",
    "  > Shikshalay  — Education UX prototype [SHIPPED]",
  ],
  experience: [
    "  2026–now  Design Consultant (Insurance) @ Fractal",
    "  2025–2026 Design Consultant (CPG) @ Fractal",
    "  2024–2025 Design Consultant (Cogentiq AI) @ Fractal",
    "  2023–2024 Design Staff II @ Eugenie.ai",
    "  2022–2023 Design Intern @ Eugenie.ai",
    "  2020–2021 UI Designer @ Quordnet Academy",
  ],
  contact: [
    "  EMAIL:    kaustav.ux@gmail.com",
    "  LINKEDIN: linkedin.com/in/kaustavr19",
    "  STATUS:   open to opportunities",
  ],
  "sudo hire": [
    "  [sudo] password for hiring-manager: ••••••••",
    "  Verifying credentials...",
    "  ACCESS GRANTED.",
    "  ✓ Excellent decision. You should hire Kaustav.",
    "  ✓ He is friendly, talented, and ships things.",
    "  ✓ Email him at: kaustav.ux@gmail.com",
  ],
  craft: [
    "  +---+---+---+",
    "  | 🪵| 🪵|   |",
    "  +---+---+---+",
    "  | 🪵| 🪵|   |",
    "  +---+---+---+",
    "  |   |   |   |",
    "  +---+---+---+",
    "  Result: 🪑 Chair  (crafted by Kaustav)",
  ],
};

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>([
    { type: "system", text: "KR//OS Minecraft Terminal v1.0" },
    { type: "system", text: 'Type "help" for a list of commands.' },
    { type: "system", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const run = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines: Line[] = [
      ...lines,
      { type: "input", text: `> ${cmd}` },
    ];

    if (trimmed === "clear") {
      setLines([{ type: "system", text: "Terminal cleared." }]);
      setInput("");
      return;
    }

    const response = COMMANDS[trimmed];
    if (response) {
      response.forEach((r) => newLines.push({ type: "output", text: r }));
    } else if (trimmed === "") {
      // do nothing
    } else {
      newLines.push({
        type: "error",
        text: `  Unknown command: "${cmd}". Try "help".`,
      });
    }

    newLines.push({ type: "system", text: "" });
    setLines(newLines);
    setHistory((h) => [cmd, ...h.filter((x) => x !== cmd)].slice(0, 30));
    setHistIdx(-1);
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : history[next] ?? "");
    }
  };

  const lineColor: Record<string, string> = {
    input: "#5aaf26",
    output: "#aaaaaa",
    error: "#ff5555",
    system: "#555555",
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "#0f0f0f", fontFamily: "'Press Start 2P', monospace" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output */}
      <div className="flex-1 overflow-auto space-y-0.5" style={{ padding: "28px 36px" }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: 9,
              lineHeight: 1.8,
              color: lineColor[line.type],
              whiteSpace: "pre",
            }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        className="flex items-center py-3"
        style={{ paddingLeft: 36, paddingRight: 36, borderTop: "2px solid #333", background: "#0a0a0a" }}
      >
        <span style={{ fontSize: 9, color: "#5aaf26", marginRight: 8 }}>
          kaustav@kr-os ~$
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
          className="flex-1 bg-transparent outline-none"
          style={{
            fontSize: 9,
            color: "#5aaf26",
            fontFamily: "'Press Start 2P', monospace",
            caretColor: "#5aaf26",
          }}
        />
        <span
          style={{
            fontSize: 9, color: "#5aaf26",
            animation: "blink 0.7s step-end infinite",
          }}
        >
          █
        </span>
      </div>
    </div>
  );
}
