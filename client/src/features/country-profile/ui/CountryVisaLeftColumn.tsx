import type { NomadVisaDetails } from "@core/models";
import { Check, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  localizeVisa,
  taxStatusBgClass,
  taxStatusLabelKey,
  taxStatusTextClass,
} from "./country-profile.utils";
import { CountryVisaDurationCostCard } from "./CountryVisaDurationCostCard";

interface CountryVisaLeftColumnProps {
  readonly visa: NomadVisaDetails;
  readonly lang: string;
}

export function CountryVisaLeftColumn({ visa, lang }: CountryVisaLeftColumnProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-5 md:w-[440px] md:flex-shrink-0">
      <CountryVisaDurationCostCard visa={visa} />

      {/* Taxation */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
        <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
          {t("countryPage.taxation")}
        </span>
        <div
          className={`flex items-center gap-1 rounded-lg px-4 py-2.5 ${taxStatusBgClass(visa.tax.status)}`}
        >
          <span className={`text-[13px] font-semibold ${taxStatusTextClass(visa.tax.status)}`}>
            {t(taxStatusLabelKey(visa.tax.status))}
          </span>
          {visa.tax.rate != null && visa.tax.status !== "exempt" ? (
            <span className="font-mono text-[13px] text-dim">
              {" · "}
              {visa.tax.rate}%
            </span>
          ) : null}
        </div>
        {visa.tax.notes !== "" ? (
          <p className="m-0 text-xs text-[#808080]">
            {localizeVisa(visa.tax.notes, visa, (l) => l.tax?.notes, lang)}
          </p>
        ) : null}
      </div>

      {/* Eligibility */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
        <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
          {t("countryPage.eligibilitySection")}
        </span>
        <div className="flex items-center gap-2">
          <User size={14} color="#808080" />
          <span className="text-[13px] text-dim">
            {t("countryPage.minimumAge", { age: visa.eligibility.minAge })}
          </span>
        </div>
        {localizeVisa(
          visa.eligibility.requirements,
          visa,
          (l) => l.eligibility?.requirements,
          lang,
        ).map((req) => (
          <div key={req} className="flex gap-2 pt-1">
            <Check size={13} color="#6B9E6B" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span className="flex-1 text-xs text-on-surface">{req}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
