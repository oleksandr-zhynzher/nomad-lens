import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCountries, useLangPrefix } from "@core/hooks";
import {
  useTourismScoring,
  useTourismWeightState,
  useTourismSearch,
  useTourismCompareMode,
} from "@features/tourism/hooks";

export function useTourismPage() {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const { countries, loading } = useCountries();
  const ws = useTourismWeightState();
  const ranked = useTourismScoring(
    countries,
    ws.weights,
    ws.selectedRegions,
    ws.toggles,
    ws.budgetState,
    ws.travelDates,
  );
  const searchState = useTourismSearch(ranked, i18n.language);
  const compareState = useTourismCompareMode(langPrefix, navigate);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);
  return {
    t,
    ws,
    loading,
    ranked,
    mobileParamsOpen,
    setMobileParamsOpen,
    expandedCode,
    setExpandedCode,
    ...searchState,
    ...compareState,
  };
}
