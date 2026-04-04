import { createPortal } from "react-dom";
import {
  X,
  Plane,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLangPrefix } from "../hooks/useLangPrefix";
import type { RankedCountry } from "../utils/types";
import { scoreColour } from "../utils/scoring";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { useLocalizedCountry, regionKey } from "../utils/localize";

const TAX_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  exempt: { bg: "#1A4A2A", text: "#44CC66" },
  standard: { bg: "#2A2A3A", text: "#8888CC" },
  special: { bg: "#4A3A1A", text: "#DDAA44" },
};

interface CountryDetailPanelProps {
  country: RankedCountry;
  onClose: () => void;
  onViewInList: () => void;
}

export function CountryDetailPanel({
  country,
  onClose,
  onViewInList,
}: CountryDetailPanelProps) {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const { country: c, finalScore, rank } = country;
  const [visaExpanded, setVisaExpanded] = useState(true);
  const locC = useLocalizedCountry(c);

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex flex-col md:flex-row"
      onClick={onClose}
    >
      {/* Backdrop — on desktop fills left side, on mobile fills top */}
      <div
        className="flex-1"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      />

      {/* Drawer — right panel on desktop, bottom sheet on mobile */}
      <div
        className="w-full md:w-auto md:h-full flex flex-col overflow-hidden"
        style={{
          maxWidth: "100%",
          height: "100vh",
          backgroundColor: "#1A1A1A",
        }}
        onClick={(e) => e.stopPropagation()}
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
                fontFamily: "Geist, sans-serif",
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
                alt={`${locC.name} flag`}
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
                    fontFamily: "Anton, sans-serif",
                    fontSize: "22px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    lineHeight: "1.2",
                    whiteSpace: "nowrap",
                  }}
                >
                  {locC.name}
                </h2>
                <span
                  style={{
                    fontFamily: "Geist, sans-serif",
                    fontSize: "12px",
                    color: "#999999",
                  }}
                >
                  {t(`regions.${regionKey(c.region)}`)}
                </span>
              </div>
            </div>

            {/* Score */}
            <span
              style={{
                fontFamily: "Anton, sans-serif",
                fontSize: "22px",
                fontWeight: 400,
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
                color: "#999999",
              }}
              aria-label="Close panel"
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
                  fontFamily: "Geist, sans-serif",
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
                fontFamily: "Geist, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#666666",
                marginBottom: "12px",
              }}
            >
              {t("countryDetail.scoreBreakdown")}
            </h3>
            <ScoreBreakdown country={c} />

            {/* Nomad Visa Section */}
            {c.nomadVisa && (
              <div style={{ marginTop: "24px" }}>
                <button
                  onClick={() => setVisaExpanded(!visaExpanded)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: visaExpanded ? "12px" : "0",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Geist, sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#666666",
                    }}
                  >
                    {t("countryDetail.nomadVisaDetails", "Digital Nomad Visa")}
                  </h3>
                  {visaExpanded ? (
                    <ChevronUp size={16} color="#666666" />
                  ) : (
                    <ChevronDown size={16} color="#666666" />
                  )}
                </button>

                {visaExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Visa Name */}
                    <div
                      className="flex flex-col gap-1 p-3 rounded"
                      style={{ backgroundColor: "#222222" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#CCCCCC",
                          }}
                        >
                          {t("countryPage.visa.visaName", "Visa Name")}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "11px",
                          color: "#999999",
                          marginTop: "2px",
                        }}
                      >
                        {c.nomadVisa.visaName}
                      </p>
                    </div>

                    {/* Duration */}
                    <div
                      className="flex flex-col gap-1 p-3 rounded"
                      style={{ backgroundColor: "#222222" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#CCCCCC",
                          }}
                        >
                          <Clock
                            size={12}
                            style={{
                              display: "inline",
                              marginRight: "4px",
                              verticalAlign: "middle",
                            }}
                          />
                          {t("countryPage.visa.duration", "Duration")}
                        </span>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#FFFFFF",
                          }}
                        >
                          {c.nomadVisa.duration.initial} mo
                        </span>
                      </div>
                      {c.nomadVisa.duration.maxExtension > 0 && (
                        <p
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "10px",
                            color: "#666666",
                            marginTop: "2px",
                          }}
                        >
                          +{c.nomadVisa.duration.maxExtension} mo extension
                        </p>
                      )}
                    </div>

                    {/* Cost */}
                    <div
                      className="flex flex-col gap-1 p-3 rounded"
                      style={{ backgroundColor: "#222222" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#CCCCCC",
                          }}
                        >
                          <DollarSign
                            size={12}
                            style={{
                              display: "inline",
                              marginRight: "4px",
                              verticalAlign: "middle",
                            }}
                          />
                          {t("countryPage.visa.cost", "Cost")}
                        </span>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "12px",
                            fontWeight: 600,
                            color:
                              c.nomadVisa.cost.amount === 0
                                ? "#44CC66"
                                : "#FFFFFF",
                          }}
                        >
                          {c.nomadVisa.cost.amount === 0
                            ? t("countryPage.visa.free", "Free")
                            : `${c.nomadVisa.cost.currency} ${c.nomadVisa.cost.amount.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Income */}
                    <div
                      className="flex flex-col gap-1 p-3 rounded"
                      style={{ backgroundColor: "#222222" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#CCCCCC",
                          }}
                        >
                          <TrendingUp
                            size={12}
                            style={{
                              display: "inline",
                              marginRight: "4px",
                              verticalAlign: "middle",
                            }}
                          />
                          {t("countryPage.visa.income", "Income")}
                        </span>
                        {c.nomadVisa.incomeRequirement.monthly ? (
                          <span
                            style={{
                              fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#FFFFFF",
                            }}
                          >
                            {c.nomadVisa.incomeRequirement.currency}{" "}
                            {c.nomadVisa.incomeRequirement.monthly.toLocaleString()}
                            /mo
                          </span>
                        ) : c.nomadVisa.incomeRequirement.annual ? (
                          <span
                            style={{
                              fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "10px",
                              fontWeight: 600,
                              color: "#FFFFFF",
                            }}
                          >
                            {c.nomadVisa.incomeRequirement.currency}{" "}
                            {c.nomadVisa.incomeRequirement.annual.toLocaleString()}
                            /yr
                          </span>
                        ) : (
                          <span
                            style={{
                              fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#44CC66",
                            }}
                          >
                            {t("countryPage.visa.noMinimum", "None")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tax Status */}
                    <div
                      className="flex flex-col gap-1 p-3 rounded"
                      style={{ backgroundColor: "#222222" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#CCCCCC",
                          }}
                        >
                          <Shield
                            size={12}
                            style={{
                              display: "inline",
                              marginRight: "4px",
                              verticalAlign: "middle",
                            }}
                          />
                          {t("countryPage.visa.tax", "Tax")}
                        </span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full"
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "10px",
                            fontWeight: 600,
                            backgroundColor: (
                              TAX_STATUS_COLORS[c.nomadVisa.tax.status] ??
                              TAX_STATUS_COLORS.standard
                            ).bg,
                            color: (
                              TAX_STATUS_COLORS[c.nomadVisa.tax.status] ??
                              TAX_STATUS_COLORS.standard
                            ).text,
                          }}
                        >
                          {c.nomadVisa.tax.status === "exempt"
                            ? t("countryPage.taxExemptLabel")
                            : c.nomadVisa.tax.status === "special"
                              ? t("countryPage.specialTaxLabel")
                              : t("countryPage.standardTaxLabel")}
                        </span>
                      </div>
                    </div>

                    {/* Official Link */}
                    <div
                      className="flex flex-col gap-1 p-3 rounded"
                      style={{ backgroundColor: "#222222" }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#CCCCCC",
                          marginBottom: "4px",
                        }}
                      >
                        {t(
                          "countryPage.visa.officialInfo",
                          "Official Information",
                        )}
                      </span>
                      <a
                        href={c.nomadVisa.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "10px",
                          color: "var(--color-accent)",
                          textDecoration: "none",
                          wordBreak: "break-all",
                        }}
                      >
                        {t("countryPage.visa.visitWebsite", "Visit Website →")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
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
              className="w-full flex items-center justify-center gap-2 transition-colors"
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
              {t("countryDetail.viewInList")}
            </button>
            <Link
              to={`${langPrefix}/country/${c.code.toLowerCase()}`}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 transition-colors"
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
