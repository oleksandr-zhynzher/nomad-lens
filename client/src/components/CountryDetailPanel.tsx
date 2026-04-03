import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RankedCountry, SeasonType } from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface CountryDetailPanelProps {
  country: RankedCountry;
  onClose: () => void;
  onViewInList: () => void;
}

const DRAWER_SEASON_BADGE: Record<SeasonType, { labelKey: string; bg: string; text: string }> = {
  four_seasons: { labelKey: "countryDetail.climate.fourSeasons", bg: "#8F5A3C", text: "#FFFFFF" },
  mild_seasons: { labelKey: "countryDetail.climate.mild", bg: "#1A3A5C", text: "#60A5FA" },
  tropical: { labelKey: "countryDetail.climate.tropical", bg: "#1A4A2A", text: "#44CC66" },
  arid: { labelKey: "countryDetail.climate.arid", bg: "#4A3A1A", text: "#AA7733" },
  polar: { labelKey: "countryDetail.climate.polar", bg: "#2A2A2A", text: "#999999" },
};

export function CountryDetailPanel({
  country,
  onClose,
  onViewInList,
}: CountryDetailPanelProps) {  const { t } = useTranslation();  const { country: c, finalScore, rank } = country;

  return createPortal(
    <div className="fixed inset-0 z-40 flex flex-col md:flex-row" onClick={onClose}>
      {/* Backdrop — on desktop fills left side, on mobile fills top */}
      <div className="flex-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} />

      {/* Drawer — right panel on desktop, bottom sheet on mobile */}
      <div
        className="w-full md:w-auto md:h-full flex flex-col overflow-hidden"
        style={{ maxWidth: "100%", maxHeight: "90vh", backgroundColor: "#1A1A1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex md:hidden justify-center pt-2 pb-1 shrink-0">
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#444444" }} />
        </div>

        {/* Desktop width constraint wrapper */}
        <div className="flex flex-col flex-1 overflow-hidden md:w-[380px]">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 shrink-0" style={{ backgroundColor: "#222222" }}>
          <img
            src={c.flagUrl}
            alt={`${c.name} flag`}
            className="object-cover shrink-0"
            style={{ width: "36px", height: "24px", borderRadius: "4px", marginTop: "2px" }}
            loading="eager"
          />
          <div className="flex-1 min-w-0">
            <h2 style={{ fontFamily: "Anton, sans-serif", fontSize: "22px", fontWeight: 400, color: "#FFFFFF", lineHeight: "1.2" }}>
              {c.name}
            </h2>
            <p style={{ fontFamily: "Geist, sans-serif", fontSize: "12px", color: "#999999", marginTop: "4px" }}>{c.region}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center transition-colors"
            style={{ width: "32px", height: "32px", backgroundColor: "#333333", borderRadius: "4px", color: "#999999" }}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Row - split RANK | COMPOSITE SCORE */}
        <div className="flex items-stretch px-5 py-4 shrink-0" style={{ backgroundColor: "#1E1E1E", gap: "16px" }}>
          <div className="flex-1 flex flex-col">
            <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666666", marginBottom: "4px" }}>
              {t("countryDetail.rank")}
            </span>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "28px", fontWeight: 600, color: "var(--color-accent)", lineHeight: "1" }}>
              #{rank}
            </span>
          </div>
          <div style={{ width: "1px", backgroundColor: "#333333" }} />
          <div className="flex-1 flex flex-col">
            <span style={{ fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666666", marginBottom: "4px" }}>
              {t("countryDetail.compositeScore")}
            </span>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "28px", fontWeight: 600, color: scoreColour(finalScore), lineHeight: "1" }}>
              {finalScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Badge Row */}
        <div className="flex items-center gap-2 px-5 py-3 shrink-0" style={{ backgroundColor: "#1A1A1A" }}>
          {c.hasNomadVisa && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: "var(--color-accent)", fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 500, color: "#FFFFFF" }}>
              ✈ {t("countryDetail.nomadVisa")}
            </span>
          )}
          {c.climateData && (() => {
            const badge = DRAWER_SEASON_BADGE[c.climateData.seasonType];
            return (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: badge.bg, fontFamily: "Geist, sans-serif", fontSize: "10px", fontWeight: 500, color: badge.text }}>
                {t(badge.labelKey)}
              </span>
            );
          })()}
        </div>

        {/* Breakdown section */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h3 style={{ fontFamily: "Geist, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#666666", marginBottom: "12px" }}>
            {t("countryDetail.scoreBreakdown")}
          </h3>
          <ScoreBreakdown country={c} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid #333333" }}>
          <button
            onClick={() => { onViewInList(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 transition-colors"
            style={{ height: "44px", backgroundColor: "var(--color-accent)", borderRadius: "4px", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#FFFFFF" }}
          >
            {t("countryDetail.viewInList")}
          </button>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
