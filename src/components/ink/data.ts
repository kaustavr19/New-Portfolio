import { chapters, desktopIcons, profile, projects } from "@/data/content";

/* Derived, Ink-facing views of content.ts — widgets, dock, mobile home. */

export const INK_APPS = desktopIcons.map((ic, i) => ({
  id: ic.id,
  index: String(i + 1).padStart(2, "0"),
  name: ic.label.replace(/\.(exe|tree|log|wav|cfg)$/i, "").replace(/\/$/, ""),
  title: {
    about: "About · KR-19 profile",
    projects: "Projects · missions",
    skills: "Skills · capability map",
    experience: "Experience · timeline",
    contact: "Contact · open channel",
    terminal: "Terminal · ask KR-19",
    settings: "Settings · system",
  }[ic.id] ?? ic.label,
}));

export const LONGFORM_COUNT = projects.filter((p) => p.type !== "side").length;

/* The most recent shipped public engagement, for the "Live now" widget. */
export const LIVE_PROJECT = projects.find((p) => p.live);

/* The in-progress mission, for the "Currently" widget. */
export const CURRENT = (() => {
  const chapter = chapters.find((c) => c.status === "in_progress");
  const mission = chapter?.missions.find((m) => m.status === "in_progress");
  const flagship = projects.find((p) => p.type === "main" && p.status === "IN PROGRESS");
  return { company: chapter?.title ?? "", role: mission?.title ?? "", project: flagship };
})();

export const CITY = profile.location.split(",")[0];
export const TIME_ZONE = "Asia/Kolkata";

export function cityTime(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { h: get("hour"), m: get("minute") };
}

export function cityDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: TIME_ZONE }).format(d).toUpperCase();
}
