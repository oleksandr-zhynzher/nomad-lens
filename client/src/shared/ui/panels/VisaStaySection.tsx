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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#0E1E26",
        borderRadius: "3px",
        padding: "3px 8px",
      }}
    >
      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "11px", color: "#7AADBD" }}>
        ON
      </span>
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
      <div
        style={{
          backgroundColor: "#141414",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Nomad Visa toggle */}
        <div className="flex items-center justify-between">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#CCCCCC" }}>
              {t("visa.nomadVisaOnly")}
            </span>
            <Tooltip
              content={
                <div>
                  <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>
                    {t("visa.nomadVisaTitle")}
                  </div>
                  <div>{t("visa.nomadVisaDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info
                size={14}
                color="#FFFFFF"
                style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }}
              />
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#CCCCCC" }}>
              {t("visa.schengenArea")}
            </span>
            <Tooltip
              content={
                <div>
                  <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>
                    {t("visa.schengenTitle")}
                  </div>
                  <div>{t("visa.schengenDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info
                size={14}
                color="#FFFFFF"
                style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }}
              />
            </Tooltip>
          </div>
          <ToggleSwitch
            checked={schengenOnly}
            onChange={onSchengenOnlyChange}
            ariaLabel={t("visa.schengenArea")}
          />
        </div>

        {/* Min Tourist Stay */}
        <div className="flex flex-col" style={{ gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#CCCCCC" }}>
              {t("visa.minTouristStay")}
            </span>
            <Tooltip
              content={
                <div>
                  <div style={{ marginBottom: "8px", color: "#FFFFFF", fontWeight: 600 }}>
                    {t("visa.touristVisaTitle")}
                  </div>
                  <div>{t("visa.touristVisaDesc")}</div>
                </div>
              }
              side="top"
            >
              <Info
                size={14}
                color="#FFFFFF"
                style={{ cursor: "pointer", flexShrink: 0, opacity: 0.6 }}
              />
            </Tooltip>
          </div>
          <div className="flex" style={{ gap: "4px" }}>
            {([null, 30, 60, 90, 180] as const).map((days) => {
              const active = minTouristDays === days;
              const label = days === null ? t("visa.any") : `${days}+`;
              return (
                <button
                  key={label}
                  onClick={() => onMinTouristDaysChange(days)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    backgroundColor: active ? "#8F5A3C" : "#2A2A2A",
                    color: active ? "#FFFFFF" : "#8A8A8A",
                    textAlign: "center",
                  }}
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
