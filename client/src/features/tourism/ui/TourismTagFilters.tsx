import { FilterChipGroup } from "@core/ui/forms/FilterChipGroup";
import { ALL_TOURISM_TAGS, type TourismTag } from "@features/tourism/hooks";
import { useTranslation } from "react-i18next";

interface TourismTagFiltersProps {
  readonly requiredTags: string[];
  readonly onToggleTag: (tag: TourismTag) => void;
}

export function TourismTagFilters({ requiredTags, onToggleTag }: TourismTagFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-0">
      <FilterChipGroup
        label={t("tourismFilters.activityTags", "Activities")}
        items={ALL_TOURISM_TAGS.map((tag) => ({ id: tag, label: t(`tourismTags.${tag}`, tag) }))}
        selectedIds={new Set(requiredTags)}
        onToggle={(id) => {
          onToggleTag(id as TourismTag);
        }}
        activeClassName="bg-[#8F5A3C] text-white"
        inactiveClassName="bg-[#2A2A2A] text-on-surface"
      />
    </div>
  );
}
