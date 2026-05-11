import { Plane, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../../components/Tooltip";
import { CollapsibleSection } from "./CollapsibleSection";
import { ToggleSwitch } from "../ToggleSwitch";

interface VisaStaySectionProps {
  nomadVisaOnly: boolean;
  onNomadVisaOnlyChange: (v: boolean) => void;
  schengenOnly: boolean;
  onSchengenOnlyChange: (v: boolean) => void;
  minTouristDays: number | null;
  onMinTouristDaysChange: (v: number | null) => void;
  isOpen: boolean;
  onToggle: () => void;
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
    <div className="flex items-center bg-[#0E1E26] rounded-[3px] px-2 py-[3px]">
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
      <div className="flex flex-col bg-surface-3 p-3 px-4 gap-[10px]">
        {/* Nomad Visa toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">{t("visa.nomadVisaOnly")}</span>
            <Tooltip
              content={
                <div>
                  <div className="mb-2 text-white font-semibold">{t("visa.nomadVisaTitle")}</div>
                  <div>{t("visa.nomadVisaDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info size={14} color="#FFFFFF" className="cursor-pointer shrink-0 opacity-60" />
            </Tooltip>
          </div>
          <ToggleSwitch
            checked={nomadVisaOnly}
            onChange={onNomadVisaOnlyChange}
            ariaLabel={t("visa.nomadVisaOnly")}
          />
        </div>

        {/* Schengen toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">{t("visa.schengenArea")}</span>
            <Tooltip
              content={
                <div>
                  <div className="mb-2 text-white font-semibold">{t("visa.schengenTitle")}</div>
                  <div>{t("visa.schengenDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info size={14} color="#FFFFFF" className="cursor-pointer shrink-0 opacity-60" />
            </Tooltip>
          </div>
          <ToggleSwitch
            checked={schengenOnly}
            onChange={onSchengenOnlyChange}
            ariaLabel={t("visa.schengenArea")}
          />
        </div>

        {/* Min Tourist Stay */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">{t("visa.minTouristStay")}</span>
            <Tooltip
              content={
                <div>
                  <div className="mb-2 text-white font-semibold">{t("visa.touristVisaTitle")}</div>
                  <div>{t("visa.touristVisaDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info size={14} color="#FFFFFF" className="cursor-pointer shrink-0 opacity-60" />
            </Tooltip>
          </div>
          <div className="flex gap-1">
            {([null, 30, 60, 90, 180] as const).map((days) => {
              const active = minTouristDays === days;
              const label = days === null ? t("visa.any") : `${days}+`;
              return (
                <button
                  key={label}
                  onClick={() => onMinTouristDaysChange(days)}
                  className={`flex-1 py-[5px] rounded-[3px] border-0 cursor-pointer text-[10px] text-center ${active ? "bg-accent text-white" : "bg-surface-4 text-dim"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
