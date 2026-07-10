"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const MAX_COMPARE = 3;

interface CompareContextValue {
  selectedIds: string[];
  toggle: (athleteId: string) => void;
  clear: () => void;
  isSelected: (athleteId: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((athleteId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(athleteId)) return prev.filter((id) => id !== athleteId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, athleteId];
    });
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const value = useMemo(
    () => ({
      selectedIds,
      toggle,
      clear,
      isSelected: (id: string) => selectedIds.includes(id),
      isFull: selectedIds.length >= MAX_COMPARE,
    }),
    [selectedIds, toggle, clear]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
