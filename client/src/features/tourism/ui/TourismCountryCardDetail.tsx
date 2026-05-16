import { useLangPrefix } from "@core/hooks";
import type { CountryData } from "@core/models";
import type { TourismBudgetMatch } from "@features/tourism/utils";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { TourismBreakdownChart } from "./TourismBreakdownChart";
import { TourismBudgetBreakdownGrid } from "./TourismBudgetBreakdownGrid";

interface TourismCountryCardDetailProps {
  readonly country: CountryData;
  readonly budgetMatch?: TourismBudgetMatch;
  readonly borderColor: string;
}

export function TourismCountryCardDetail({
  country,
  budgetMatch,
  borderColor,
}: TourismCountryCardDetailProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  return (
    <div
      className="border-t border-[var(--bt-c)] bg-[#111113] px-4 py-4"
      style={{ "--bt-c": borderColor } as React.CSSProperties}
    >
      <TourismBreakdownChart country={country} />
      {budgetMatch ? <TourismBudgetBreakdownGrid budgetMatch={budgetMatch} /> : null}
      <Link
        to={`${langPrefix}/country/${country.code.toLowerCase()}`}
        className="interactive-cta-link mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#3A404B] text-sm font-semibold tracking-[0.2px] text-[#D7AE82] no-underline transition-colors [background:linear-gradient(180deg,rgba(28,31,36,0.95)_0%,rgba(20,22,26,0.98)_100%)]"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {t("tourism.viewCountry", "View Profile")} →
      </Link>
    </div>
  );
}
