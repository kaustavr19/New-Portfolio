import { useSyncExternalStore } from "react";

export type AudienceId = "recruiter" | "collaborator" | "explorer";

export type AudienceProfile = {
  id: AudienceId;
  eyebrow: string;
  label: string;
  shortLabel: string;
  description: string;
  action: string;
  actionDetail: string;
  accent: string;
};

export const AUDIENCE_STORAGE_KEY = "kros_audience";
export const AUDIENCE_CHANGE_EVENT = "kros:audience-change";

export const audienceProfiles: AudienceProfile[] = [
  {
    id: "recruiter",
    eyebrow: "I'M HIRING",
    label: "Recruiter / hiring team",
    shortLabel: "HIRING",
    description: "See impact, scope, experience, and the resume in one fast pass.",
    action: "OPEN RECRUITER VIEW",
    actionDetail: "Readable evidence brief",
    accent: "#4fc3f7",
  },
  {
    id: "collaborator",
    eyebrow: "I'M BUILDING",
    label: "Founder / collaborator",
    shortLabel: "BUILDING",
    description: "Start with the work, how decisions were made, and where we could collaborate.",
    action: "OPEN FLAGSHIP MISSION",
    actionDetail: "Operation Underwriting",
    accent: "#f5e642",
  },
  {
    id: "explorer",
    eyebrow: "I'M EXPLORING",
    label: "Curious visitor",
    shortLabel: "EXPLORING",
    description: "Enter the desktop, follow your curiosity, and discover the hidden system layers.",
    action: "ENTER KR//OS",
    actionDetail: "Explore freely",
    accent: "#a4c639",
  },
];

export function isAudienceId(value: string | null): value is AudienceId {
  return audienceProfiles.some((profile) => profile.id === value);
}

export function readAudience(): AudienceId | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(AUDIENCE_STORAGE_KEY);
    return isAudienceId(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveAudience(audience: AudienceId) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUDIENCE_STORAGE_KEY, audience);
  } catch {
    // The session still adapts even when persistence is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent<AudienceId>(AUDIENCE_CHANGE_EVENT, { detail: audience }),
  );
}

function subscribeAudience(onStoreChange: () => void) {
  window.addEventListener(AUDIENCE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AUDIENCE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useAudience() {
  return useSyncExternalStore(subscribeAudience, readAudience, () => null);
}
