export const PERSONNEL_BRIEF_EVENT = "kros:open-personnel-brief";

export function requestPersonnelBrief() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PERSONNEL_BRIEF_EVENT));
}
