"use client";

import { emptyJournal } from "@/lib/journal";
import type { JournalDraft } from "@/types/journal";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type JournalContextValue = {
  draft: JournalDraft;
  setDraft: (next: JournalDraft | ((prev: JournalDraft) => JournalDraft)) => void;
  editing: boolean;
  setEditing: (next: boolean) => void;
  tabBarLocked: boolean;
  setTabBarLocked: (next: boolean) => void;
};

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<JournalDraft>(emptyJournal);
  const [editing, setEditing] = useState(false);
  const [tabBarLocked, setTabBarLocked] = useState(false);

  const updateDraft = useCallback((next: JournalDraft | ((prev: JournalDraft) => JournalDraft)) => {
    setDraft(next);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setDraft: updateDraft,
      editing,
      setEditing,
      tabBarLocked,
      setTabBarLocked,
    }),
    [draft, editing, tabBarLocked, updateDraft],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal 은 JournalProvider 안에서만 사용할 수 있어요.");
  return ctx;
}
