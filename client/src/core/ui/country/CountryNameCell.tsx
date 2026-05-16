import type { CountryData } from "@core/models";
import { regionKey, useLocalizedCountry } from "@core/utils";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface CountryNameCellProps {
  readonly country: CountryData;
  /** Optional element rendered after the region tag (e.g. a Plane icon link). */
  readonly badge?: ReactNode;
}

export function CountryNameCell({ country, badge }: CountryNameCellProps) {
  const { t } = useTranslation();
  const locC = useLocalizedCountry(country);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <img
        src={country.flagUrl}
        alt={t("a11y.flagAlt", "{{country}} flag", { country: locC.name })}
        className="h-4 w-6 shrink-0 rounded-sm object-cover"
        loading="lazy"
      />
      <p className="truncate text-sm font-semibold text-white">{locC.name}</p>
      <span className="hidden shrink-0 text-[11px] text-dimmer sm:inline">
        {t(`regions.${regionKey(country.region)}`)}
      </span>
      {badge}
    </div>
  );
}
