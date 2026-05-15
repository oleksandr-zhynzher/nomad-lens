import { useCallback, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

export function useHomeCompareMode(langPrefix: string, navigate: NavigateFunction) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?c=${[...selectedCodes].join(",")}`);
  }, [selectedCodes, navigate, langPrefix]);

  return {
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
  };
}
