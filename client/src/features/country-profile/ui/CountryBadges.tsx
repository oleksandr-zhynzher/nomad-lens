import { useTranslation } from "react-i18next";
import { Calendar, CloudSun, Globe, Plane } from "lucide-react";

export interface CountryBadgesProps {
  readonly hasNomadVisa: boolean | undefined;
  readonly isSchengen: boolean | undefined;
  readonly touristVisaDays: number | null;
  readonly seasonLabel: string | null;
}

export function CountryBadges({
  hasNomadVisa,
  isSchengen,
  touristVisaDays,
  seasonLabel,
}: CountryBadgesProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2.5">
      {hasNomadVisa ? (
        <div className="flex items-center gap-1.5 rounded-[20px] border border-[#2A2810] bg-[rgba(26,26,10,0.85)] px-[14px] py-1.5 backdrop-blur-[4px]">
          <Plane size={13} color="#8F5A3C" />
          <span className="text-xs text-[#C2956A]">{t("countryPage.nomadVisaBadge")}</span>
        </div>
      ) : null}
      {isSchengen ? (
        <div className="flex items-center gap-1.5 rounded-[20px] border border-[#0A2030] bg-[rgba(10,18,24,0.85)] px-[14px] py-1.5 backdrop-blur-[4px]">
          <Globe size={13} color="#5B8FA8" />
          <span className="text-xs text-[#7BACC8]">{t("countryPage.schengen")}</span>
        </div>
      ) : null}
      {touristVisaDays == null ? null : (
        <div className="flex items-center gap-1.5 rounded-[20px] border border-[#2A2010] bg-[rgba(26,20,16,0.85)] px-[14px] py-1.5 backdrop-blur-[4px]">
          <Calendar size={13} color="#C2956A" />
          <span className="text-xs text-[#C2956A]">
            {t("countryPage.touristVisaBadge", { count: touristVisaDays })}
          </span>
        </div>
      )}
      {seasonLabel != null ? (
        <div className="flex items-center gap-1.5 rounded-[20px] border border-[#142014] bg-[rgba(16,22,16,0.85)] px-[14px] py-1.5 backdrop-blur-[4px]">
          <CloudSun size={13} color="#7A9B6B" />
          <span className="text-xs text-[#7A9B6B]">{seasonLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
