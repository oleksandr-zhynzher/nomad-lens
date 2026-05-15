import { useTranslation } from "react-i18next";

interface HomeRegionFiltersProps {
  readonly regions: string[];
  readonly selectedRegions: Set<string>;
  readonly setSelectedRegions: (fn: (prev: Set<string>) => Set<string>) => void;
  readonly onClearRegions: () => void;
}

export function HomeRegionFilters({
  regions,
  selectedRegions,
  setSelectedRegions,
  onClearRegions,
}: HomeRegionFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-0">
      <div className="mb-3 text-[13px] font-bold tracking-[2px] text-muted uppercase">
        {t("regions.label")}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onClearRegions}
          className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${selectedRegions.size === 0 ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
        >
          {t("regions.all")}
        </button>
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setSelectedRegions((prev) => {
                const next = new Set(prev);
                if (next.has(r)) {
                  next.delete(r);
                } else {
                  next.add(r);
                }
                return next;
              });
            }}
            className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${selectedRegions.has(r) ? "bg-accent text-white" : "bg-surface-4 text-muted"}`}
          >
            {t(`regions.${r.replaceAll(/\s/g, "")}`, r)}
          </button>
        ))}
      </div>
    </div>
  );
}
