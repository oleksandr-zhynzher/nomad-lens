import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCountries } from "@core/hooks";
import { useLangPrefix } from "@core/hooks";
import { AI_CATEGORY_KEYS, DISPLAYED_CORE_CATEGORY_KEYS } from "@core/models";
import { useWeightState } from "@features/country-ranking/hooks";
import { useTourismWeightState } from "@features/tourism/hooks";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
import { normalizeCountryCodes } from "@features/compare/utils";
import {
  buildCompareShareParams,
  getRawCompareCountryCodes,
  parseCompareCountryCodes,
  parseCompareMode,
  setCompareCountryCodesParam,
  setCompareModeParam,
  delayedReset,
  applyPanelHeight,
  getActionGridClass,
  getSortIconClass,
} from "@features/compare/utils";
import type { CompareMode, SortDirection } from "@features/compare/utils";
import { SORTABLE_COMPARE_MODES, SHOW_WEIGHTS_MODES } from "@features/compare/constants";

const MOBILE_VIEWPORT_MAX_WIDTH = 1024;

export function useCompareView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const compareMode = parseCompareMode(searchParams);

  const [showWeights, setShowWeights] = useState(compareMode === "budget");
  const [countrySelectionCount, setCountrySelectionCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sortFeedbackActive, setSortFeedbackActive] = useState(false);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  const ws = useWeightState();
  const tws = useTourismWeightState();
  const langPrefix = useLangPrefix();
  const { countries } = useCountries();

  const validCountryCodes = useMemo(
    () => new Set(countries.map((country) => country.code.toUpperCase())),
    [countries],
  );
  const rawSelectedCodes = useMemo(() => getRawCompareCountryCodes(searchParams), [searchParams]);
  const selectedCodes = useMemo(
    () => parseCompareCountryCodes(searchParams, validCountryCodes),
    [searchParams, validCountryCodes],
  );

  const bs = useBudgetState();
  const budgetMatches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.bedrooms,
    bs.peopleCount,
    bs.categoryWeights,
    bs.qualityBlend,
  );

  const coreIndicatorCount = DISPLAYED_CORE_CATEGORY_KEYS.length;
  const aiIndicatorCount = AI_CATEGORY_KEYS.length;
  const nomadVisaCountryCount = countries.filter((country) => country.hasNomadVisa).length;

  const compareCoreIndicatorsLabel = t("compare.coreIndicatorsLabel", {
    count: coreIndicatorCount,
  });
  const compareAiIndicatorsLabel = t("compare.aiIndicatorsLabel", { count: aiIndicatorCount });

  const panelRef = useRef<HTMLDivElement>(null);
  const syncPanelHeight = useCallback(() => {
    applyPanelHeight(panelRef.current);
  }, []);

  useEffect(() => {
    if (!showWeights) return;
    requestAnimationFrame(syncPanelHeight);
    window.addEventListener("scroll", syncPanelHeight, { passive: true });
    window.addEventListener("resize", syncPanelHeight, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncPanelHeight);
      window.removeEventListener("resize", syncPanelHeight);
    };
  }, [showWeights, syncPanelHeight]);

  useEffect(() => {
    if (countries.length === 0) return;
    if (rawSelectedCodes.join(",") === selectedCodes.join(",")) return;
    const syncNext = new URLSearchParams(searchParams);
    setCompareCountryCodesParam(syncNext, selectedCodes);
    setSearchParams(syncNext, { replace: true });
  }, [countries.length, rawSelectedCodes, searchParams, selectedCodes, setSearchParams]);

  const setCompareMode = (mode: CompareMode) => {
    if (SHOW_WEIGHTS_MODES.has(mode)) {
      setShowWeights(true);
    }
    const modeNext = new URLSearchParams(searchParams);
    setCompareModeParam(modeNext, mode);
    setSearchParams(modeNext, { replace: true });
  };

  const handleSelectedCodesChange = (codes: string[]) => {
    const nextCodes = normalizeCountryCodes(codes, validCountryCodes);
    const codesNext = new URLSearchParams(searchParams);
    setCompareCountryCodesParam(codesNext, nextCodes);
    setSearchParams(codesNext, { replace: true });
  };

  const handleShare = () => {
    ws.handleShare(buildCompareShareParams(compareMode, selectedCodes));
    setCopied(true);
    delayedReset(setCopied, 3000);
  };

  const handleSortByScore = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    setSortFeedbackActive(true);
    delayedReset(setSortFeedbackActive, 1000);
  };

  const sortableSelectionCount =
    compareMode === "budget" ? selectedCodes.length : countrySelectionCount;
  const showSortAction = SORTABLE_COMPARE_MODES.has(compareMode) && sortableSelectionCount > 1;
  const actionGridClassName = getActionGridClass(showSortAction);

  const sortButtonBaseLabels: Record<CompareMode, string> = {
    countries: t("compare.sortByScore"),
    regions: t("compare.sortByScore"),
    budget: t("compare.sortByBudget"),
    tourism: t("compare.sortByScore"),
    nomadVisas: t("compare.sortByScore"),
  };
  const sortButtonLabel = sortFeedbackActive
    ? t("compare.sorted")
    : sortButtonBaseLabels[compareMode];
  const sortButtonIconClassName = getSortIconClass(sortDirection);

  const compareTitles: Record<CompareMode, string> = {
    countries: t("compare.countryTitle"),
    regions: t("compare.regionTitle"),
    budget: t("compare.budgetTitle", "Budget Comparison"),
    tourism: t("compare.tourismTitle", "Tourism Comparison"),
    nomadVisas: t("compare.nomadVisaTitle"),
  };
  const compareTitle = compareTitles[compareMode];

  const compareSubtitles: Record<CompareMode, string> = {
    countries: t("compare.countrySubtitle", {
      coreIndicatorsLabel: compareCoreIndicatorsLabel,
      aiIndicatorsLabel: compareAiIndicatorsLabel,
    }),
    regions: t("compare.regionSubtitle"),
    budget: t(
      "compare.budgetSubtitle",
      "Compare monthly cost of living across countries side by side",
    ),
    tourism: t("compare.tourismSubtitle", "Compare tourism appeal across countries side by side"),
    nomadVisas: t("compare.nomadVisaSubtitle"),
  };
  const compareSubtitle = compareSubtitles[compareMode];

  const handleToggleWeights = () => {
    if (window.innerWidth <= MOBILE_VIEWPORT_MAX_WIDTH) {
      setMobileParamsOpen(true);
    } else {
      setShowWeights((p) => !p);
    }
  };

  return {
    compareMode,
    setCompareMode,
    sortDirection,
    showWeights,
    setShowWeights,
    mobileParamsOpen,
    setMobileParamsOpen,
    copied,
    sortFeedbackActive,
    selectedCodes,
    handleSelectedCodesChange,
    handleShare,
    handleSortByScore,
    handleToggleWeights,
    showSortAction,
    actionGridClassName,
    sortButtonLabel,
    sortButtonIconClassName,
    compareTitle,
    compareSubtitle,
    panelRef,
    setCountrySelectionCount,
    ws,
    tws,
    bs,
    budgetMatches,
    countries,
    langPrefix,
    nomadVisaCountryCount,
    coreIndicatorCount,
    aiIndicatorCount,
  };
}
