import { useTranslation } from "react-i18next";
import { ALL_TOURISM_TAGS, type TourismTag } from "@features/tourism/hooks";

interface TourismTagFiltersProps {
  readonly requiredTags: string[];
  readonly onToggleTag: (tag: TourismTag) => void;
}

export function TourismTagFilters({ requiredTags, onToggleTag }: TourismTagFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-0">
      <div className="mb-3 text-[13px] font-bold tracking-[2px] text-on-surface uppercase">
        {t("tourismFilters.activityTags", "Activities")}
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_TOURISM_TAGS.map((tag) => {
          const active = requiredTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                onToggleTag(tag);
              }}
              className={`cursor-pointer rounded-[3px] border-0 px-[18px] py-2 text-[13px] font-semibold ${active ? "bg-[#8F5A3C] text-white" : "bg-[#2A2A2A] text-on-surface"}`}
            >
              {t(`tourismTags.${tag}`, tag)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
