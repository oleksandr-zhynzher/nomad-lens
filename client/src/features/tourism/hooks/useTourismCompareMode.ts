import { useCallback, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { toggleSetItem } from "@features/tourism/ui/tourism.utils";

export function useTourismCompareMode(langPrefix: string, navigate: NavigateFunction) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => toggleSetItem(prev, code));
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?m=tourism&c=${[...selectedCodes].join(",")}`);
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
