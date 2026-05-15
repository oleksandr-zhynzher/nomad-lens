import { Calendar, Check, CreditCard, RefreshCw, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails } from "@core/models";
import {
  localizeVisa,
  taxStatusBgClass,
  taxStatusTextClass,
  taxStatusLabelKey,
} from "./country-profile.utils";

interface CountryVisaLeftColumnProps {
  readonly visa: NomadVisaDetails;
  readonly lang: string;
}

export function CountryVisaLeftColumn({ visa, lang }: CountryVisaLeftColumnProps) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-5 md:w-[440px] md:flex-shrink-0">
      {/* Duration & Cost */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
        <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
          {t("countryPage.durationCost")}
        </span>
        <div className="flex items-center gap-2">
          <Calendar size={16} color="#8F5A3C" />
          <span className="text-sm text-[#E8E9EB]">
            {t("countryPage.monthsInitial", { count: visa.duration.initial })}
          </span>
          <div className="flex-1" />
          {visa.duration.maxExtension > 0 ? (
            <span className="text-[11px] text-[#C2956A]">
              {t("countryPage.moExtension", { count: visa.duration.maxExtension })}
            </span>
          ) : null}
        </div>
        {visa.duration.renewable ? (
          <div className="flex items-center gap-2">
            <RefreshCw size={16} color="#6B9E6B" />
            <span className="text-sm text-[#6B9E6B]">{t("countryPage.renewable")}</span>
          </div>
        ) : null}
        <div className="h-px bg-[#1E1E1E]" />
        <div className="flex items-center gap-2">
          <CreditCard size={16} color="#8F5A3C" />
          <span
            className={`font-mono text-[22px] font-bold ${visa.cost.amount === 0 ? "text-[#44CC66]" : "text-[#E8E9EB]"}`}
          >
            {visa.cost.amount === 0
              ? t("countryPage.free")
              : `${visa.cost.currency} ${visa.cost.amount.toLocaleString()}`}
          </span>
          <span className="text-[11px] text-dim">{t("countryPage.applicationFee")}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-bg px-4 py-3">
          <span className="text-[9px] tracking-[1px] text-dimmer uppercase">
            {t("countryPage.incomeRequirement")}
          </span>
          {visa.incomeRequirement.monthly == null ? (
            visa.incomeRequirement.annual == null ? (
              <span className="font-mono text-[18px] font-bold text-[#44CC66]">
                {t("countryPage.visa.noMinimum")}
              </span>
            ) : (
              <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                {visa.incomeRequirement.currency} {visa.incomeRequirement.annual.toLocaleString()}{" "}
                {t("countryPage.perYear")}
              </span>
            )
          ) : (
            <>
              <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                {visa.incomeRequirement.currency} {visa.incomeRequirement.monthly.toLocaleString()}{" "}
                {t("countryPage.perMonth")}
              </span>
              <span className="text-[11px] text-dim">
                {visa.incomeRequirement.currency}{" "}
                {(visa.incomeRequirement.monthly * 12).toLocaleString()} {t("countryPage.perYear")}
              </span>
            </>
          )}
        </div>
      </div>

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
