import type { CountryData } from "@core/models";
import { SectionHeader } from "@core/ui";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CountryCostBreakdownGrid } from "./CountryCostBreakdownGrid";

interface CountryCostOfLivingSectionProps {
  readonly country: CountryData;
}

export function CountryCostOfLivingSection({ country }: CountryCostOfLivingSectionProps) {
  const { t } = useTranslation();

  if (!country.costOfLiving) return null;

  const col = country.costOfLiving;

  return (
    <>
      <div className="h-px bg-[#1E1E1E]" />
      <div className="flex flex-col gap-6 bg-bg py-8">
        <SectionHeader
          title={t("countryPage.costOfLivingSection", "Cost of Living")}
          meta={t("countryPage.costOfLivingSubtitle", "USD / month · single nomad")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {col.totalBasic === null ? null : (
            <div className="flex flex-1 flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} color="#44CC66" />
                <span className="font-mono text-[28px] font-bold text-[#44CC66]">
                  ${col.totalBasic.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-[#808080]">
                {t("countryPage.colTotalBasic", "Basic Budget")}
              </span>
            </div>
          )}
          {col.totalComfortable === null ? null : (
            <div className="flex flex-1 flex-col gap-2 rounded-[10px] border border-[#1E1E1E] bg-[#111111] p-5">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} color="#5B8FA8" />
                <span className="font-mono text-[28px] font-bold text-[#5B8FA8]">
                  ${col.totalComfortable.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-[#808080]">
                {t("countryPage.colTotalComfortable", "Comfortable Budget")}
              </span>
            </div>
          )}
        </div>

        <CountryCostBreakdownGrid col={col} />
      </div>
    </>
  );
}
