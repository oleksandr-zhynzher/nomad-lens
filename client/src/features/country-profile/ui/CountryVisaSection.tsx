import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Building2,
  Calendar,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  RefreshCw,
  Timer,
  User,
} from "lucide-react";
import type { NomadVisaDetails } from "@core/models";
import {
  getHostname,
  localizeVisa,
  taxStatusBgClass,
  taxStatusTextClass,
  taxStatusLabelKey,
} from "./country-profile.utils";

interface CountryVisaSectionProps {
  readonly visa: NomadVisaDetails;
}

export function CountryVisaSection({ visa }: CountryVisaSectionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="flex flex-col gap-8 bg-bg py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h2 className="m-0 font-display font-bold text-[#E8E9EB]">
          {t("countryPage.nomadVisaSection")}
        </h2>
        <div className="flex-1" />
        <div className="rounded-[20px] bg-[#1A1A0A] px-4 py-1.5">
          <span className="text-xs text-[#C2956A]">{visa.visaName}</span>
        </div>
        <span className="text-[10px] text-dimmer">
          {t("countryPage.updated", { date: visa.lastUpdated })}
        </span>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        {/* Left column – 440px */}
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
                    {visa.incomeRequirement.currency}{" "}
                    {visa.incomeRequirement.annual.toLocaleString()} {t("countryPage.perYear")}
                  </span>
                )
              ) : (
                <>
                  <span className="font-mono text-[18px] font-bold text-[#C2956A]">
                    {visa.incomeRequirement.currency}{" "}
                    {visa.incomeRequirement.monthly.toLocaleString()} {t("countryPage.perMonth")}
                  </span>
                  <span className="text-[11px] text-dim">
                    {visa.incomeRequirement.currency}{" "}
                    {(visa.incomeRequirement.monthly * 12).toLocaleString()}{" "}
                    {t("countryPage.perYear")}
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

        {/* Right column – flex fill */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Visa Benefits */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.visaBenefits")}
            </span>
            {localizeVisa(visa.benefits, visa, (l) => l.benefits, lang).map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 rounded-lg bg-bg px-3 py-2.5">
                <Briefcase size={16} color="#8F5A3C" />
                <span className="text-[13px] text-muted">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Application Process */}
          <div className="flex flex-col gap-4 rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <span className="text-[10px] tracking-[1.5px] text-[#808080] uppercase">
              {t("countryPage.applicationProcessSection")}
            </span>
            <div className="flex items-center gap-2">
              <Building2 size={16} color="#C2956A" />
              <span className="text-sm text-[#E8E9EB]">
                {visa.applicationProcess.online
                  ? t("countryPage.onlineApplication")
                  : t("countryPage.inPersonApplication")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Timer size={16} color="#8F5A3C" />
              <span className="text-[13px] text-on-surface">
                {t("countryPage.processing", {
                  time: localizeVisa(
                    visa.applicationProcess.processingTime,
                    visa,
                    (l) => l.applicationProcess?.processingTime,
                    lang,
                  ),
                })}
              </span>
            </div>
            <div className="h-px bg-[#1E1E1E]" />
            <span className="text-[9px] tracking-[1px] text-dimmer uppercase">
              {t("countryPage.requiredDocsSection")}
            </span>
            {localizeVisa(
              visa.applicationProcess.documents,
              visa,
              (l) => l.applicationProcess?.documents,
              lang,
            ).map((doc) => (
              <div key={doc} className="flex items-center gap-2">
                <FileText size={13} color="#808080" />
                <span className="text-xs text-dim">{doc}</span>
              </div>
            ))}
          </div>

          {/* Official Link */}
          <a
            href={visa.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#2A2018] bg-[#1A1410] p-5 no-underline"
          >
            <ExternalLink size={18} color="#8F5A3C" />
            <span className="text-sm text-[#C2956A]">{t("countryPage.officialVisaWebsite")}</span>
            <div className="flex-1" />
            <span className="text-[11px] text-[#808080]">{getHostname(visa.officialUrl)}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
