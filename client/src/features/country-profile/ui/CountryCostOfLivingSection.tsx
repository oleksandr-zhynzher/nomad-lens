import { useTranslation } from "react-i18next";
import {
  Building2,
  Bus,
  Heart,
  Home,
  Laptop,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import type { CountryData } from "@core/models";
import { MetricCard, MetricGrid, SectionHeader } from "@core/ui";

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

        {/* Summary row */}
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

        {/* Breakdown grid */}
        <MetricGrid>
          {(
            [
              {
                key: "rentMajorCity" as const,
                icon: <Building2 size={14} color="#C2956A" aria-hidden />,
                label: t("countryPage.colRentMajorCity", "Rent · Major City"),
              },
              {
                key: "rentSmallerCity" as const,
                icon: <Home size={14} color="#C2956A" aria-hidden />,
                label: t("countryPage.colRentSmallerCity", "Rent · Smaller City"),
              },
              {
                key: "rent2br" as const,
                icon: <Building2 size={14} color="#A87A5A" aria-hidden />,
                label: t("countryPage.colRent2br", "Rent · 2 Bedroom"),
              },
              {
                key: "rent3br" as const,
                icon: <Building2 size={14} color="#8F5A3C" aria-hidden />,
                label: t("countryPage.colRent3br", "Rent · 3 Bedroom"),
              },
              {
                key: "groceries" as const,
                icon: <ShoppingCart size={14} color="#6BAF7A" aria-hidden />,
                label: t("countryPage.colGroceries", "Groceries"),
              },
              {
                key: "dining" as const,
                icon: <UtensilsCrossed size={14} color="#D4A05A" aria-hidden />,
                label: t("countryPage.colDining", "Dining Out"),
              },
              {
                key: "transport" as const,
                icon: <Bus size={14} color="#7BACC8" aria-hidden />,
                label: t("countryPage.colTransport", "Transport"),
              },
              {
                key: "utilities" as const,
                icon: <Zap size={14} color="#DDAA44" aria-hidden />,
                label: t("countryPage.colUtilities", "Utilities & Internet"),
              },
              {
                key: "coworking" as const,
                icon: <Laptop size={14} color="#8888CC" aria-hidden />,
                label: t("countryPage.colCoworking", "Coworking"),
              },
              {
                key: "healthInsurance" as const,
                icon: <Heart size={14} color="#CC6666" aria-hidden />,
                label: t("countryPage.colHealthInsurance", "Health Insurance"),
              },
            ] as const
          ).map(({ key, icon, label }) => {
            const val = col[key] ?? null;
            if (val == null) return null;
            return (
              <MetricCard key={key} icon={icon} label={label} value={`$${val.toLocaleString()}`} />
            );
          })}
        </MetricGrid>
      </div>
    </>
  );
}
