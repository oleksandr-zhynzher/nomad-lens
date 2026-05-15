import { Briefcase, Building2, ExternalLink, FileText, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NomadVisaDetails } from "@core/models";
import { getHostname, localizeVisa } from "./country-profile.utils";

interface CountryVisaRightColumnProps {
  readonly visa: NomadVisaDetails;
  readonly lang: string;
}

export function CountryVisaRightColumn({ visa, lang }: CountryVisaRightColumnProps) {
  const { t } = useTranslation();
  return (
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
  );
}
