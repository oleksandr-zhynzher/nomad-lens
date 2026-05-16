import { useCountries, useLangPrefix } from "@core/hooks";
import { useBudgetMatcher, useBudgetState } from "@features/budget/hooks";
import { useTranslation } from "react-i18next";

import { BudgetPageContent } from "./BudgetPageContent";

export function BudgetMatcherPage() {
  const { i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const { countries, loading } = useCountries();
  const bs = useBudgetState();
  const matches = useBudgetMatcher(
    countries,
    bs.budget,
    bs.housing,
    bs.bedrooms,
    bs.peopleCount,
    bs.categoryWeights,
    bs.qualityBlend,
  );
  return (
    <BudgetPageContent
      loading={loading}
      matches={matches}
      bs={bs}
      langPrefix={langPrefix}
      lang={i18n.language}
    />
  );
}
