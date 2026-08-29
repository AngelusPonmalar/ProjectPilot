import { useCallback, useEffect, useState } from "react";

import type { WorkspaceView } from "@/components/workspace/ViewToggle";

const key = (section: string) => `projectpilot:view:${section}`;

/**
 * Remembers the user's chosen view (Normal vs List) per workspace section
 * while navigating inside a project. Defaults to the existing Normal View.
 */
export function useWorkspaceView(section: string, fallback: WorkspaceView = "flow") {
  const [view, setViewState] = useState<WorkspaceView>(fallback);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(key(section));
    if (stored === "flow" || stored === "list") setViewState(stored);
  }, [section]);

  const setView = useCallback(
    (next: WorkspaceView) => {
      setViewState(next);
      if (typeof window !== "undefined") window.localStorage.setItem(key(section), next);
    },
    [section],
  );

  return [view, setView] as const;
}
