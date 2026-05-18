import { FilterChipGroup } from "@core/ui/forms/FilterChipGroup";
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
      <FilterChipGroup
        label={t("regions.label")}
        items={regions.map((r) => ({ id: r, label: t(`regions.${r.replaceAll(/\s/g, "")}`, r) }))}
        selectedIds={selectedRegions}
        onToggle={(id) => {
          setSelectedRegions((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
              next.delete(id);
            } else {
              next.add(id);
            }
            return next;
          });
        }}
        allChipLabel={t("regions.all")}
        onClearAll={onClearRegions}
      />
    </div>
  );
}
