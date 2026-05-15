import {
  Building2,
  Bus,
  Heart,
  Home,
  Laptop,
  ShoppingCart,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CountryData } from "@core/models";
import { MetricCard, MetricGrid } from "@core/ui";

type CostOfLivingData = NonNullable<CountryData["costOfLiving"]>;

interface CountryCostBreakdownGridProps {
  readonly col: CostOfLivingData;
}

export function CountryCostBreakdownGrid({ col }: CountryCostBreakdownGridProps) {
  const { t } = useTranslation();
  return (
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
  );
}
