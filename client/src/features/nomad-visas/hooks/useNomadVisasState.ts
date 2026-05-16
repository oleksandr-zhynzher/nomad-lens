import type { CountryData } from "@core/models";
import { localizeCountry } from "@core/utils";
import type { BudgetMatch } from "@features/budget/hooks";
import type { useWeightState } from "@features/country-ranking/hooks";
import type { SortDirection, SortField } from "@features/nomad-visas/ui/nomad-visas.types";
import {
  applyClimate,
  compareVisaRows,
  computeOverallScore,
} from "@features/nomad-visas/ui/nomad-visas.utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NavigateFunction } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function toggleCodeInSet(prev: Set<string>, code: string): Set<string> {
  const next = new Set(prev);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  return next;
}

interface UseNomadVisasStateInput {
  countries: CountryData[];
  weights: ReturnType<typeof useWeightState>["weights"];
  climatePrefs: ReturnType<typeof useWeightState>["climatePrefs"];
  budgetMatches: BudgetMatch[];
  navigate: NavigateFunction;
  langPrefix: string;
}

export function useNomadVisasState({
  countries,
  weights,
  climatePrefs,
  budgetMatches,
  navigate,
  langPrefix,
}: UseNomadVisasStateInput) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [searchParams] = useSearchParams();
  const highlightCode = searchParams.get("country")?.toUpperCase() ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("country");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  const budgetMatchByCode = useMemo(
    () => new Map(budgetMatches.map((match) => [match.country.code, match])),
    [budgetMatches],
  );

  const toggleSelect = (code: string) => {
    setSelectedCodes((prev) => toggleCodeInSet(prev, code));
  };
  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  };
  const handleCompare = () => {
    if (selectedCodes.size < 2) return;
    void navigate(`${langPrefix}/compare?m=nomadVisas&c=${[...selectedCodes].join(",")}`);
  };

  const searchBarRef = useRef<HTMLDivElement>(null);
  const [theadTop, setTheadTop] = useState(136);
  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const update = () => {
      setTheadTop(56 + el.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const syncHeaderScroll = () => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  };

  const allVisaCountries = useMemo(
    () =>
      countries.filter(
        (c): c is CountryData & { nomadVisa: NonNullable<CountryData["nomadVisa"]> } =>
          !!c.nomadVisa,
      ),
    [countries],
  );

  const visaCountries = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    return allVisaCountries.filter(
      (c) =>
        trimmedQuery === "" ||
        localizeCountry(c, lang).name.toLowerCase().includes(trimmedQuery.toLowerCase()),
    );
  }, [allVisaCountries, searchQuery, lang]);

  const sortedCountries = useMemo(() => {
    const sorted = visaCountries.map((country) => {
      const climateAdjustedCountry = applyClimate(country, climatePrefs);
      return {
        country,
        overallScore: computeOverallScore(climateAdjustedCountry, weights),
        monthlyBudget: budgetMatchByCode.get(country.code)?.monthlyCost ?? null,
      };
    });
    sorted.sort((a, b) => {
      const cmp = compareVisaRows(a, b, sortField, lang);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [budgetMatchByCode, lang, sortField, sortDirection, visaCountries, climatePrefs, weights]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const taxExemptCount = useMemo(
    () => allVisaCountries.filter((c) => c.nomadVisa.tax.status === "exempt").length,
    [allVisaCountries],
  );
  const freeVisaCount = useMemo(
    () => allVisaCountries.filter((c) => c.nomadVisa.cost.amount === 0).length,
    [allVisaCountries],
  );

  return {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    compareMode,
    setCompareMode,
    selectedCodes,
    toggleSelect,
    exitCompareMode,
    handleCompare,
    searchBarRef,
    theadTop,
    headerScrollRef,
    bodyScrollRef,
    syncHeaderScroll,
    allVisaCountries,
    sortedCountries,
    taxExemptCount,
    freeVisaCount,
    highlightCode,
    budgetMatchByCode,
  };
}
