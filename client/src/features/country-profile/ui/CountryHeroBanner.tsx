import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CountryBadges } from "./CountryBadges";

interface CountryHeroBannerProps {
  readonly flagUrl: string;
  readonly name: string;
  readonly code: string;
  readonly onBack: () => void;
  readonly hasNomadVisa: boolean | undefined;
  readonly isSchengen: boolean | undefined;
  readonly touristVisaDays: number | null;
  readonly seasonLabel: string | null;
}

export function CountryHeroBanner({
  flagUrl,
  name,
  code,
  onBack,
  hasNomadVisa,
  isSchengen,
  touristVisaDays,
  seasonLabel,
}: CountryHeroBannerProps) {
  const { t } = useTranslation();
  return (
    <div
      className="relative min-h-[280px] overflow-hidden"
      style={{
        backgroundColor: "#0A0D12",
        backgroundImage: "url('/hero-map.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(13,13,15,0.92) 70%, #0D0D0F 100%)",
        }}
      />
      <button
        type="button"
        onClick={onBack}
        className="absolute top-5 left-4 z-10 flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[rgba(17,17,17,0.75)] px-[14px] py-[7px] text-[13px] text-[#AAAAAA] backdrop-blur-[8px] md:left-8"
      >
        <ArrowLeft size={15} color="#AAAAAA" />
        {t("countryPage.back")}
      </button>
      <div className="absolute inset-0 flex flex-col justify-end gap-4 px-4 pb-6 md:px-16 md:pb-8">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] md:h-[67px] md:w-[100px]">
            <img
              src={flagUrl}
              alt={t("a11y.flagAlt", "{{country}} flag", { country: name })}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[2px] text-[#8F5A3C] uppercase">
              {t("countryPage.countryDetailLabel")}
            </span>
            <h1 className="m-0 font-display text-2xl leading-none font-semibold text-[#E8E9EB] md:text-4xl">
              {name}
            </h1>
          </div>
          <div className="hidden flex-1 md:block" />
          <div className="hidden self-end rounded-[6px] bg-[rgba(26,26,26,0.8)] px-3 py-1.5 md:block">
            <span className="font-mono text-sm text-[#808080]">{code}</span>
          </div>
        </div>
        <CountryBadges
          hasNomadVisa={hasNomadVisa}
          isSchengen={isSchengen}
          touristVisaDays={touristVisaDays}
          seasonLabel={seasonLabel}
        />
      </div>
    </div>
  );
}
