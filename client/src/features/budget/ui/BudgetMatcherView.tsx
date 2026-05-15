import { useTranslation } from "react-i18next";
import { useLangPrefix } from "@core/hooks";
import { useCountries } from "@core/hooks";
import { useBudgetMatcher } from "@features/budget/hooks";
import { useBudgetState } from "@features/budget/hooks";
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
