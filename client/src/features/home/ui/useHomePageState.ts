import { useCountries, useLangPrefix } from "@core/hooks";
import { useScoring, useWeightState } from "@features/country-ranking/hooks";
import { useHomeCompareMode, useHomeSearch } from "@features/home/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getActiveHighlight } from "./home.utils";

export function useHomePageState() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const lang = i18n.language;
  const ws = useWeightState();

  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialHighlightRef = useRef<string | null | undefined>(undefined);
  if (initialHighlightRef.current === undefined) {
    initialHighlightRef.current = searchParams.get("highlight");
  }

  const { countries, loading, error, refresh } = useCountries();
  const ranked = useScoring(
    countries,
    ws.weights,
    ws.selectedRegions,
    ws.nomadVisaOnly,
    ws.schengenOnly,
    ws.minTouristDays,
    ws.climatePrefs,
  );
  const {
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
  } = useHomeCompareMode(langPrefix, navigate);
  const {
    search,
    updateSearch,
    searchMode,
    setSearchMode,
    matchingCodes,
    matchCursor,
    setMatchCursor,
    goNext,
    goPrev,
    displayedRanked,
    searchInputRef,
    allCodes,
    activeNavCursor,
  } = useHomeSearch(ranked, lang, setExpandedCode);

  useEffect(() => {
    const h = initialHighlightRef.current;
    if (h == null) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("highlight");
        return next;
      },
      { replace: true },
    );
    if (highlightTimer.current != null) clearTimeout(highlightTimer.current);
    const scrollTimer = setTimeout(() => {
      setHighlightedCode(h);
      const el = document.querySelector(`[data-country-code="${h}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      highlightTimer.current = setTimeout(() => {
        setHighlightedCode(null);
      }, 2500);
    }, 80);
    return () => {
      clearTimeout(scrollTimer);
      if (highlightTimer.current != null) {
        clearTimeout(highlightTimer.current);
        highlightTimer.current = null;
      }
    };
  }, [setSearchParams]);

  const regions = useMemo(
    () => [...new Set(countries.map((c) => c.region))].toSorted((a, b) => a.localeCompare(b)),
    [countries],
  );
  const activeHighlight = getActiveHighlight(
    searchMode,
    search,
    matchingCodes,
    matchCursor,
    activeNavCursor,
    highlightedCode,
    allCodes,
  );

  return {
    ws,
    t,
    langPrefix,
    countries,
    loading,
    error,
    refresh,
    ranked,
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
    search,
    updateSearch,
    searchMode,
    setSearchMode,
    matchingCodes,
    matchCursor,
    setMatchCursor,
    goNext,
    goPrev,
    displayedRanked,
    searchInputRef,
    expandedCode,
    setExpandedCode,
    mobileParamsOpen,
    setMobileParamsOpen,
    regions,
    activeHighlight,
    highlightedCode,
  };
}
