import { createPortal } from "react-dom";
import { X, Plane, User, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { RankedCountry } from "../utils/types";
import { TOURISM_GROUPS, CATEGORY_LABELS } from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { computeTourismScore, tourismScoreColour } from "../utils/tourismScoring";
import { TOURISM_COLORS } from "../utils/tourismColors";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { useLocalizedCountry, regionKey } from "../utils/localize";
import { NomadVisaDetails } from "../shared/ui/NomadVisaDetails";

interface CountryDetailPanelProps {
  country: RankedCountry;
  onClose: () => void;
  onViewInList: () => void;
}

export function CountryDetailPanel({ country, onClose, onViewInList }: CountryDetailPanelProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const { country: c, finalScore, rank } = country;
  const [visaExpanded, setVisaExpanded] = useState(true);
  const locC = useLocalizedCountry(c);

  return createPortal(
    <div className="fixed inset-0 z-40 flex flex-col md:flex-row">
      {/* Backdrop — on desktop fills left side, on mobile fills top */}
      <button
        type="button"
        aria-label={t("countryDetails.close", "Close country details")}
        className="flex-1"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={onClose}
      />

      {/* Drawer — right panel on desktop, bottom sheet on mobile */}
      <div
        className="w-full md:w-auto md:h-full flex flex-col overflow-hidden"
        style={{
          maxWidth: "100%",
          height: "100vh",
          backgroundColor: "#1A1A1A",
        }}
      >
        {/* Mobile drag handle */}
        <div className="flex md:hidden justify-center pt-2 pb-1 shrink-0">
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "#444444",
            }}
          />
        </div>

        {/* Desktop width constraint wrapper */}
        <div className="flex flex-col flex-1 overflow-hidden md:w-[480px]">
          {/* Header: Rank | Country | Score */}
          <div
            className="flex items-center px-5 pt-5 pb-4 shrink-0"
            style={{
              backgroundColor: "#222222",
              gap: "12px",
              borderBottom: "1px solid #2A2A2A",
            }}
          >
            {/* Rank */}
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--color-accent)",
                lineHeight: "1",
                whiteSpace: "nowrap",
              }}
            >
              #{rank}
            </span>

            {/* Flag + Name + Region */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={c.flagUrl}
                alt={t("a11y.flagAlt", "{{country}} flag", {
                  country: locC.name,
                })}
                className="object-cover shrink-0"
                style={{
                  width: "36px",
                  height: "24px",
                  borderRadius: "4px",
                }}
                loading="eager"
              />
              <div className="flex items-baseline gap-2 min-w-0">
                <h2
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    lineHeight: "1.2",
                    whiteSpace: "nowrap",
                  }}
                >
                  {locC.name}
                </h2>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    color: "#9E9E9E",
                  }}
                >
                  {t(`regions.${regionKey(c.region)}`)}
                </span>
              </div>
            </div>

            {/* Score */}
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                color: scoreColour(finalScore),
                lineHeight: "1",
                whiteSpace: "nowrap",
              }}
            >
              {finalScore.toFixed(1)}
            </span>

            {/* Close */}
            <button
              onClick={onClose}
              className="shrink-0 flex items-center justify-center transition-colors"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#333333",
                borderRadius: "4px",
                color: "#9E9E9E",
              }}
              aria-label={t("a11y.closePanel", "Close panel")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Badge Row */}
          <div
            className="flex items-center gap-2 px-5 py-3 shrink-0"
            style={{ backgroundColor: "#1A1A1A" }}
          >
            {c.hasNomadVisa && (
              <Link
                to={`${langPrefix}/country/${c.code.toLowerCase()}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--color-accent)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textDecoration: "none",
                }}
              >
                <Plane size={11} /> {t("countryDetail.nomadVisa")}
              </Link>
            )}
          </div>

          {/* Breakdown section */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#8A8A8A",
                marginBottom: "12px",
              }}
            >
              {t("countryDetail.scoreBreakdown")}
            </h3>
            <ScoreBreakdown country={c} />

            {/* Tourism Scores Section */}
            {(() => {
              const tScore = computeTourismScore(c);
              if (tScore == null) return null;
              return (
                <div style={{ marginTop: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#6B9E6B",
                      marginBottom: "12px",
                    }}
                  >
                    {t("countryDetail.tourismScores", "Tourism Score")}
                    <span
                      style={{
                        marginLeft: "8px",
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: tourismScoreColour(tScore),
                      }}
                    >
                      {tScore.toFixed(1)}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {TOURISM_GROUPS.map((group) => {
                      const visibleKeys = group.keys.filter((k) => c.scores[k]?.value != null);
                      if (visibleKeys.length === 0) return null;
                      return (
                        <div key={group.labelKey}>
                          <div
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "9px",
                              fontWeight: 600,
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                              color: "#666",
                              marginBottom: "6px",
                            }}
                          >
                            {t(`tourismWeights.groups.${group.labelKey}`, group.labelKey)}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {visibleKeys.map((key) => {
                              const val = c.scores[key]!.value!;
                              const color = TOURISM_COLORS[key] ?? "#888";
                              return (
                                <div
                                  key={key}
                                  className="flex items-center gap-2"
                                  style={{ height: "22px" }}
                                >
                                  <span
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: "11px",
                                      color: "#9E9E9E",
                                      width: "130px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {t(`tourism.metrics.${key}`, CATEGORY_LABELS[key])}
                                  </span>
                                  <div
                                    style={{
                                      flex: 1,
                                      height: "6px",
                                      borderRadius: "3px",
                                      backgroundColor: "#2A2A2A",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${val}%`,
                                        height: "100%",
                                        backgroundColor: color,
                                        borderRadius: "3px",
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontFamily: "IBM Plex Mono, monospace",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      color: "#E8E9EB",
                                      width: "28px",
                                      textAlign: "right",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {val.toFixed(0)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Nomad Visa Section */}
            {c.nomadVisa && (
              <NomadVisaDetails
                visa={c.nomadVisa}
                expanded={visaExpanded}
                onToggle={() => setVisaExpanded(!visaExpanded)}
              />
            )}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-4 shrink-0 flex flex-col gap-2"
            style={{ borderTop: "1px solid #333333" }}
          >
            <button
              onClick={() => {
                onViewInList();
                onClose();
              }}
              className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors"
              style={{
                height: "40px",
                backgroundColor: "transparent",
                border: "1px solid #333333",
                borderRadius: "6px",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-accent-dim)",
              }}
            >
              <List size={14} />
              {t("countryDetail.viewInList")}
            </button>
            <Link
              to={`${langPrefix}/country/${c.code.toLowerCase()}`}
              onClick={onClose}
              className="interactive-cta-link w-full flex items-center justify-center gap-2 transition-colors"
              style={{
                display: "flex",
                height: "40px",
                backgroundColor: "transparent",
                border: "1px solid #333333",
                borderRadius: "6px",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-accent-dim)",
                textDecoration: "none",
              }}
            >
              <User size={14} />
              {t("countryPage.viewProfile", "View Country Details")}
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
