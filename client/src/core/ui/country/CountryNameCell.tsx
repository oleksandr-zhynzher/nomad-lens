import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedCountry, regionKey } from "@core/utils";
import type { CountryData } from "@core/models";

interface CountryNameCellProps {
  country: CountryData;
  /** Optional element rendered after the region tag (e.g. a Plane icon link). */
  badge?: ReactNode;
}

export function CountryNameCell({ country, badge }: CountryNameCellProps) {
  const { t } = useTranslation();
  const locC = useLocalizedCountry(country);

  return (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      <img
        src={country.flagUrl}
        alt={t("a11y.flagAlt", "{{country}} flag", { country: locC.name })}
        className="object-cover shrink-0 w-6 h-4 rounded-sm"
        loading="lazy"
      />
      <p className="truncate text-sm font-semibold text-white">{locC.name}</p>
      <span className="hidden sm:inline shrink-0 text-[11px] text-dimmer">
        {t(`regions.${regionKey(country.region)}`)}
      </span>
      {badge}
    </div>
  );
}
