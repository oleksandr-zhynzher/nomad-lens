import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedCountry, regionKey } from "../../utils/localize";
import type { CountryData } from "../../utils/types";

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
        className="object-cover shrink-0"
        style={{ width: "24px", height: "16px", borderRadius: "2px" }}
        loading="lazy"
      />
      <p
        className="truncate"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          color: "#FFFFFF",
        }}
      >
        {locC.name}
      </p>
      <span
        className="hidden sm:inline shrink-0"
        style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#808080" }}
      >
        {t(`regions.${regionKey(country.region)}`)}
      </span>
      {badge}
    </div>
  );
}
