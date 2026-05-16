import type { NomadVisaDetails } from "@core/models";
import { useTranslation } from "react-i18next";

import { CountryVisaLeftColumn } from "./CountryVisaLeftColumn";
import { CountryVisaRightColumn } from "./CountryVisaRightColumn";

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
        <CountryVisaLeftColumn visa={visa} lang={lang} />
        <CountryVisaRightColumn visa={visa} lang={lang} />
      </div>
    </div>
  );
}
