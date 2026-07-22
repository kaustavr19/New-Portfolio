// Grammar: #<appId> or #<appId>/<subId> — e.g. "#projects" or "#projects/operation-underwriting".
// Read/write location.hash directly (no next/navigation) so this stays purely
// additive on top of a single-route, client-rendered "OS" with no routing today.
export type HashTarget = { app: string; subId?: string };

export function parseHash(hash?: string): HashTarget | null {
  const raw = (hash ?? (typeof window !== "undefined" ? window.location.hash : "")).replace(/^#\/?/, "");
  if (!raw) return null;
  const [app, subId] = raw.split("/");
  return app ? { app, subId: subId || undefined } : null;
}

export function setHash(app: string, subId?: string) {
  if (typeof window === "undefined") return;
  const next = "#" + app + (subId ? `/${subId}` : "");
  if (window.location.hash === next) return;
  window.history.replaceState(null, "", next);
}

// App-level-only update (Desktop/MobileOS opening or focusing a window).
// Leaves the hash untouched if it already names this same app — otherwise a
// window being (re)focused would strip a subId a child component (e.g.
// ProjectsApp) wrote for its own selection, including on the very first
// mount when a deep link like "#projects/wild-india-atlas" is still being
// read by that child.
export function setAppHash(app: string) {
  const current = parseHash();
  if (current?.app === app) return;
  setHash(app);
}
