import { Plane, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@core/ui";
import { CollapsibleSection } from "@core/ui/panels";
import { ToggleSwitch } from "@features/country-ranking/ui";
import { VisaTouristDaysFilter } from "./VisaTouristDaysFilter";

interface VisaStaySectionProps {
  readonly nomadVisaOnly: boolean;
  readonly onNomadVisaOnlyChange: (v: boolean) => void;
  readonly schengenOnly: boolean;
  readonly onSchengenOnlyChange: (v: boolean) => void;
  readonly minTouristDays: number | null;
  readonly onMinTouristDaysChange: (v: number | null) => void;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

export function VisaStaySection({
  nomadVisaOnly,
  onNomadVisaOnlyChange,
  schengenOnly,
  onSchengenOnlyChange,
  minTouristDays,
  onMinTouristDaysChange,
  isOpen,
  onToggle,
}: VisaStaySectionProps) {
  const { t } = useTranslation();
  const hasActiveFilter = nomadVisaOnly || schengenOnly || minTouristDays !== null;
  const visaBadge = hasActiveFilter ? (
    <div className="flex items-center rounded-[3px] bg-[#0E1E26] px-2 py-[3px]">
      <span className="font-mono text-[11px] text-[#7AADBD]">ON</span>
    </div>
  ) : undefined;

  return (
    <CollapsibleSection
      id="VISA & STAY"
      icon={<Plane size={16} color="#7A9BAD" />}
      label={t("visa.sectionLabel")}
      badge={visaBadge}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-[10px] bg-surface-3 p-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">{t("visa.nomadVisaOnly")}</span>
            <Tooltip
              content={
                <div>
                  <div className="mb-2 font-semibold text-white">{t("visa.nomadVisaTitle")}</div>
                  <div>{t("visa.nomadVisaDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info size={14} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-60" />
            </Tooltip>
          </div>
          <ToggleSwitch
            checked={nomadVisaOnly}
            onChange={onNomadVisaOnlyChange}
            ariaLabel={t("visa.nomadVisaOnly")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">{t("visa.schengenArea")}</span>
            <Tooltip
              content={
                <div>
                  <div className="mb-2 font-semibold text-white">{t("visa.schengenTitle")}</div>
                  <div>{t("visa.schengenDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info size={14} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-60" />
            </Tooltip>
          </div>
          <ToggleSwitch
            checked={schengenOnly}
            onChange={onSchengenOnlyChange}
            ariaLabel={t("visa.schengenArea")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">{t("visa.minTouristStay")}</span>
            <Tooltip
              content={
                <div>
                  <div className="mb-2 font-semibold text-white">{t("visa.touristVisaTitle")}</div>
                  <div>{t("visa.touristVisaDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info size={14} color="#FFFFFF" className="shrink-0 cursor-pointer opacity-60" />
            </Tooltip>
          </div>
          <VisaTouristDaysFilter
            minTouristDays={minTouristDays}
            onMinTouristDaysChange={onMinTouristDaysChange}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
