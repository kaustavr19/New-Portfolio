"use client";

import { useCallback } from "react";
import { setHash } from "@/lib/deep-link";
import { useDeviant } from "@/lib/deviant";
import { useTheme } from "@/lib/theme";
import type { ChipAct, TermAction } from "./engine";

/* Performs a terminal side effect or a chip's action (open an app or a
   project, follow a link, switch theme). "ask" chips and "clear" are the
   caller's job — they go back through the session. */
export function useRunAction() {
  const { toggle: toggleDeviant } = useDeviant();
  const { setTheme } = useTheme();
  return useCallback(
    (a?: TermAction | ChipAct) => {
      if (!a) return;
      switch (a.kind) {
        case "open":
          if (a.projectId) {
            setHash("projects", a.projectId);
            window.dispatchEvent(new Event("hashchange"));
          }
          window.dispatchEvent(new CustomEvent("kros:open-app", { detail: a.app }));
          break;
        case "link":
          window.open(a.url, "_blank", "noopener,noreferrer");
          break;
        case "toggleDeviant":
          toggleDeviant();
          break;
        case "setTheme":
          setTheme(a.theme);
          break;
      }
    },
    [toggleDeviant, setTheme],
  );
}
